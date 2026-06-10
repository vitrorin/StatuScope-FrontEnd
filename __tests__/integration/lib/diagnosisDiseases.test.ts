/**
 * Integration tests for lib/diagnosisDiseases.ts
 *
 * Strategy:
 *  - Mock `firebaseAuth` so no real Firebase connection is needed.
 *  - Mock global `fetch` so no real HTTP calls are made.
 *  - Verify URL construction, query param handling, and response.
 */
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

import { searchDiagnosisDiseases, type DiagnosisDiseaseOption } from '@/lib/diagnosisDiseases';

// ── Fetch mock helpers ────────────────────────────────────────────────────────

function mockFetch(body: unknown, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.restoreAllMocks());

// ── Test data ─────────────────────────────────────────────────────────────────

const DISEASES: DiagnosisDiseaseOption[] = [
  { id: 'd1', code: 'COVID19', name: 'COVID-19' },
  { id: 'd2', code: 'DENGUE', name: 'Dengue' },
];

// ── searchDiagnosisDiseases ───────────────────────────────────────────────────

describe('searchDiagnosisDiseases', () => {
  it('calls GET /diagnosis/diseases', async () => {
    const spy = mockFetch(DISEASES);
    await searchDiagnosisDiseases('covid');
    const [url] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/diagnosis/diseases');
  });

  it('appends the query parameter when provided', async () => {
    const spy = mockFetch(DISEASES);
    await searchDiagnosisDiseases('covid');
    const [url] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('query=covid');
  });

  it('appends default limit=8 when not specified', async () => {
    const spy = mockFetch(DISEASES);
    await searchDiagnosisDiseases('dengue');
    const [url] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('limit=8');
  });

  it('appends custom limit when provided', async () => {
    const spy = mockFetch(DISEASES);
    await searchDiagnosisDiseases('flu', 15);
    const [url] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('limit=15');
  });

  it('omits query param when blank string is given', async () => {
    const spy = mockFetch(DISEASES);
    await searchDiagnosisDiseases('');
    const [url] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).not.toContain('query=');
    expect(url).toContain('limit=');
  });

  it('omits query param when whitespace-only string is given', async () => {
    const spy = mockFetch(DISEASES);
    await searchDiagnosisDiseases('   ');
    const [url] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).not.toContain('query=');
  });

  it('trims whitespace from query before appending', async () => {
    const spy = mockFetch(DISEASES);
    await searchDiagnosisDiseases('  dengue  ');
    const [url] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('query=dengue');
    expect(url).not.toContain('query=+dengue');
  });

  it('returns the list of disease options', async () => {
    mockFetch(DISEASES);
    const result = await searchDiagnosisDiseases('covid');
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('COVID-19');
    expect(result[1].code).toBe('DENGUE');
  });

  it('returns empty array when server returns []', async () => {
    mockFetch([]);
    const result = await searchDiagnosisDiseases('xyz');
    expect(result).toHaveLength(0);
  });

  it('sets Authorization header with Firebase token', async () => {
    const spy = mockFetch(DISEASES);
    await searchDiagnosisDiseases('covid');
    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init?.headers);
    expect(headers.get('Authorization')).toBe('Bearer mock-jwt-token');
  });

  it('throws on non-2xx response', async () => {
    mockFetch({ error: 'Unauthorized' }, 401);
    await expect(searchDiagnosisDiseases('covid')).rejects.toThrow();
  });
});
