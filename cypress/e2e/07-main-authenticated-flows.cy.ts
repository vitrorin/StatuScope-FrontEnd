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

interface TestProfile {
  id: string;
  email: string;
  fullName: string;
  hospitalId: string | null;
  hospitalName: string | null;
  roles: string[];
  privileges: string[];
}

const profiles: Record<'doctor' | 'admin' | 'system', TestProfile> = {
  doctor: {
    id: 'doctor-1',
    email: 'doctor1@statusscope.local',
    fullName: 'Dra. Ana Lopez',
    hospitalId: 'hospital-1',
    hospitalName: 'Hospital General',
    roles: ['DOCTOR'],
    privileges: ['DOCTOR_DASHBOARD', 'DOCTOR_DIAGNOSIS', 'DOCTOR_ANALYTICS'],
  },
  admin: {
    id: 'admin-1',
    email: 'admin1@statusscope.local',
    fullName: 'Admin Hospital',
    hospitalId: 'hospital-1',
    hospitalName: 'Hospital General',
    roles: ['HOSPITAL_ADMIN'],
    privileges: ['ADMIN_DASHBOARD', 'ADMIN_RESOURCES', 'ADMIN_RECOMMENDATIONS'],
  },
  system: {
    id: 'system-1',
    email: 'system@statusscope.local',
    fullName: 'System Admin',
    hospitalId: null,
    hospitalName: null,
    roles: ['SYSTEM_ADMIN'],
    privileges: ['isSystemAdmin'],
  },
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
  });
  cy.intercept('POST', '**/accounts:lookup**', {
    statusCode: 200,
    body: { users: [{ localId: `uid-${email}`, email, emailVerified: true }] },
  });
  cy.intercept('POST', 'https://securetoken.googleapis.com/**', {
    statusCode: 200,
    body: { access_token: token, id_token: token, refresh_token: 'mock-refresh-token', expires_in: '3600' },
  });
}

function stubCommonBackend(profile: TestProfile) {
  cy.intercept('GET', 'http://localhost:8080/auth/me', profile);
  cy.intercept('GET', 'http://localhost:8080/doctor/dashboard/metrics*', {
    hospitalName: 'Hospital General',
    metrics: [
      { id: 'active-cases-nearby', title: 'Active Cases Nearby', value: '12', status: 'warning', subtitle: 'Within radius' },
      { id: 'highest-case-disease', title: 'Highest Case Disease', value: 'Dengue', status: 'warning', subtitle: '8 cases' },
      { id: 'local-risk-level', title: 'Local Risk Level', value: 'MEDIUM', status: 'warning', subtitle: 'Monitored' },
      { id: 'priority-municipality', title: 'Priority Municipality', value: 'Tlalpan', status: 'good', subtitle: 'Stable' },
    ],
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
  cy.intercept('GET', 'http://localhost:8080/diagnosis/evaluations/current', { statusCode: 404, body: { message: 'No active evaluation' } });
  cy.intercept('GET', 'http://localhost:8080/diagnosis/evaluations/*/thread', { statusCode: 404, body: { message: 'No thread' } });
  cy.intercept('GET', 'http://localhost:8080/admin/dashboard/summary', {
    hospitalName: 'Hospital General',
    generatedAt: new Date().toISOString(),
    topCards: [
      { id: 'beds', title: 'Beds', value: '18', status: 'good', subtitle: 'available' },
      { id: 'staff', title: 'Staff', value: '42', status: 'good', subtitle: 'active' },
    ],
    alerts: [],
    mapZones: [],
    recommendedActions: [],
  });
  cy.intercept('GET', 'http://localhost:8080/admin/epidemiology/**', { statusCode: 200, body: { metrics: [], zones: [], alerts: [], states: [], diseaseBreakdown: [] } });
  cy.intercept('GET', 'http://localhost:8080/admin/recommendations*', []);
  cy.intercept('GET', 'http://localhost:8080/admin/resources/summary', {
    section: 'summary',
    data: { totalBeds: 40, availableBeds: 12, icuTotalBeds: 8, icuAvailableBeds: 2, isolationRoomsTotal: 6, isolationRoomsAvailable: 3, oxygenCapacityUnits: 100, oxygenAvailableUnits: 80, doctorsOnShift: 8, nursesOnShift: 16 },
  });
  cy.intercept('GET', 'http://localhost:8080/admin/resources/departments', { section: 'departments', data: [] });
  cy.intercept('GET', 'http://localhost:8080/admin/resources/staffing', { section: 'staffing', data: [] });
  cy.intercept('GET', 'http://localhost:8080/admin/resources/inventory', { section: 'inventory', data: [] });
  cy.intercept('GET', 'http://localhost:8080/system/dashboard/summary', {
    generatedAt: new Date().toISOString(),
    metrics: [{ id: 'hospitals', title: 'Hospitals', value: '1', detail: 'active', status: 'good', iconKey: 'hospital' }],
    userActivity: [],
    regionalDistribution: [],
    recentEvents: [],
    hospitalOutbreaks: [],
    hospitalUserMetrics: [],
  });
  cy.intercept('GET', 'http://localhost:8080/admin/hospitals', [
    { id: 'hospital-1', code: 'HG-1', name: 'Hospital General', active: true, municipalityName: 'Tlalpan', stateName: 'CDMX' },
  ]);
  cy.intercept('GET', 'http://localhost:8080/admin/hospitals/municipalities', [
    { id: 'mun-1', code: '09012', name: 'Tlalpan', stateName: 'CDMX' },
  ]);
  cy.intercept('GET', 'http://localhost:8080/admin/users', [
    { id: 'user-1', fullName: 'Dra. Ana Lopez', email: 'doctor1@statusscope.local', hospitalId: 'hospital-1', hospitalName: 'Hospital General', status: 'ACTIVE', roleCodes: ['DOCTOR'] },
  ]);
}

function loginAs(profile: TestProfile) {
  stubFirebase(profile.email);
  stubCommonBackend(profile);
  cy.visit('/login');
  cy.get('input[placeholder="name@hospital.com"]').clear().type(profile.email);
  cy.get('input[placeholder="********"]').clear().type('Password123!');
  cy.contains('Login to the system').click();
}

describe('Main authenticated flows without counting auth', () => {
  beforeEach(() => {
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
  });

  it('DoctorDashboard renders current epidemiological data', () => {
    loginAs(profiles.doctor);
    cy.get('[data-testid="doctor-dashboard-screen"]', { timeout: 15000 }).should('be.visible');
  });

  it('DoctorDiagnosis renders the clinical assistant workspace', () => {
    loginAs(profiles.doctor);
    cy.visit('/diagnosis');
    cy.get('[data-testid="doctor-diagnosis-screen"]', { timeout: 15000 }).should('be.visible');
  });

  it('AdminDashboard renders hospital operational metrics', () => {
    loginAs(profiles.admin);
    cy.get('[data-testid="admin-dashboard-screen"]', { timeout: 15000 }).should('be.visible');
  });

  it('AdminResources renders hospital resources and inventory sections', () => {
    loginAs(profiles.admin);
    cy.visit('/admin/resources');
    cy.get('[data-testid="admin-resources-screen"]', { timeout: 15000 }).should('be.visible');
  });

  it('SystemUsers and SystemHospitals render system administration lists', () => {
    loginAs(profiles.system);
    cy.visit('/system/users');
    cy.get('[data-testid="system-users-screen"]', { timeout: 15000 }).should('be.visible');
    cy.visit('/system/hospitals');
    cy.get('[data-testid="system-hospitals-screen"]', { timeout: 15000 }).should('be.visible');
  });
});
