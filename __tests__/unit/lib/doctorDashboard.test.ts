import { describe, it, expect, vi, beforeEach, afterEach } from '@/__tests__/helpers/jestCompat';

// ── Mock firebase before importing anything that touches it ──────────────────
vi.mock('@/lib/firebase', () => ({
  firebaseAuth: { currentUser: null },
}));

vi.mock('@/i18n/language', () => ({
  getCurrentLanguage: () => 'en',
  AppLanguage: {},
}));

import {
  radiusQuery,
  getDoctorDashboardSummary,
  getDoctorDashboardMetrics,
  getDoctorDashboardMap,
  getDoctorDashboardStateMap,
  getDoctorDashboardDiseaseCatalog,
  getDoctorDashboardStateOutbreakMap,
  getDoctorDashboardAlerts,
  getDoctorDashboardLocalBreakdown,
  getDoctorDashboardStateBreakdown,
  getDoctorDashboardReport,
  getDoctorDashboardStateReport,
  getAdminEpidemiologySummary,
  getAdminEpidemiologyMetrics,
  getAdminEpidemiologyMap,
  getAdminEpidemiologyStateMap,
  getAdminEpidemiologyDiseaseCatalog,
  getAdminEpidemiologyStateOutbreakMap,
  getAdminEpidemiologyAlerts,
  getAdminEpidemiologyLocalBreakdown,
  getAdminEpidemiologyStateBreakdown,
  getAdminEpidemiologyReport,
  getAdminEpidemiologyStateReport,
} from '@/lib/doctorDashboard';

// ── radiusQuery helper ────────────────────────────────────────────────────────
// We need to expose radiusQuery. Since it's not exported, test through the API
// functions that use it. But first let's verify basic export presence.

describe('doctorDashboard exports', () => {
  it('exports getDoctorDashboardSummary', () => {
    expect(typeof getDoctorDashboardSummary).toBe('function');
  });
  it('exports getDoctorDashboardMetrics', () => {
    expect(typeof getDoctorDashboardMetrics).toBe('function');
  });
  it('exports getDoctorDashboardMap', () => {
    expect(typeof getDoctorDashboardMap).toBe('function');
  });
  it('exports getDoctorDashboardStateMap', () => {
    expect(typeof getDoctorDashboardStateMap).toBe('function');
  });
  it('exports getDoctorDashboardDiseaseCatalog', () => {
    expect(typeof getDoctorDashboardDiseaseCatalog).toBe('function');
  });
  it('exports getDoctorDashboardStateOutbreakMap', () => {
    expect(typeof getDoctorDashboardStateOutbreakMap).toBe('function');
  });
  it('exports getDoctorDashboardAlerts', () => {
    expect(typeof getDoctorDashboardAlerts).toBe('function');
  });
  it('exports getDoctorDashboardLocalBreakdown', () => {
    expect(typeof getDoctorDashboardLocalBreakdown).toBe('function');
  });
  it('exports getDoctorDashboardStateBreakdown', () => {
    expect(typeof getDoctorDashboardStateBreakdown).toBe('function');
  });
  it('exports getDoctorDashboardReport', () => {
    expect(typeof getDoctorDashboardReport).toBe('function');
  });
  it('exports getDoctorDashboardStateReport', () => {
    expect(typeof getDoctorDashboardStateReport).toBe('function');
  });
});

// ── API call URL construction (via fetch spy) ─────────────────────────────────
describe('doctorDashboard API – URL construction', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getDoctorDashboardSummary calls /doctor/dashboard/summary without param', async () => {
    await getDoctorDashboardSummary().catch(() => {});
    expect(fetchSpy).toHaveBeenCalledOnce();
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('/doctor/dashboard/summary');
    expect(url).not.toContain('radiusKm');
  });

  it('getDoctorDashboardSummary appends radiusKm when provided', async () => {
    await getDoctorDashboardSummary(50).catch(() => {});
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('radiusKm=50');
  });

  it('getDoctorDashboardMetrics calls /doctor/dashboard/metrics', async () => {
    await getDoctorDashboardMetrics().catch(() => {});
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('/doctor/dashboard/metrics');
    expect(url).not.toContain('radiusKm');
  });

  it('getDoctorDashboardMetrics appends radiusKm', async () => {
    await getDoctorDashboardMetrics(75).catch(() => {});
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('radiusKm=75');
  });

  it('getDoctorDashboardMap calls /doctor/dashboard/map', async () => {
    await getDoctorDashboardMap().catch(() => {});
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('/doctor/dashboard/map');
  });

  it('getDoctorDashboardMap appends radiusKm', async () => {
    await getDoctorDashboardMap(100).catch(() => {});
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('radiusKm=100');
  });

  it('getDoctorDashboardStateMap calls /doctor/dashboard/map/states', async () => {
    await getDoctorDashboardStateMap().catch(() => {});
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('/doctor/dashboard/map/states');
  });

  it('getDoctorDashboardDiseaseCatalog calls /doctor/dashboard/diseases', async () => {
    await getDoctorDashboardDiseaseCatalog().catch(() => {});
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('/doctor/dashboard/diseases');
  });

  it('getDoctorDashboardStateOutbreakMap encodes stateId in path', async () => {
    const stateId = 'abc-123';
    await getDoctorDashboardStateOutbreakMap(stateId).catch(() => {});
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain(`/doctor/dashboard/map/states/${stateId}/outbreaks`);
  });

  it('getDoctorDashboardAlerts calls /doctor/dashboard/alerts', async () => {
    await getDoctorDashboardAlerts().catch(() => {});
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('/doctor/dashboard/alerts');
  });

  it('getDoctorDashboardAlerts appends radiusKm', async () => {
    await getDoctorDashboardAlerts(30).catch(() => {});
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('radiusKm=30');
  });

  it('getDoctorDashboardLocalBreakdown calls disease-breakdown/local', async () => {
    await getDoctorDashboardLocalBreakdown().catch(() => {});
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('/doctor/dashboard/disease-breakdown/local');
  });

  it('getDoctorDashboardStateBreakdown calls disease-breakdown/state', async () => {
    await getDoctorDashboardStateBreakdown().catch(() => {});
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('/doctor/dashboard/disease-breakdown/state');
  });

  it('getDoctorDashboardReport encodes scope in path', async () => {
    await getDoctorDashboardReport('local').catch(() => {});
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('/doctor/dashboard/reports/local');
  });

  it('getDoctorDashboardReport appends radiusKm', async () => {
    await getDoctorDashboardReport('both', 20).catch(() => {});
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('/doctor/dashboard/reports/both');
    expect(url).toContain('radiusKm=20');
  });

  it('getDoctorDashboardStateReport encodes stateId in path', async () => {
    const stateId = 'state-uuid-xyz';
    await getDoctorDashboardStateReport(stateId).catch(() => {});
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain(`/doctor/dashboard/reports/states/${encodeURIComponent(stateId)}`);
  });

  it('admin epidemiology endpoints use the admin base path', async () => {
    await getAdminEpidemiologySummary(10).catch(() => {});
    await getAdminEpidemiologyMetrics(10).catch(() => {});
    await getAdminEpidemiologyMap(10).catch(() => {});
    await getAdminEpidemiologyStateMap().catch(() => {});
    await getAdminEpidemiologyDiseaseCatalog().catch(() => {});
    await getAdminEpidemiologyStateOutbreakMap('nuevo leon').catch(() => {});
    await getAdminEpidemiologyAlerts(10).catch(() => {});
    await getAdminEpidemiologyLocalBreakdown(10).catch(() => {});
    await getAdminEpidemiologyStateBreakdown(10).catch(() => {});
    await getAdminEpidemiologyReport('state', 10).catch(() => {});
    await getAdminEpidemiologyStateReport('state 1').catch(() => {});

    const urls = fetchSpy.mock.calls.map((call: unknown[]) => String(call[0]));
    expect(urls).toEqual(expect.arrayContaining([
      expect.stringContaining('/admin/epidemiology/summary?radiusKm=10'),
      expect.stringContaining('/admin/epidemiology/metrics?radiusKm=10'),
      expect.stringContaining('/admin/epidemiology/map?radiusKm=10'),
      expect.stringContaining('/admin/epidemiology/map/states'),
      expect.stringContaining('/admin/epidemiology/diseases'),
      expect.stringContaining('/admin/epidemiology/map/states/nuevo leon/outbreaks'),
      expect.stringContaining('/admin/epidemiology/alerts?radiusKm=10'),
      expect.stringContaining('/admin/epidemiology/disease-breakdown/local?radiusKm=10'),
      expect.stringContaining('/admin/epidemiology/disease-breakdown/state?radiusKm=10'),
      expect.stringContaining('/admin/epidemiology/reports/state?radiusKm=10'),
      expect.stringContaining(`/admin/epidemiology/reports/states/${encodeURIComponent('state 1')}`),
    ]));
  });
});

// ── radiusQuery edge-cases via URL inspection ─────────────────────────────────
describe('radiusQuery edge cases (via getDoctorDashboardSummary)', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not append radiusKm when undefined', async () => {
    await getDoctorDashboardSummary(undefined).catch(() => {});
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).not.toContain('radiusKm');
  });

  it('appends radiusKm=0 when value is exactly 0', async () => {
    await getDoctorDashboardSummary(0).catch(() => {});
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('radiusKm=0');
  });

  it('appends decimal radiusKm correctly', async () => {
    await getDoctorDashboardSummary(12.5).catch(() => {});
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('radiusKm=12.5');
  });
});

// ── HTTP method used (GET) ────────────────────────────────────────────────────
describe('doctorDashboard HTTP method', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getDoctorDashboardSummary uses GET', async () => {
    await getDoctorDashboardSummary().catch(() => {});
    const init = fetchSpy.mock.calls[0][1];
    // No method means GET by default, or explicit GET
    const method = (init?.method ?? 'GET').toUpperCase();
    expect(method).toBe('GET');
  });
});

// ── Return value shape ─────────────────────────────────────────────────────────
describe('doctorDashboard return values', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  const summaryPayload = {
    hospitalName: 'Test Hospital',
    municipalityName: 'Monterrey',
    stateName: 'Nuevo León',
    radiusKm: 50,
    generatedAt: '2026-01-01T00:00:00',
    metrics: [],
    diseaseBreakdown: [],
    stateDiseaseBreakdown: [],
    alerts: [],
    zones: [],
  };

  beforeEach(() => {
    fetchSpy = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => summaryPayload,
    });
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getDoctorDashboardSummary resolves with the full summary object', async () => {
    const result = await getDoctorDashboardSummary();
    expect(result.hospitalName).toBe('Test Hospital');
    expect(result.radiusKm).toBe(50);
  });

  it('getDoctorDashboardMetrics resolves with metrics payload', async () => {
    const metricsPayload = { metrics: [], hospitalName: 'Hospital X' };
    fetchSpy.mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => metricsPayload,
    });
    const result = await getDoctorDashboardMetrics();
    expect(result.hospitalName).toBe('Hospital X');
    expect(result.metrics).toEqual([]);
  });
});

// ── Error propagation ─────────────────────────────────────────────────────────
describe('doctorDashboard error handling', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('throws ApiError on 404 response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      status: 404,
      ok: false,
      json: async () => ({ code: 'NOT_FOUND', message: 'Not found' }),
    }));
    await expect(getDoctorDashboardSummary()).rejects.toThrow('Not found');
  });

  it('throws ApiError on 403 response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      status: 403,
      ok: false,
      json: async () => ({ code: 'FORBIDDEN', message: 'Forbidden' }),
    }));
    await expect(getDoctorDashboardMetrics()).rejects.toThrow('Forbidden');
  });

  it('throws ApiError on 500 response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      status: 500,
      ok: false,
      json: async () => ({ message: 'Server Error' }),
    }));
    await expect(getDoctorDashboardMap()).rejects.toThrow('Server Error');
  });

  it('throws on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    await expect(getDoctorDashboardAlerts()).rejects.toThrow('Network error');
  });
});
