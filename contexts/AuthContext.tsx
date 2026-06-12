import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { useQueryClient } from '@tanstack/react-query';
import { ensureWebSessionPersistence, firebaseAuth } from '@/lib/firebase';
import { api } from '@/lib/api';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  hospitalId: string | null;
  hospitalName: string | null;
  roles: string[];
  privileges: string[];
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  inviteCode: string;
}

export interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (payload: RegisterPayload) => Promise<UserProfile>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPrivilege: (priv: string) => boolean;
  isAdmin: () => boolean;
  isSystemAdmin: () => boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const WEB_INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

type RawProfile = Omit<UserProfile, 'roles' | 'privileges'> & {
  roles: string[] | null | undefined;
  privileges: string[] | null | undefined;
};

function normalizeProfile(raw: RawProfile): UserProfile {
  return {
    ...raw,
    roles: raw.roles ?? [],
    privileges: raw.privileges ?? [],
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSessionState = useCallback(() => {
    setProfile(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const me = await api<RawProfile>('/auth/me');
          setProfile(normalizeProfile(me));
        } catch {
          await signOut(firebaseAuth).catch(() => undefined);
          clearSessionState();
        }
      } else {
        clearSessionState();
      }
      setLoading(false);
    });
  }, [clearSessionState]);

  const login = async (email: string, password: string) => {
    await ensureWebSessionPersistence();
    await signInWithEmailAndPassword(firebaseAuth, email, password);
    const me = normalizeProfile(await api<RawProfile>('/auth/me'));
    setProfile(me);
    return me;
  };

  const register = async (payload: RegisterPayload) => {
    await api<RawProfile>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return login(payload.email, payload.password);
  };

  const logout = useCallback(async () => {
    await signOut(firebaseAuth);
    clearSessionState();
  }, [clearSessionState]);

  useEffect(() => {
    if (Platform.OS !== 'web' || !firebaseUser || typeof window === 'undefined') return undefined;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        void logout();
      }, WEB_INACTIVITY_TIMEOUT_MS);
    };

    const events = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'] as const;
    events.forEach((eventName) => window.addEventListener(eventName, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach((eventName) => window.removeEventListener(eventName, resetTimer));
    };
  }, [firebaseUser, logout]);

  const hasRole = (r: string) => !!profile?.roles?.includes(r);
  const hasPrivilege = (p: string) => !!profile?.privileges?.includes(p);
  const isAdmin = () => hasRole('HOSPITAL_ADMIN');
  const isSystemAdmin = () => hasRole('SYSTEM_ADMIN') || hasPrivilege('isSystemAdmin');

  return (
    <AuthContext.Provider
      value={{ firebaseUser, profile, loading, login, register, logout, hasRole, hasPrivilege, isAdmin, isSystemAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
