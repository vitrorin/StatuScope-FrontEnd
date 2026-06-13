/**
 * 06-doctor-diagnosis-screenshots.cy.ts
 *
 * Captures screenshots of the Doctor AI Diagnosis page.
 * All Firebase + backend calls are stubbed so no live services are needed.
 */

function base64url(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function makeMockJwt(uid: string, email: string): string {
  const header = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9';
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

const MOCK_UID = 'seed-doctor-1';
const MOCK_EMAIL = 'doctor1@statusscope.local';

const mockDoctorProfile = {
  id: '70000000-0000-0000-0000-000000000004',
  email: 'doctor1@statusscope.local',
  fullName: 'Dra. Ana Lopez',
  hospitalId: '30000000-0000-0000-0000-000000000001',
  hospitalName: 'Hospital General de Zona No. 21',
  roles: ['DOCTOR'],
  privileges: ['DOCTOR_DASHBOARD', 'DOCTOR_DIAGNOSIS', 'DOCTOR_ANALYTICS'],
};

describe('Doctor AI Diagnosis — Screenshots', () => {
  let MOCK_JWT: string;

  before(() => {
    MOCK_JWT = makeMockJwt(MOCK_UID, MOCK_EMAIL);
  });

  function stubAllCalls() {
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

    cy.intercept('GET', 'http://localhost:8080/auth/me', mockDoctorProfile).as('authMe');
    cy.intercept('GET', 'http://localhost:8080/**', { statusCode: 200, body: {} }).as('backendCatchAll');
    cy.intercept('POST', 'http://localhost:8080/**', { statusCode: 200, body: {} }).as('backendPostCatchAll');
    // Register more-specific intercepts AFTER the catch-all so they take priority
    cy.intercept('GET', 'http://localhost:8080/diagnosis/diseases*', { statusCode: 200, body: [] }).as('diagnosisDiseases');
    cy.intercept('GET', 'http://localhost:8080/diagnosis/evaluations/current', { statusCode: 404, body: { message: 'No active evaluation' } }).as('diagnosisEvalCurrent');
    cy.intercept('GET', 'http://localhost:8080/diagnosis/evaluations/*/thread', { statusCode: 404, body: { message: 'No thread' } }).as('diagnosisThread');
  }

  it('captures doctor AI diagnosis page screenshots', () => {
    stubAllCalls();

    cy.visit('/login');
    cy.get('input[placeholder="name@hospital.com"]').type(MOCK_EMAIL);
    cy.get('input[placeholder="********"]').type('anyPassword123');
    cy.contains('Login to the system').click();
    cy.wait('@firebaseSignIn');
    cy.wait('@firebaseLookup');
    cy.url({ timeout: 12000 }).should('include', '/dashboard/doctor');

    // Navigate directly after the mocked login; the auth state is already established.
    cy.visit('/diagnosis');
    cy.url({ timeout: 10000 }).should('include', '/diagnosis');
    cy.get('[data-testid="doctor-diagnosis-screen"]', { timeout: 10000 }).should('be.visible');
    cy.wait(1500);

    // Full page
    cy.screenshot('30-doctor-diagnosis-full', { capture: 'fullPage' });

    // Hero strip close-up
    cy.screenshot('31-doctor-diagnosis-hero-strip', {
      clip: { x: 0, y: 0, width: 1440, height: 220 },
    });

    // Two-column layout (form + chat)
    cy.screenshot('32-doctor-diagnosis-layout', {
      clip: { x: 0, y: 180, width: 1440, height: 600 },
    });
  });
});
