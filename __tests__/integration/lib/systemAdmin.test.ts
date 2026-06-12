import { describe, it, expect, vi, beforeEach, afterEach } from '@/__tests__/helpers/jestCompat';

vi.mock('@/lib/firebase', () => ({
  firebaseApp: {},
  firebaseAuth: {
    currentUser: {
      getIdToken: async () => 'mock-jwt-token',
    },
    signOut: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/i18n/language', () => ({
  getCurrentLanguage: () => 'en',
}));

import {
  createSystemHospital,
  getSystemDashboardSummary,
  listSystemHospitals,
  listSystemMunicipalities,
  updateAdminUser,
  updateAdminUserStatus,
  updateSystemHospital,
  updateSystemHospitalStatus,
} from '@/lib/systemAdmin';

function mockFetch(body: unknown, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

function lastFetchCall(spy: jest.SpyInstance) {
  return spy.mock.calls[spy.mock.calls.length - 1];
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

const HOSPITAL_INPUT = {
  code: 'H001',
  name: 'Hospital General',
  address: 'Main street',
  phone: '555-0101',
  inviteCode: 'INVITE-1',
  postalCode: '64000',
  bedCount: 100,
  doctorCount: 20,
  nurseCount: 40,
  municipalityId: 'mun-1',
  latitude: 25.67,
  longitude: -100.31,
};

const USER_INPUT = {
  fullName: 'Admin User',
  email: 'admin@example.com',
  roleCode: 'HOSPITAL_ADMIN' as const,
  hospitalId: 'hospital-1',
  status: 'ACTIVE' as const,
};

describe('systemAdmin API client', () => {
  it('calls read endpoints', async () => {
    let spy = mockFetch({ generatedAt: '2026-01-01', metrics: [] });
    await getSystemDashboardSummary();
    expect(lastFetchCall(spy)[0]).toContain('/system/dashboard/summary');

    spy = mockFetch([]);
    await listSystemHospitals();
    expect(lastFetchCall(spy)[0]).toContain('/admin/hospitals');

    spy = mockFetch([]);
    await listSystemMunicipalities();
    expect(lastFetchCall(spy)[0]).toContain('/admin/hospitals/municipalities');
  });

  it('calls hospital mutation endpoints with JSON bodies', async () => {
    let spy = mockFetch({ id: 'hospital-1', ...HOSPITAL_INPUT, active: true });
    await createSystemHospital(HOSPITAL_INPUT);
    let [url, init] = lastFetchCall(spy) as [string, RequestInit];
    expect(url).toContain('/admin/hospitals');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual(HOSPITAL_INPUT);

    spy = mockFetch({ id: 'hospital-1', ...HOSPITAL_INPUT, active: true });
    await updateSystemHospital('hospital-1', HOSPITAL_INPUT);
    [url, init] = lastFetchCall(spy) as [string, RequestInit];
    expect(url).toContain('/admin/hospitals/hospital-1');
    expect(init.method).toBe('PUT');

    spy = mockFetch({ id: 'hospital-1', ...HOSPITAL_INPUT, active: false });
    await updateSystemHospitalStatus('hospital-1', false);
    [url, init] = lastFetchCall(spy) as [string, RequestInit];
    expect(url).toContain('/admin/hospitals/hospital-1/status');
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(init.body as string)).toEqual({ active: false });
  });

  it('calls admin user mutation endpoints', async () => {
    let spy = mockFetch({ id: 'user-1', ...USER_INPUT });
    await updateAdminUser('user-1', USER_INPUT);
    let [url, init] = lastFetchCall(spy) as [string, RequestInit];
    expect(url).toContain('/admin/users/user-1');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body as string)).toEqual(USER_INPUT);

    spy = mockFetch({ id: 'user-1', ...USER_INPUT, status: 'DISABLED' });
    await updateAdminUserStatus('user-1', 'DISABLED');
    [url, init] = lastFetchCall(spy) as [string, RequestInit];
    expect(url).toContain('/admin/users/user-1/status');
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(init.body as string)).toEqual({ status: 'DISABLED' });
  });
});
