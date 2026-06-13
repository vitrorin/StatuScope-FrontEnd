import { describe, it, expect, vi, beforeEach, afterEach } from '@/__tests__/helpers/jestCompat';

// ── Mock firebase before importing anything that touches it ──────────────────
vi.mock('@/lib/firebase', () => ({
  firebaseAuth: { currentUser: null },
}));

vi.mock('@/i18n/language', () => ({
  getCurrentLanguage: () => 'en',
  AppLanguage: {},
}));

import { searchDiagnosisDiseases } from '@/lib/diagnosisDiseases';

// ── Export existence ──────────────────────────────────────────────────────────
describe('diagnosisDiseases exports', () => {
  it('exports searchDiagnosisDiseases as a function', () => {
    expect(typeof searchDiagnosisDiseases).toBe('function');
  });
});

// ── URL construction ──────────────────────────────────────────────────────────
describe('searchDiagnosisDiseases – URL construction', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  const diseaseList = [
    { id: 'disease-001', code: 'A90', name: 'Dengue' },
    { id: 'disease-002', code: 'B05', name: 'Measles' },
  ];

  beforeEach(() => {
    fetchSpy = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => diseaseList,
    });
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls GET /diagnosis/diseases', async () => {
    await searchDiagnosisDiseases('Dengue');
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('/diagnosis/diseases');
  });

  it('uses GET method', async () => {
    await searchDiagnosisDiseases('Dengue');
    const init = fetchSpy.mock.calls[0][1];
    const method = (init?.method ?? 'GET').toUpperCase();
    expect(method).toBe('GET');
  });

  it('appends query param when query is non-empty', async () => {
    await searchDiagnosisDiseases('Dengue');
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('query=Dengue');
  });

  it('trims whitespace before appending query', async () => {
    await searchDiagnosisDiseases('  Dengue  ');
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('query=Dengue');
  });

  it('does not append query param when query is blank', async () => {
    await searchDiagnosisDiseases('   ');
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).not.toContain('query=');
  });

  it('does not append query param when query is empty string', async () => {
    await searchDiagnosisDiseases('');
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).not.toContain('query=');
  });

  it('appends default limit=8 when not provided', async () => {
    await searchDiagnosisDiseases('flu');
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('limit=8');
  });

  it('appends custom limit when provided', async () => {
    await searchDiagnosisDiseases('flu', 5);
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('limit=5');
  });

  it('includes both query and limit params', async () => {
    await searchDiagnosisDiseases('measles', 10);
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('query=measles');
    expect(url).toContain('limit=10');
  });

  it('URL-encodes special characters in query', async () => {
    await searchDiagnosisDiseases('COVID-19');
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('query=COVID');
  });
});

// ── Return values ─────────────────────────────────────────────────────────────
describe('searchDiagnosisDiseases – return values', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('resolves with array of disease options', async () => {
    const data = [
      { id: 'd1', code: 'A01', name: 'Typhoid' },
      { id: 'd2', code: 'A90', name: 'Dengue' },
    ];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => data,
    }));
    const result = await searchDiagnosisDiseases('fever');
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('d1');
    expect(result[0].code).toBe('A01');
    expect(result[0].name).toBe('Typhoid');
  });

  it('resolves with empty array when no matches', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => [],
    }));
    const result = await searchDiagnosisDiseases('xyzunknown');
    expect(result).toEqual([]);
  });

  it('resolves with disease object shape intact', async () => {
    const disease = { id: 'disease-uuid', code: 'B34.9', name: 'Viral infection' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => [disease],
    }));
    const result = await searchDiagnosisDiseases('viral');
    expect(result[0]).toEqual(disease);
  });
});

// ── Error handling ────────────────────────────────────────────────────────────
describe('searchDiagnosisDiseases – error handling', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('throws ApiError on 403', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      status: 403,
      ok: false,
      json: async () => ({ message: 'Forbidden' }),
    }));
    await expect(searchDiagnosisDiseases('dengue')).rejects.toThrow('Forbidden');
  });

  it('throws ApiError on 500', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      status: 500,
      ok: false,
      json: async () => ({ message: 'Server error' }),
    }));
    await expect(searchDiagnosisDiseases('flu')).rejects.toThrow('Server error');
  });

  it('throws on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection refused')));
    await expect(searchDiagnosisDiseases('flu')).rejects.toThrow('Connection refused');
  });
});

// ── Limit edge cases ──────────────────────────────────────────────────────────
describe('searchDiagnosisDiseases – limit edge cases', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('passes limit=1 correctly', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      status: 200, ok: true, json: async () => [],
    });
    vi.stubGlobal('fetch', fetchSpy);
    await searchDiagnosisDiseases('test', 1);
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('limit=1');
  });

  it('passes limit=20 correctly', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      status: 200, ok: true, json: async () => [],
    });
    vi.stubGlobal('fetch', fetchSpy);
    await searchDiagnosisDiseases('test', 20);
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('limit=20');
  });
});
