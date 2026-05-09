import { api } from './api';

export interface DoctorDashboardMetricResponse {
  id: string;
  title: string;
  value: string;
  badge?: string | null;
  status?: 'positive' | 'danger' | 'warning' | 'neutral' | null;
  subtitle?: string | null;
  detailSummary: string;
  signalLabel: string;
  recommendedAction: string;
  iconKey?: 'trend' | null;
  insights?: DoctorDashboardMetricInsightResponse[] | null;
}

export interface DoctorDashboardMetricInsightResponse {
  title: string;
  location: string;
  cases: string;
  severity: string;
  color: string;
  meta?: string | null;
}

export interface DoctorDashboardDiseaseResponse {
  diseaseName: string;
  caseCount: number;
  outbreakCount: number;
  progress: number;
}

export interface DoctorDashboardAlertResponse {
  id: string;
  title: string;
  description: string;
  variant: 'critical' | 'warning' | 'success' | 'info' | 'neutral';
  area: string;
  priority: string;
  recommendedAction: string;
  caseCount?: number | null;
  caseLabel?: string | null;
  confirmationStatus?: string | null;
  municipalityName?: string | null;
  stateName?: string | null;
}

export interface DoctorDashboardZoneResponse {
  id: string;
  name: string;
  risk: string;
  disease: string;
  cases: string;
  radius: string;
  priority: string;
  note: string;
  recommendedAction: string;
  municipalityName?: string | null;
  stateName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  borderColor: string;
}

export interface DoctorDashboardSummary {
  hospitalName: string;
  municipalityName?: string | null;
  stateName?: string | null;
  radiusKm: number;
  generatedAt: string;
  metrics: DoctorDashboardMetricResponse[];
  diseaseBreakdown: DoctorDashboardDiseaseResponse[];
  stateDiseaseBreakdown: DoctorDashboardDiseaseResponse[];
  alerts: DoctorDashboardAlertResponse[];
  zones: DoctorDashboardZoneResponse[];
}

export interface DoctorDashboardMetricsResponse {
  metrics: DoctorDashboardMetricResponse[];
  hospitalName?: string | null;
}

export interface DoctorDashboardMapResponse {
  zones: DoctorDashboardZoneResponse[];
  diseaseBreakdown: DoctorDashboardDiseaseResponse[];
  generatedAt: string;
  radiusKm: number;
}

export interface DoctorDashboardStateMapItem {
  stateId: string;
  stateName: string;
  latitude: number;
  longitude: number;
  outbreakCount: number;
  caseCount: number;
}

export interface DoctorDashboardStateMapResponse {
  states: DoctorDashboardStateMapItem[];
}

export interface DoctorDashboardAlertsResponse {
  alerts: DoctorDashboardAlertResponse[];
}

export interface DoctorDashboardBreakdownResponse {
  diseaseBreakdown: DoctorDashboardDiseaseResponse[];
  stateName?: string | null;
  municipalityName?: string | null;
}

export async function getDoctorDashboardSummary(): Promise<DoctorDashboardSummary> {
  return api<DoctorDashboardSummary>('/doctor/dashboard/summary');
}

export async function getDoctorDashboardMetrics(): Promise<DoctorDashboardMetricsResponse> {
  return api<DoctorDashboardMetricsResponse>('/doctor/dashboard/metrics');
}

export async function getDoctorDashboardMap(): Promise<DoctorDashboardMapResponse> {
  return api<DoctorDashboardMapResponse>('/doctor/dashboard/map');
}

export async function getDoctorDashboardStateMap(): Promise<DoctorDashboardStateMapResponse> {
  return api<DoctorDashboardStateMapResponse>('/doctor/dashboard/map/states');
}

export async function getDoctorDashboardStateOutbreakMap(stateId: string): Promise<DoctorDashboardMapResponse> {
  return api<DoctorDashboardMapResponse>(`/doctor/dashboard/map/states/${stateId}/outbreaks`);
}

export async function getDoctorDashboardAlerts(): Promise<DoctorDashboardAlertsResponse> {
  return api<DoctorDashboardAlertsResponse>('/doctor/dashboard/alerts');
}

export async function getDoctorDashboardLocalBreakdown(): Promise<DoctorDashboardBreakdownResponse> {
  return api<DoctorDashboardBreakdownResponse>('/doctor/dashboard/disease-breakdown/local');
}

export async function getDoctorDashboardStateBreakdown(): Promise<DoctorDashboardBreakdownResponse> {
  return api<DoctorDashboardBreakdownResponse>('/doctor/dashboard/disease-breakdown/state');
}
