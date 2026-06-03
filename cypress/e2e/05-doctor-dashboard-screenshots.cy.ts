/**
 * 05-doctor-dashboard-screenshots.cy.ts
 *
 * Captures screenshots of the redesigned Doctor Dashboard.
 * All Firebase + backend calls are stubbed so no live services are needed.
 */

// ---------------------------------------------------------------------------
// JWT helper (runs in Cypress's Electron browser – btoa is available)
// ---------------------------------------------------------------------------
function base64url(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function makeMockJwt(uid: string, email: string): string {
  const header = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9'; // {"alg":"RS256","typ":"JWT"}
  const payload = base64url(
    JSON.stringify({
      sub: uid,
      aud: 'proyecto-andres-d7931',
      iat: Math.floor(Date.now() / 1000),
      exp: 9999999999,
      email,
      firebase: {
        identities: { email: [email] },
        sign_in_provider: 'password',
      },
    }),
  );
  return `${header}.${payload}.mock-sig`;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const MOCK_UID = 'seed-doctor-1';
const MOCK_EMAIL = 'doctor1@statusscope.local';

const mockMetricsResponse = {
  hospitalName: 'Hospital General de Zona No. 21',
  metrics: [
    {
      id: 'active-cases-nearby',
      title: 'Active Cases Nearby',
      value: '47',
      badge: 'HIGH',
      status: 'danger',
      subtitle: 'Within 75 km radius',
      detailSummary: '47 active cases detected within your surveillance radius.',
      signalLabel: 'Rising trend detected',
      recommendedAction: 'Increase monitoring frequency and alert staff.',
      iconKey: 'trend',
      insights: [
        { title: 'Influenza A', location: 'Tláhuac, CDMX', cases: '18 cases', severity: 'HIGH', color: '#EF4444' },
        { title: 'Dengue', location: 'Iztapalapa, CDMX', cases: '12 cases', severity: 'MEDIUM', color: '#F97316' },
        { title: 'COVID-19', location: 'Xochimilco, CDMX', cases: '17 cases', severity: 'HIGH', color: '#EF4444' },
      ],
    },
    {
      id: 'highest-case-disease',
      title: 'Highest Case Disease',
      value: 'Influenza A',
      badge: null,
      status: 'warning',
      subtitle: '18 confirmed cases',
      detailSummary: 'Influenza A leads case count in your area this period.',
      signalLabel: 'Seasonal peak expected',
      recommendedAction: 'Ensure antiviral stockpile is adequate.',
    },
    {
      id: 'local-risk-level',
      title: 'Local Risk Level',
      value: 'HIGH',
      badge: null,
      status: 'danger',
      subtitle: 'Based on 3 active outbreaks',
      detailSummary: 'Risk level is elevated due to concurrent outbreaks.',
      signalLabel: 'Elevated community transmission',
      recommendedAction: 'Activate outbreak response protocol.',
    },
    {
      id: 'priority-municipality',
      title: 'Priority Municipality',
      value: 'Tláhuac',
      badge: 'CRITICAL',
      status: 'danger',
      subtitle: 'Highest burden in radius',
      detailSummary: 'Tláhuac shows the highest disease burden in your area.',
      signalLabel: 'Immediate intervention recommended',
      recommendedAction: 'Coordinate with municipal health authorities.',
    },
  ],
};

const mockMapResponse = {
  radiusKm: 75,
  generatedAt: new Date().toISOString(),
  zones: [
    {
      id: 'z1',
      name: 'Tláhuac',
      risk: 'CRITICAL',
      disease: 'Influenza A',
      cases: '18 cases',
      radius: '< 40 km',
      priority: 'IMMEDIATE',
      note: 'Active outbreak — confirmed',
      recommendedAction: 'Alert respiratory ward staff.',
      municipalityName: 'Tláhuac',
      stateName: 'CDMX',
      latitude: 19.257,
      longitude: -99.006,
      borderColor: '#EF4444',
    },
    {
      id: 'z2',
      name: 'Iztapalapa',
      risk: 'HIGH',
      disease: 'Dengue',
      cases: '12 cases',
      radius: '< 60 km',
      priority: 'URGENT',
      note: 'Suspected outbreak',
      recommendedAction: 'Vector control coordination needed.',
      municipalityName: 'Iztapalapa',
      stateName: 'CDMX',
      latitude: 19.365,
      longitude: -99.083,
      borderColor: '#F97316',
    },
    {
      id: 'z3',
      name: 'Xochimilco',
      risk: 'HIGH',
      disease: 'COVID-19',
      cases: '17 cases',
      radius: '< 55 km',
      priority: 'URGENT',
      note: 'Active monitoring',
      recommendedAction: 'Ensure isolation capacity.',
      municipalityName: 'Xochimilco',
      stateName: 'CDMX',
      latitude: 19.263,
      longitude: -99.102,
      borderColor: '#F97316',
    },
  ],
  diseaseBreakdown: [
    { diseaseName: 'Influenza A', caseCount: 18, outbreakCount: 1, progress: 38 },
    { diseaseName: 'COVID-19', caseCount: 17, outbreakCount: 1, progress: 36 },
    { diseaseName: 'Dengue', caseCount: 12, outbreakCount: 1, progress: 26 },
  ],
};

const mockAlertsResponse = {
  alerts: [
    {
      id: 'a1',
      title: 'Influenza A activity',
      description: '18 active cases in Tláhuac, CDMX. Status: CONFIRMED.',
      variant: 'critical',
      area: 'Tláhuac, CDMX',
      priority: 'IMMEDIATE',
      recommendedAction: 'Alert respiratory ward. Prepare antiviral stock.',
      caseCount: 18,
      caseLabel: 'Active cases',
      confirmationStatus: 'CONFIRMED',
      municipalityName: 'Tláhuac',
      stateName: 'CDMX',
    },
    {
      id: 'a2',
      title: 'COVID-19 activity',
      description: '17 active cases in Xochimilco, CDMX. Status: CONFIRMED.',
      variant: 'critical',
      area: 'Xochimilco, CDMX',
      priority: 'URGENT',
      recommendedAction: 'Verify isolation room availability.',
      caseCount: 17,
      caseLabel: 'Active cases',
      confirmationStatus: 'CONFIRMED',
      municipalityName: 'Xochimilco',
      stateName: 'CDMX',
    },
    {
      id: 'a3',
      title: 'Dengue activity',
      description: '12 active cases in Iztapalapa, CDMX. Status: SUSPECTED.',
      variant: 'warning',
      area: 'Iztapalapa, CDMX',
      priority: 'MONITOR',
      recommendedAction: 'Coordinate with vector-control unit.',
      caseCount: 12,
      caseLabel: 'Active cases',
      confirmationStatus: 'SUSPECTED',
      municipalityName: 'Iztapalapa',
      stateName: 'CDMX',
    },
  ],
};

const mockLocalBreakdownResponse = {
  diseaseBreakdown: [
    { diseaseName: 'Influenza A', caseCount: 18, outbreakCount: 1, progress: 38 },
    { diseaseName: 'COVID-19', caseCount: 17, outbreakCount: 1, progress: 36 },
    { diseaseName: 'Dengue', caseCount: 12, outbreakCount: 1, progress: 26 },
  ],
  municipalityName: 'Tláhuac',
  stateName: 'CDMX',
};

const mockStateBreakdownResponse = {
  diseaseBreakdown: [
    { diseaseName: 'Influenza A', caseCount: 42, outbreakCount: 3, progress: 44 },
    { diseaseName: 'COVID-19', caseCount: 31, outbreakCount: 2, progress: 33 },
    { diseaseName: 'Dengue', caseCount: 22, outbreakCount: 2, progress: 23 },
  ],
  stateName: 'CDMX',
  municipalityName: null,
};

const mockStateMapResponse = {
  states: [
    { stateId: 'MX-CMX', stateName: 'CDMX', latitude: 19.43, longitude: -99.13, outbreakCount: 4, caseCount: 95 },
    { stateId: 'MX-MEX', stateName: 'Estado de México', latitude: 19.35, longitude: -99.66, outbreakCount: 2, caseCount: 34 },
    { stateId: 'MX-HID', stateName: 'Hidalgo', latitude: 20.09, longitude: -98.76, outbreakCount: 1, caseCount: 11 },
  ],
};

const mockDoctorProfile = {
  id: '70000000-0000-0000-0000-000000000004',
  email: 'doctor1@statusscope.local',
  fullName: 'Dra. Ana Lopez',
  hospitalId: '30000000-0000-0000-0000-000000000001',
  hospitalName: 'Hospital General de Zona No. 21',
  roles: ['DOCTOR'],
  privileges: ['DOCTOR_DASHBOARD', 'DOCTOR_DIAGNOSIS', 'DOCTOR_ANALYTICS'],
};

// ---------------------------------------------------------------------------
// Spec
// ---------------------------------------------------------------------------
describe('Doctor Dashboard — Redesign Screenshots', () => {
  let MOCK_JWT: string;

  before(() => {
    MOCK_JWT = makeMockJwt(MOCK_UID, MOCK_EMAIL);
  });

  function stubAllCalls() {
    // Firebase sign-in (accounts:signInWithPassword)
    cy.intercept('POST', '**/accounts:signInWithPassword**', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          localId: MOCK_UID,
          email: MOCK_EMAIL,
          displayName: 'Dra. Ana Lopez',
          idToken: MOCK_JWT,
          registered: true,
          refreshToken: 'mock-refresh-token',
          expiresIn: '3600',
          kind: 'identitytoolkit#VerifyPasswordResponse',
        },
      });
    }).as('firebaseSignIn');

    // Firebase accounts:lookup (called after signIn to get full user profile)
    cy.intercept('POST', '**/accounts:lookup**', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          kind: 'identitytoolkit#GetAccountInfoResponse',
          users: [
            {
              localId: MOCK_UID,
              email: MOCK_EMAIL,
              displayName: 'Dra. Ana Lopez',
              emailVerified: true,
              providerUserInfo: [{ providerId: 'password', federatedId: MOCK_EMAIL }],
              validSince: '1700000000',
              disabled: false,
              createdAt: '1700000000000',
              lastLoginAt: String(Date.now()),
              lastRefreshAt: new Date().toISOString(),
            },
          ],
        },
      });
    }).as('firebaseLookup');

    // Firebase token refresh
    cy.intercept('POST', 'https://securetoken.googleapis.com/**', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          access_token: MOCK_JWT,
          expires_in: '3600',
          token_type: 'Bearer',
          refresh_token: 'mock-refresh-token',
          id_token: MOCK_JWT,
        },
      });
    }).as('firebaseTokenRefresh');

    // Backend: auth
    cy.intercept('GET', 'http://localhost:8080/auth/me', mockDoctorProfile).as('authMe');

    // Backend: metrics
    cy.intercept('GET', 'http://localhost:8080/doctor/dashboard/metrics*', mockMetricsResponse).as('metrics');

    // Backend: map
    cy.intercept('GET', 'http://localhost:8080/doctor/dashboard/map*', mockMapResponse).as('map');

    // Backend: state map
    cy.intercept('GET', 'http://localhost:8080/doctor/dashboard/map/states', mockStateMapResponse).as('stateMap');

    // Backend: alerts
    cy.intercept('GET', 'http://localhost:8080/doctor/dashboard/alerts*', mockAlertsResponse).as('alerts');

    // Backend: local breakdown
    cy.intercept('GET', 'http://localhost:8080/doctor/dashboard/disease-breakdown/local*', mockLocalBreakdownResponse).as('localBreakdown');

    // Backend: state breakdown
    cy.intercept('GET', 'http://localhost:8080/doctor/dashboard/disease-breakdown/state*', mockStateBreakdownResponse).as('stateBreakdown');

    // Backend: catch-all for any other endpoints
    cy.intercept('GET', 'http://localhost:8080/**', { statusCode: 200, body: {} }).as('backendCatchAll');
  }

  /**
   * All screenshots are captured in a single test to avoid re-login issues
   * (Firebase persists auth state in IndexedDB across tests).
   */
  it('captures redesigned doctor dashboard screenshots', () => {
    stubAllCalls();

    // ── Login ──────────────────────────────────────────────────────────────
    cy.visit('/login');
    cy.get('input[placeholder="name@hospital.com"]').type(MOCK_EMAIL);
    cy.get('input[placeholder="********"]').type('anyPassword123');
    cy.contains('Login to the system').click();
    cy.wait('@firebaseSignIn');
    cy.wait('@firebaseLookup');
    cy.url({ timeout: 12000 }).should('include', '/dashboard/doctor');
    cy.wait(2500); // let data-fetch calls resolve

    // ── 25: full page ──────────────────────────────────────────────────────
    cy.screenshot('25-doctor-dashboard-full', { capture: 'fullPage' });

    // ── 26: hero strip close-up ────────────────────────────────────────────
    cy.screenshot('26-doctor-dashboard-hero-strip', {
      clip: { x: 0, y: 0, width: 1440, height: 240 },
    });

    // ── 27: stat cards row ─────────────────────────────────────────────────
    cy.screenshot('27-doctor-dashboard-stat-cards', {
      clip: { x: 0, y: 200, width: 1440, height: 380 },
    });

    // ── 28: full-page (captures below-fold content including alerts) ─────────
    cy.screenshot('28-doctor-dashboard-below-fold', { capture: 'fullPage' });

    // ── 29: narrower viewport ──────────────────────────────────────────────
    cy.viewport(1280, 900);
    cy.wait(800);
    cy.screenshot('29-doctor-dashboard-1280px', { capture: 'fullPage' });
  });
});
