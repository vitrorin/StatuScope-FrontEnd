export function radiusQuery(radiusKm?: number) {
  return typeof radiusKm === 'number' ? `?radiusKm=${encodeURIComponent(String(radiusKm))}` : '';
}

const generatedAt = '2026-06-10T12:00:00.000Z';

const metrics = [
  {
    id: 'active-outbreaks',
    title: 'Active Outbreaks',
    value: '8',
    badge: '+2 today',
    status: 'danger',
    subtitle: 'Across monitored municipalities',
    detailSummary: 'Dengue and influenza clusters require continued follow-up.',
    signalLabel: 'High priority',
    recommendedAction: 'Review alerts and prepare triage capacity.',
    iconKey: 'trend',
    insights: [
      { title: 'Dengue', location: 'Centro', cases: '42 cases', severity: 'High', color: '#ef4444', meta: 'Last 24h' },
      { title: 'Influenza', location: 'Norte', cases: '26 cases', severity: 'Medium', color: '#f59e0b', meta: 'Last 24h' },
    ],
  },
  {
    id: 'risk-index',
    title: 'Risk Index',
    value: '74%',
    badge: 'Elevated',
    status: 'warning',
    subtitle: 'Local epidemiological pressure',
    detailSummary: 'Locality risk remains elevated due to confirmed outbreaks nearby.',
    signalLabel: 'Moderate trend',
    recommendedAction: 'Increase surveillance for febrile patients.',
    iconKey: 'trend',
    insights: [],
  },
  {
    id: 'bed-capacity',
    title: 'Available Beds',
    value: '36',
    badge: 'Stable',
    status: 'positive',
    subtitle: 'General ward capacity',
    detailSummary: 'Bed capacity is stable for the current load.',
    signalLabel: 'Operational',
    recommendedAction: 'Keep isolation rooms reserved.',
    iconKey: null,
    insights: [],
  },
];

const diseaseBreakdown = [
  { diseaseName: 'Dengue', caseCount: 42, outbreakCount: 3, progress: 78 },
  { diseaseName: 'Influenza', caseCount: 26, outbreakCount: 2, progress: 52 },
  { diseaseName: 'COVID-19', caseCount: 14, outbreakCount: 1, progress: 28 },
];

const zones = [
  {
    id: 'zone-centro',
    name: 'Centro',
    risk: 'High',
    disease: 'Dengue',
    cases: '42',
    radius: '8 km',
    priority: 'Critical',
    note: 'Cluster near hospital service area.',
    recommendedAction: 'Activate vector-control coordination.',
    municipalityName: 'Merida',
    stateName: 'Yucatan',
    latitude: 20.967,
    longitude: -89.623,
    borderColor: '#ef4444',
  },
  {
    id: 'zone-norte',
    name: 'Norte',
    risk: 'Medium',
    disease: 'Influenza',
    cases: '26',
    radius: '12 km',
    priority: 'Monitor',
    note: 'Respiratory symptoms rising.',
    recommendedAction: 'Prepare respiratory triage lane.',
    municipalityName: 'Merida',
    stateName: 'Yucatan',
    latitude: 21.04,
    longitude: -89.62,
    borderColor: '#f59e0b',
  },
];

const alerts = [
  {
    id: 'alert-dengue',
    title: 'Dengue cluster detected',
    description: 'Cases are concentrated in the Centro service area.',
    variant: 'critical',
    area: 'Centro',
    priority: 'Critical',
    recommendedAction: 'Increase screening and notify local epidemiology.',
    caseCount: 42,
    caseLabel: 'confirmed cases',
    confirmationStatus: 'CONFIRMED',
    municipalityName: 'Merida',
    stateName: 'Yucatan',
  },
  {
    id: 'alert-flu',
    title: 'Influenza activity rising',
    description: 'Respiratory consultations increased during the last 72 hours.',
    variant: 'warning',
    area: 'Norte',
    priority: 'High',
    recommendedAction: 'Reinforce mask and triage protocol.',
    caseCount: 26,
    caseLabel: 'probable cases',
    confirmationStatus: 'PROBABLE',
    municipalityName: 'Merida',
    stateName: 'Yucatan',
  },
];

const states = [
  { stateId: 'yuc', stateName: 'Yucatan', latitude: 20.7, longitude: -88.9, outbreakCount: 8, caseCount: 118 },
  { stateId: 'qroo', stateName: 'Quintana Roo', latitude: 19.6, longitude: -88.1, outbreakCount: 5, caseCount: 74 },
  { stateId: 'camp', stateName: 'Campeche', latitude: 19.8, longitude: -90.5, outbreakCount: 3, caseCount: 41 },
];

const report = {
  scope: 'both',
  hospitalName: 'Central Hospital',
  municipalityName: 'Merida',
  stateName: 'Yucatan',
  generatedAt,
  outbreaks: [
    { id: 'outbreak-1', diseaseName: 'Dengue', location: 'Merida, Yucatan', scope: 'local', caseCount: 42, confirmationStatus: 'CONFIRMED', startedAt: '2026-06-01' },
    { id: 'outbreak-2', diseaseName: 'Influenza', location: 'Merida, Yucatan', scope: 'local', caseCount: 26, confirmationStatus: 'PROBABLE', startedAt: '2026-06-04' },
  ],
};

function mapResponse() {
  return { zones, diseaseBreakdown, generatedAt, radiusKm: 75 };
}

function metricsResponse() {
  return { metrics, hospitalName: 'Central Hospital' };
}

function alertsResponse() {
  return { alerts };
}

function breakdownResponse() {
  return { diseaseBreakdown, stateName: 'Yucatan', municipalityName: 'Merida' };
}

export async function getDoctorDashboardSummary() {
  return { hospitalName: 'Central Hospital', municipalityName: 'Merida', stateName: 'Yucatan', radiusKm: 75, generatedAt, metrics, diseaseBreakdown, stateDiseaseBreakdown: diseaseBreakdown, alerts, zones };
}

export async function getDoctorDashboardMetrics() { return metricsResponse(); }
export async function getDoctorDashboardMap() { return mapResponse(); }
export async function getDoctorDashboardStateMap() { return { states }; }
export async function getDoctorDashboardDiseaseCatalog() { return { diseases: [{ id: 'dengue', code: 'A90', name: 'Dengue' }, { id: 'flu', code: 'J10', name: 'Influenza' }] }; }
export async function getDoctorDashboardStateOutbreakMap() { return mapResponse(); }
export async function getDoctorDashboardAlerts() { return alertsResponse(); }
export async function getDoctorDashboardLocalBreakdown() { return breakdownResponse(); }
export async function getDoctorDashboardStateBreakdown() { return { ...breakdownResponse(), municipalityName: null }; }
export async function getDoctorDashboardReport() { return report; }
export async function getDoctorDashboardStateReport() { return { ...report, scope: 'state' }; }

export async function getAdminEpidemiologySummary() { return getDoctorDashboardSummary(); }
export async function getAdminEpidemiologyMetrics() { return getDoctorDashboardMetrics(); }
export async function getAdminEpidemiologyMap() { return getDoctorDashboardMap(); }
export async function getAdminEpidemiologyStateMap() { return getDoctorDashboardStateMap(); }
export async function getAdminEpidemiologyDiseaseCatalog() { return getDoctorDashboardDiseaseCatalog(); }
export async function getAdminEpidemiologyStateOutbreakMap() { return getDoctorDashboardStateOutbreakMap(); }
export async function getAdminEpidemiologyAlerts() { return getDoctorDashboardAlerts(); }
export async function getAdminEpidemiologyLocalBreakdown() { return getDoctorDashboardLocalBreakdown(); }
export async function getAdminEpidemiologyStateBreakdown() { return getDoctorDashboardStateBreakdown(); }
export async function getAdminEpidemiologyReport() { return getDoctorDashboardReport(); }
export async function getAdminEpidemiologyStateReport() { return getDoctorDashboardStateReport(); }
