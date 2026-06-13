import React from 'react';
import { Platform, Text } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, waitFor } from '@testing-library/react-native';
import { afterEach, describe, expect, it, vi } from '@/__tests__/helpers/jestCompat';
import { AuthProvider, useAuth, AuthContextValue } from '@/contexts/AuthContext';

const mockApi = vi.fn();
const mockEnsureWebSessionPersistence = vi.fn();
const mockSignInWithEmailAndPassword = vi.fn();
const mockSignOut = vi.fn();
const mockUnsubscribe = vi.fn();
let mockAuthStateCallback: ((user: unknown) => void | Promise<void>) | null = null;
let latestAuth: AuthContextValue | null = null;

jest.mock('@/lib/api', () => ({
  api: (...args: unknown[]) => mockApi(...args),
}));

jest.mock('@/lib/firebase', () => ({
  firebaseAuth: {},
  ensureWebSessionPersistence: () => mockEnsureWebSessionPersistence(),
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: (...args: unknown[]) => mockSignInWithEmailAndPassword(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
  onAuthStateChanged: (_auth: unknown, callback: (user: unknown) => void | Promise<void>) => {
    mockAuthStateCallback = callback;
    void callback(null);
    return mockUnsubscribe;
  },
}));

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
}

function Probe() {
  latestAuth = useAuth();
  return <Text>{latestAuth.loading ? 'loading' : latestAuth.profile?.fullName ?? 'anonymous'}</Text>;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { message: string | null }> {
  state = { message: null };

  componentDidCatch(error: Error) {
    this.setState({ message: error.message });
  }

  render() {
    return this.state.message ? <Text>{this.state.message}</Text> : this.props.children;
  }
}

function renderProvider() {
  return render(
    <QueryClientProvider client={makeClient()}>
      <AuthProvider>
        <Probe />
      </AuthProvider>
    </QueryClientProvider>
  );
}

const RAW_PROFILE = {
  id: 'u1',
  email: 'doctor@example.com',
  fullName: 'Doctor User',
  hospitalId: 'h1',
  hospitalName: 'Hospital',
  roles: null,
  privileges: null,
};
const originalPlatformOS = Platform.OS;

describe('AuthContext', () => {
  afterEach(async () => {
    await cleanup();
    vi.clearAllMocks();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    Object.defineProperty(Platform, 'OS', {
      value: originalPlatformOS,
      configurable: true,
    });
    latestAuth = null;
    mockAuthStateCallback = null;
  });

  it('throws when useAuth is called outside AuthProvider', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    function OutsideProviderProbe() {
      useAuth();
      return <Text>outside</Text>;
    }

    const screen = await render(
      <ErrorBoundary>
        <OutsideProviderProbe />
      </ErrorBoundary>
    );

    expect(screen.getByText('useAuth must be used inside <AuthProvider>')).toBeTruthy();
    consoleSpy.mockRestore();
  });

  it('starts anonymous, logs in, checks permissions and logs out', async () => {
    const screen = await renderProvider();

    await waitFor(() => expect(screen.getByText('anonymous')).toBeTruthy());
    expect(latestAuth?.hasRole('DOCTOR')).toBe(false);
    expect(latestAuth?.hasPrivilege('diagnosis.assist')).toBe(false);

    mockSignInWithEmailAndPassword.mockResolvedValueOnce({});
    mockEnsureWebSessionPersistence.mockResolvedValueOnce(undefined);
    mockApi.mockResolvedValueOnce({
      ...RAW_PROFILE,
      roles: ['DOCTOR'],
      privileges: ['diagnosis.assist'],
    });

    await act(async () => {
      await latestAuth?.login('doctor@example.com', 'secret');
    });

    expect(mockEnsureWebSessionPersistence).toHaveBeenCalledTimes(1);
    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith({}, 'doctor@example.com', 'secret');
    expect(latestAuth?.profile?.roles).toEqual(['DOCTOR']);
    expect(latestAuth?.hasRole('DOCTOR')).toBe(true);
    expect(latestAuth?.hasPrivilege('diagnosis.assist')).toBe(true);
    expect(latestAuth?.isAdmin()).toBe(false);
    expect(latestAuth?.isSystemAdmin()).toBe(false);

    mockSignOut.mockResolvedValueOnce(undefined);

    await act(async () => {
      await latestAuth?.logout();
    });

    expect(mockSignOut).toHaveBeenCalledWith({});
    expect(latestAuth?.profile).toBeNull();
  });

  it('registers a user and normalizes nullable roles and privileges', async () => {
    await renderProvider();
    await waitFor(() => expect(latestAuth?.loading).toBe(false));

    mockApi
      .mockResolvedValueOnce({ ...RAW_PROFILE })
      .mockResolvedValueOnce({ ...RAW_PROFILE });
    mockSignInWithEmailAndPassword.mockResolvedValueOnce({});
    mockEnsureWebSessionPersistence.mockResolvedValueOnce(undefined);

    await act(async () => {
      await latestAuth?.register({
        fullName: 'Doctor User',
        email: 'doctor@example.com',
        password: 'secret123',
        inviteCode: 'INVITE-1',
      });
    });

    expect(mockApi).toHaveBeenCalledWith('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Doctor User',
        email: 'doctor@example.com',
        password: 'secret123',
        inviteCode: 'INVITE-1',
      }),
    });
    expect(latestAuth?.profile?.roles).toEqual([]);
    expect(latestAuth?.profile?.privileges).toEqual([]);
  });

  it('hydrates profile from firebase auth state and clears it on API failure', async () => {
    await renderProvider();
    await waitFor(() => expect(latestAuth?.loading).toBe(false));

    mockApi.mockResolvedValueOnce({
      ...RAW_PROFILE,
      roles: ['SYSTEM_ADMIN'],
      privileges: [],
    });

    await act(async () => {
      await mockAuthStateCallback?.({ uid: 'firebase-user' });
    });

    expect(latestAuth?.isSystemAdmin()).toBe(true);

    mockApi.mockRejectedValueOnce(new Error('backend unavailable'));
    mockSignOut.mockResolvedValueOnce(undefined);

    await act(async () => {
      await mockAuthStateCallback?.({ uid: 'firebase-user' });
    });

    expect(mockSignOut).toHaveBeenCalledWith({});
    expect(latestAuth?.profile).toBeNull();
  });

  it('registers web inactivity listeners and logs out after the timeout', async () => {
    vi.useFakeTimers();
    Object.defineProperty(Platform, 'OS', {
      value: 'web',
      configurable: true,
    });

    const windowMock = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal('window', windowMock);

    await renderProvider();
    await waitFor(() => expect(latestAuth?.loading).toBe(false));

    mockApi.mockResolvedValueOnce({
      ...RAW_PROFILE,
      roles: ['HOSPITAL_ADMIN'],
      privileges: ['isSystemAdmin'],
    });
    mockSignOut.mockResolvedValue(undefined);

    await act(async () => {
      await mockAuthStateCallback?.({ uid: 'firebase-user' });
    });

    expect(latestAuth?.isAdmin()).toBe(true);
    expect(latestAuth?.isSystemAdmin()).toBe(true);
    expect(windowMock.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), { passive: true });

    await act(async () => {
      vi.advanceTimersByTime(15 * 60 * 1000);
    });

    expect(mockSignOut).toHaveBeenCalledWith({});
  });
});
