function base64url(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function makeMockJwt(uid: string, email: string): string {
  const header = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9';
  const payload = base64url(JSON.stringify({
    sub: uid,
    aud: 'proyecto-andres-d7931',
    iat: Math.floor(Date.now() / 1000),
    exp: 9999999999,
    email,
    firebase: { identities: { email: [email] }, sign_in_provider: 'password' },
  }));
  return `${header}.${payload}.mock-sig`;
}

const doctorProfile = {
  id: 'doctor-1',
  email: 'doctor1@statusscope.local',
  fullName: 'Dra. Ana Lopez',
  hospitalId: 'hospital-1',
  hospitalName: 'Hospital General',
  roles: ['DOCTOR'],
  privileges: ['DOCTOR_DASHBOARD', 'DOCTOR_DIAGNOSIS', 'DOCTOR_ANALYTICS'],
};

const evaluationDraft = {
  id: 'eval-cy-1',
  status: 'IN_PROGRESS',
  symptomsText: 'Fever, rash and conjunctivitis for three days.',
  clinicalNotes: null,
  createdAt: '2026-06-12T10:00:00.000Z',
  updatedAt: '2026-06-12T10:00:00.000Z',
  finalizedAt: null,
  finalDiseaseId: null,
  finalDiseaseName: null,
  finalDiagnosisLabel: null,
  finalDecisionSource: null,
  doctorFeedbackNotes: null,
  patient: {
    id: 'patient-cy-1',
    fullName: 'Paciente Cypress',
    sex: 'female',
    birthDate: '1994-05-12',
    ageYears: 32,
    weightKg: null,
    heightCm: null,
  },
  event: null,
  recommendedTests: [],
  files: [],
};

function stubFirebase(email: string) {
  const token = makeMockJwt(`uid-${email}`, email);

  cy.intercept('POST', '**/accounts:signInWithPassword**', {
    statusCode: 200,
    body: {
      localId: `uid-${email}`,
      email,
      displayName: email,
      idToken: token,
      registered: true,
      refreshToken: 'mock-refresh-token',
      expiresIn: '3600',
    },
  }).as('firebaseSignIn');
  cy.intercept('POST', '**/accounts:lookup**', {
    statusCode: 200,
    body: { users: [{ localId: `uid-${email}`, email, emailVerified: true }] },
  }).as('firebaseLookup');
  cy.intercept('POST', 'https://securetoken.googleapis.com/**', {
    statusCode: 200,
    body: { access_token: token, id_token: token, refresh_token: 'mock-refresh-token', expires_in: '3600' },
  });
}

function stubDiagnosisBackend() {
  cy.intercept('GET', 'http://localhost:8080/auth/me', doctorProfile);
  cy.intercept('GET', 'http://localhost:8080/doctor/dashboard/metrics*', {
    hospitalName: 'Hospital General',
    metrics: [],
  });
  cy.intercept('GET', 'http://localhost:8080/doctor/dashboard/map*', {
    radiusKm: 75,
    generatedAt: new Date().toISOString(),
    zones: [],
    diseaseBreakdown: [],
  });
  cy.intercept('GET', 'http://localhost:8080/doctor/dashboard/alerts*', { alerts: [] });
  cy.intercept('GET', 'http://localhost:8080/doctor/dashboard/disease-breakdown/**', { diseaseBreakdown: [] });
  cy.intercept('GET', 'http://localhost:8080/doctor/dashboard/map/states', { states: [] });
  cy.intercept('GET', 'http://localhost:8080/diagnosis/diseases*', []);
  cy.intercept('GET', 'http://localhost:8080/diagnosis/evaluations/current', {
    statusCode: 404,
    body: { message: 'No active evaluation' },
  });
  cy.intercept('GET', 'http://localhost:8080/diagnosis/assistant/evaluations/*/thread', {
    statusCode: 404,
    body: { message: 'No thread' },
  });
  cy.intercept('POST', 'http://localhost:8080/diagnosis/evaluations', (req) => {
    expect(req.body).to.include({
      patientFullName: 'Paciente Cypress',
      birthDate: '1994-05-12',
      sex: 'female',
      symptomsText: 'Fever, rash and conjunctivitis for three days.',
    });
    req.reply({ statusCode: 200, body: evaluationDraft });
  }).as('createEvaluation');
  cy.intercept('POST', 'http://localhost:8080/diagnosis/assistant/messages', {
    statusCode: 200,
    body: {
      reply: 'The symptoms are compatible with dengue, but clinical confirmation is required.',
      replyByLanguage: {
        en: 'The symptoms are compatible with dengue, but clinical confirmation is required.',
      },
      messageId: 'assistant-message-cy-1',
      contextUsed: {
        stateName: 'Nuevo Leon',
        regionName: 'Monterrey',
        outbreaks: [],
      },
      suggestions: [
        {
          id: 'suggestion-cy-1',
          diseaseId: 'disease-dengue',
          displayName: 'Dengue',
          rankOrder: 1,
          confidence: 0.82,
          rationale: 'Fever and rash are consistent with the regional profile.',
          localityRiskLevel: 'MEDIUM',
          primary: true,
        },
      ],
    },
  }).as('assistantMessage');
  cy.intercept('POST', 'http://localhost:8080/diagnosis/evaluations/eval-cy-1/status', (req) => {
    expect(req.body).to.deep.equal({ status: 'REJECTED' });
    req.reply({
      statusCode: 200,
      body: { ...evaluationDraft, status: 'REJECTED', updatedAt: '2026-06-12T10:05:00.000Z' },
    });
  }).as('rejectDraft');
}

function clearBrowserState() {
  cy.clearAllCookies();
  cy.clearAllLocalStorage();
  cy.clearAllSessionStorage();
  cy.visit('/login', {
    onBeforeLoad(win) {
      win.localStorage.clear();
      win.sessionStorage.clear();
    },
  });
  cy.window().then((win) => win.indexedDB.databases().then((databases) => Promise.all(
    databases.map((database) => (
      database.name
        ? new Promise<void>((resolve) => {
            const request = win.indexedDB.deleteDatabase(database.name as string);
            request.onsuccess = () => resolve();
            request.onerror = () => resolve();
            request.onblocked = () => resolve();
          })
        : Promise.resolve()
    )),
  )));
}

function loginAsDoctor() {
  cy.get('input[placeholder="name@hospital.com"]').clear().type(doctorProfile.email);
  cy.get('input[placeholder="********"]').clear().type('Password123!');
  cy.contains('Login to the system').click();
  cy.wait('@firebaseSignIn');
  cy.wait('@firebaseLookup');
}

describe('Doctor diagnosis flow', () => {
  beforeEach(() => {
    stubFirebase(doctorProfile.email);
    stubDiagnosisBackend();
    clearBrowserState();
  });

  it('validates required fields, creates an evaluation, and starts a clean report', () => {
    loginAsDoctor();

    cy.visit('/diagnosis');
    cy.get('[data-testid="doctor-diagnosis-screen"]', { timeout: 15000 }).should('be.visible');

    cy.get('[data-testid="diagnosis-patient-name-input"]').clear().type('Paciente Cypress');
    cy.get('[data-testid="diagnosis-run-analysis"]').click();
    cy.contains('La fecha de nacimiento es obligatoria.').should('exist');

    cy.get('[data-testid="diagnosis-birth-date-input"]').clear().type('19940512');
    cy.get('[data-testid="diagnosis-run-analysis"]').click();
    cy.contains('El sexo del paciente es obligatorio.').should('exist');

    cy.get('[data-testid="diagnosis-sex-button"]').click();
    cy.get('[data-testid="diagnosis-sex-option-female"]').click();
    cy.get('[data-testid="diagnosis-run-analysis"]').click();
    cy.contains(/Los s.ntomas son obligatorios\./).should('exist');

    cy.get('[data-testid="diagnosis-symptoms-input"]')
      .clear()
      .type('Fever, rash and conjunctivitis for three days.');
    cy.get('[data-testid="diagnosis-run-analysis"]').click();
    cy.wait('@createEvaluation');
    cy.wait('@assistantMessage');
    cy.contains('The symptoms are compatible with dengue').should('exist');
    cy.contains('Estado: IN PROGRESS').should('exist');

    cy.get('[data-testid="diagnosis-start-new-report"]').click();
    cy.wait('@rejectDraft');
    cy.contains('Listo para iniciar').should('exist');
    cy.get('[data-testid="diagnosis-patient-name-input"]').should('have.value', '');
    cy.get('[data-testid="diagnosis-birth-date-input"]').should('have.value', '');
    cy.get('[data-testid="diagnosis-symptoms-input"]').should('have.value', '');
    cy.contains('The symptoms are compatible with dengue').should('not.exist');
  });
});
