/**
 * Integration tests for lib/doctorDashboard.ts
 *
 * Strategy:
 *  - Mock `firebaseAuth` (the Firebase auth singleton) so no real Firebase
 *    connection is needed.
 *  - Mock global `fetch` so no real HTTP calls are made.
 *  - Each test verifies the correct endpoint is called and the response is
 *    returned unchanged.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from '@/__tests__/helpers/jestCompat';

// ── Firebase mock ─────────────────────────────────────────────────────────────
// Must be declared BEFORE the module under test is imported so that vi.mock
// hoisting picks it up correctly.
vi.mock('@/lib/firebase', () => ({
  firebaseApp: {},
  firebaseAuth: {
    currentUser: {
      getIdToken: async () => 'mock-jwt-token',
    },
    signOut: vi.fn().mockResolvedValue(undefined),
  },
}));

// Also mock the i18n language helper used by api.ts
vi.mock('@/i18n/language', () => ({
  getCurrentLanguage: () => 'en',
}));

import {
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
} from '@/lib/doctorDashboard';

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

const SUMMARY_RESPONSE = {
  hospitalName: 'HGZ-21',
  radiusKm: 75,
  generatedAt: '2026-05-31T00:00:00Z',
  metrics: [],
  diseaseBreakdown: [],
  stateDiseaseBreakdown: [],
  alerts: [],
  zones: [],
};

const METRICS_RESPONSE = {
  hospitalName: 'HGZ-21',
  metrics: [
    { id: 'active-cases-nearby', title: 'Active Cases', value: '47', badge: 'HIGH', status: 'danger', subtitle: null, detailSummary: '', signalLabel: '', recommendedAction: '' },
  ],
};

const MAP_RESPONSE = {
  zones: [],
  diseaseBreakdown: [],
  generatedAt: '2026-05-31T00:00:00Z',
  radiusKm: 75,
};

const STATE_MAP_RESPONSE = {
  states: [
    { stateId: 'MX-CMX', stateName: 'CDMX', latitude: 19.43, longitude: -99.13, outbreakCount: 4, caseCount: 95 },
  ],
};

const DISEASE_CATALOG_RESPONSE = {
  diseases: [
    { id: 'd1', code: 'DENGUE', name: 'Dengue' },
  ],
};

const ALERTS_RESPONSE = {
  alerts: [
    { id: 'a1', title: 'Dengue activity', description: 'desc', variant: 'warning', area: 'Iztapalapa', priority: 'URGENT', recommendedAction: 'Monitor', caseCount: 12, caseLabel: null, confirmationStatus: 'SUSPECTED', municipalityName: 'Iztapalapa', stateName: 'CDMX' },
  ],
};

const BREAKDOWN_RESPONSE = {
  diseaseBreakdown: [
    { diseaseName: 'Dengue', caseCount: 12, outbreakCount: 1, progress: 60 },
  ],
  municipalityName: 'Iztapalapa',
  stateName: 'CDMX',
};

const REPORT_RESPONSE = {
  scope: 'local' as const,
  hospitalName: 'HGZ-21',
  municipalityName: 'Iztapalapa',
  stateName: 'CDMX',
  generatedAt: '2026-05-31T00:00:00Z',
  outbreaks: [],
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('getDoctorDashboardSummary', () => {
  it('calls GET /doctor/dashboard/summary without radiusKm', async () => {
    const spy = mockFetch(SUMMARY_RESPONSE);
    const result = await getDoctorDashboardSummary();
    expect(spy).toHaveBeenCalledOnce();
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/doctor/dashboard/summary`);
    expect(result).toEqual(SUMMARY_RESPONSE);
  });

  it('appends ?radiusKm when provided', async () => {
    const spy = mockFetch(SUMMARY_RESPONSE);
    await getDoctorDashboardSummary(75);
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/doctor/dashboard/summary?radiusKm=75`);
  });

  it('includes Authorization header with the Firebase token', async () => {
    const spy = mockFetch(SUMMARY_RESPONSE);
    await getDoctorDashboardSummary();
    const [, init] = spy.mock.calls[0] as [string, RequestInit?];
    const headers = new Headers(init?.headers);
    expect(headers.get('Authorization')).toBe('Bearer mock-jwt-token');
  });
});

describe('getDoctorDashboardMetrics', () => {
  it('calls GET /doctor/dashboard/metrics without radiusKm', async () => {
    const spy = mockFetch(METRICS_RESPONSE);
    const result = await getDoctorDashboardMetrics();
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/doctor/dashboard/metrics`);
    expect(result).toEqual(METRICS_RESPONSE);
  });

  it('appends ?radiusKm=35 when 35 is passed', async () => {
    const spy = mockFetch(METRICS_RESPONSE);
    await getDoctorDashboardMetrics(35);
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/doctor/dashboard/metrics?radiusKm=35`);
  });

  it('returns the full metrics array', async () => {
    mockFetch(METRICS_RESPONSE);
    const result = await getDoctorDashboardMetrics();
    expect(result.metrics).toHaveLength(1);
    expect(result.metrics[0].id).toBe('active-cases-nearby');
  });
});

describe('getDoctorDashboardMap', () => {
  it('calls GET /doctor/dashboard/map without radiusKm', async () => {
    const spy = mockFetch(MAP_RESPONSE);
    await getDoctorDashboardMap();
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/doctor/dashboard/map`);
  });

  it('appends ?radiusKm=150 when 150 is passed', async () => {
    const spy = mockFetch(MAP_RESPONSE);
    await getDoctorDashboardMap(150);
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/doctor/dashboard/map?radiusKm=150`);
  });
});

describe('getDoctorDashboardStateMap', () => {
  it('calls GET /doctor/dashboard/map/states', async () => {
    const spy = mockFetch(STATE_MAP_RESPONSE);
    const result = await getDoctorDashboardStateMap();
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/doctor/dashboard/map/states`);
    expect(result.states).toHaveLength(1);
    expect(result.states[0].stateId).toBe('MX-CMX');
  });
});

describe('getDoctorDashboardDiseaseCatalog', () => {
  it('calls GET /doctor/dashboard/diseases', async () => {
    const spy = mockFetch(DISEASE_CATALOG_RESPONSE);
    const result = await getDoctorDashboardDiseaseCatalog();
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/doctor/dashboard/diseases`);
    expect(result.diseases[0].code).toBe('DENGUE');
  });
});

describe('getDoctorDashboardStateOutbreakMap', () => {
  it('calls GET /doctor/dashboard/map/states/:stateId/outbreaks', async () => {
    const spy = mockFetch(MAP_RESPONSE);
    await getDoctorDashboardStateOutbreakMap('MX-CMX');
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/doctor/dashboard/map/states/MX-CMX/outbreaks`);
  });
});

describe('getDoctorDashboardAlerts', () => {
  it('calls GET /doctor/dashboard/alerts without radiusKm', async () => {
    const spy = mockFetch(ALERTS_RESPONSE);
    const result = await getDoctorDashboardAlerts();
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/doctor/dashboard/alerts`);
    expect(result.alerts).toHaveLength(1);
  });

  it('appends ?radiusKm when provided', async () => {
    const spy = mockFetch(ALERTS_RESPONSE);
    await getDoctorDashboardAlerts(75);
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/doctor/dashboard/alerts?radiusKm=75`);
  });
});

describe('getDoctorDashboardLocalBreakdown', () => {
  it('calls GET /doctor/dashboard/disease-breakdown/local', async () => {
    const spy = mockFetch(BREAKDOWN_RESPONSE);
    const result = await getDoctorDashboardLocalBreakdown();
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/doctor/dashboard/disease-breakdown/local`);
    expect(result.diseaseBreakdown).toHaveLength(1);
  });

  it('appends ?radiusKm when provided', async () => {
    const spy = mockFetch(BREAKDOWN_RESPONSE);
    await getDoctorDashboardLocalBreakdown(35);
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/doctor/dashboard/disease-breakdown/local?radiusKm=35`);
  });
});

describe('getDoctorDashboardStateBreakdown', () => {
  it('calls GET /doctor/dashboard/disease-breakdown/state', async () => {
    const spy = mockFetch(BREAKDOWN_RESPONSE);
    await getDoctorDashboardStateBreakdown();
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/doctor/dashboard/disease-breakdown/state`);
  });
});

describe('getDoctorDashboardReport', () => {
  it('calls GET /doctor/dashboard/reports/local', async () => {
    const spy = mockFetch(REPORT_RESPONSE);
    const result = await getDoctorDashboardReport('local');
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/doctor/dashboard/reports/local`);
    expect(result.scope).toBe('local');
  });

  it('calls GET /doctor/dashboard/reports/state', async () => {
    const spy = mockFetch({ ...REPORT_RESPONSE, scope: 'state' });
    await getDoctorDashboardReport('state');
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/doctor/dashboard/reports/state`);
  });

  it('calls GET /doctor/dashboard/reports/both', async () => {
    const spy = mockFetch({ ...REPORT_RESPONSE, scope: 'both' });
    await getDoctorDashboardReport('both');
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/doctor/dashboard/reports/both`);
  });

  it('appends ?radiusKm when provided', async () => {
    const spy = mockFetch(REPORT_RESPONSE);
    await getDoctorDashboardReport('local', 75);
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/doctor/dashboard/reports/local?radiusKm=75`);
  });
});

describe('getDoctorDashboardStateReport', () => {
  it('calls GET /doctor/dashboard/reports/states/:stateId with encoding', async () => {
    const spy = mockFetch(REPORT_RESPONSE);
    await getDoctorDashboardStateReport('CDMX');
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/doctor/dashboard/reports/states/CDMX`);
  });

  it('URL-encodes state names with spaces', async () => {
    const spy = mockFetch(REPORT_RESPONSE);
    await getDoctorDashboardStateReport('Estado de México');
    const [url] = spy.mock.calls[0] as [string, RequestInit?];
    expect(url).toBe(`${BASE}/doctor/dashboard/reports/states/Estado%20de%20M%C3%A9xico`);
  });
});

// ── Error handling ────────────────────────────────────────────────────────────

describe('api error handling', () => {
  it('throws ApiError with status and message on non-2xx response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ code: 'NOT_FOUND', message: 'Dashboard data not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(getDoctorDashboardSummary()).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
      message: 'Dashboard data not found',
    });
  });

  it('throws ApiError on 500 server error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(getDoctorDashboardMetrics()).rejects.toMatchObject({
      status: 500,
      message: 'Internal server error',
    });
  });

  it('propagates 401 as an ApiError (Unauthorized)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(getDoctorDashboardAlerts()).rejects.toMatchObject({
      status: 401,
      message: 'Unauthorized',
    });
  });
});
