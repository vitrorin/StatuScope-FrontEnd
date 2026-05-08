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
  variant: 'critical' | 'warning' | 'info' | 'neutral';
  area: string;
  priority: string;
  recommendedAction: string;
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
}

export interface DoctorDashboardAlertsResponse {
  alerts: DoctorDashboardAlertResponse[];
}

export interface DoctorDashboardBreakdownResponse {
  diseaseBreakdown: DoctorDashboardDiseaseResponse[];
  stateName?: string | null;
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

export async function getDoctorDashboardAlerts(): Promise<DoctorDashboardAlertsResponse> {
  return api<DoctorDashboardAlertsResponse>('/doctor/dashboard/alerts');
}

export async function getDoctorDashboardLocalBreakdown(): Promise<DoctorDashboardBreakdownResponse> {
  return api<DoctorDashboardBreakdownResponse>('/doctor/dashboard/disease-breakdown/local');
}

export async function getDoctorDashboardStateBreakdown(): Promise<DoctorDashboardBreakdownResponse> {
  return api<DoctorDashboardBreakdownResponse>('/doctor/dashboard/disease-breakdown/state');
}
