/**
 * Integration tests for lib/adminUsers.ts
 *
 * Strategy:
 *  - Mock `firebaseAuth` so no real Firebase connection is needed.
 *  - Mock global `fetch` so no real HTTP calls are made.
 *  - Verify the correct endpoint, HTTP method, and request body are used
 *    for each exported function.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from '@/__tests__/helpers/jestCompat';

// ── Firebase mock ─────────────────────────────────────────────────────────────
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
  listAdminUsers,
  createAdminUser,
  disableAdminUser,
} from '@/lib/adminUsers';

// ── Fetch mock helpers ────────────────────────────────────────────────────────

function mockFetch(body: unknown, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Test data ─────────────────────────────────────────────────────────────────

const BASE = 'http://localhost:8080';

const USER_RECORD = {
  id: 'user-001',
  fullName: 'Dr. Ana López',
  email: 'ana.lopez@hospital.mx',
  hospitalId: 'hosp-01',
  hospitalName: 'Hospital General de Zona No. 21',
  status: 'ACTIVE' as const,
  roleCodes: ['DOCTOR' as const],
};

const ADMIN_USER_RECORD = {
  id: 'user-002',
  fullName: 'Admin García',
  email: 'admin.garcia@hospital.mx',
  hospitalId: 'hosp-01',
  hospitalName: 'Hospital General de Zona No. 21',
  status: 'ACTIVE' as const,
  roleCodes: ['HOSPITAL_ADMIN' as const],
};

// ── listAdminUsers ────────────────────────────────────────────────────────────

describe('listAdminUsers', () => {
  it('calls GET /admin/users', async () => {
    const spy = mockFetch([USER_RECORD]);
    await listAdminUsers();
    const [url, init] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/users`);
    expect(init?.method).toBeUndefined(); // defaults to GET
  });

  it('returns the full user array', async () => {
    mockFetch([USER_RECORD, ADMIN_USER_RECORD]);
    const result = await listAdminUsers();
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('user-001');
    expect(result[1].roleCodes).toContain('HOSPITAL_ADMIN');
  });

  it('includes Authorization header', async () => {
    const spy = mockFetch([USER_RECORD]);
    await listAdminUsers();
    const [, init] = spy.mock.calls[0] as [string, RequestInit?];
    const headers = new Headers(init?.headers);
    expect(headers.get('Authorization')).toBe('Bearer mock-jwt-token');
  });

  it('returns an empty array when backend returns []', async () => {
    mockFetch([]);
    const result = await listAdminUsers();
    expect(result).toEqual([]);
  });
});

// ── createAdminUser ────────────────────────────────────────────────────────────

describe('createAdminUser', () => {
  const NEW_USER_INPUT = {
    fullName: 'Dr. Pedro Ramírez',
    email: 'pedro.ramirez@hospital.mx',
    password: 'Secur3Pass!',
    roleCode: 'DOCTOR' as const,
    hospitalId: 'hosp-01',
  };

  it('calls POST /admin/users', async () => {
    const spy = mockFetch({ ...USER_RECORD, id: 'user-003' }, 201);
    await createAdminUser(NEW_USER_INPUT);
    const [url, init] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/users`);
    expect(init?.method).toBe('POST');
  });

  it('sends the correct JSON body', async () => {
    const spy = mockFetch({ ...USER_RECORD, id: 'user-003' }, 201);
    await createAdminUser(NEW_USER_INPUT);
    const [, init] = spy.mock.calls[0] as [string, RequestInit?];
    const parsed = JSON.parse(init?.body as string);
    expect(parsed.fullName).toBe('Dr. Pedro Ramírez');
    expect(parsed.email).toBe('pedro.ramirez@hospital.mx');
    expect(parsed.roleCode).toBe('DOCTOR');
    expect(parsed.hospitalId).toBe('hosp-01');
  });

  it('sends Content-Type: application/json', async () => {
    const spy = mockFetch({}, 201);
    await createAdminUser(NEW_USER_INPUT);
    const [, init] = spy.mock.calls[0] as [string, RequestInit?];
    const headers = new Headers(init?.headers);
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('works without optional hospitalId', async () => {
    const spy = mockFetch({}, 201);
    const input = { fullName: 'Nuevo Doctor', email: 'nuevo@hospital.mx', password: 'pass123!', roleCode: 'DOCTOR' as const };
    await createAdminUser(input);
    const [, init] = spy.mock.calls[0] as [string, RequestInit?];
    const parsed = JSON.parse(init?.body as string);
    expect(parsed.hospitalId).toBeUndefined();
  });
});

// ── disableAdminUser ──────────────────────────────────────────────────────────

/** 204 No Content responses must not include a body. */
function mockFetchNoContent() {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(null, { status: 200 }),
  );
}

describe('disableAdminUser', () => {
  it('calls PATCH /admin/users/:id/status', async () => {
    const spy = mockFetchNoContent();
    await disableAdminUser('user-001');
    const [url, init] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/admin/users/user-001/status`);
    expect(init?.method).toBe('PATCH');
  });

  it('uses the provided userId in the path', async () => {
    const spy = mockFetchNoContent();
    await disableAdminUser('user-xyz-999');
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toContain('user-xyz-999');
  });

  it('includes Authorization header', async () => {
    const spy = mockFetchNoContent();
    await disableAdminUser('user-001');
    const [, init] = spy.mock.calls[0] as [string, RequestInit?];
    const headers = new Headers(init?.headers);
    expect(headers.get('Authorization')).toBe('Bearer mock-jwt-token');
  });
});
