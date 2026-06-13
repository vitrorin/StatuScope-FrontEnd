import { api } from './api';
import { AdminUserResponse, BackendRoleCode, BackendUserStatus, CreateAdminUserInput } from './adminUsers';

export interface SystemMetricResponse {
  id: string;
  title: string;
  value: string;
  detail: string;
  status: 'good' | 'warning' | 'critical' | string;
  iconKey: string;
}

export interface SystemActivityPointResponse {
  label: string;
  date?: string;
  value: number;
  adminValue: number;
  doctorValue: number;
}

export interface SystemRegionalDistributionResponse {
  label: string;
  value: number;
  percent: number;
}

export interface SystemEventResponse {
  id: string;
  title: string;
  detail: string;
  type: string;
  occurredAt: string;
}

export interface SystemNearbyOutbreakResponse {
  id: string;
  diseaseName: string;
  municipalityName?: string | null;
  stateName?: string | null;
  caseCount: number;
  confirmationStatus?: string | null;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  distanceKm: number;
  startedAt?: string | null;
}

export interface SystemHospitalOutbreakResponse {
  id: string;
  code: string;
  name: string;
  municipalityName?: string | null;
  stateName?: string | null;
  active: boolean;
  latitude?: number | null;
  longitude?: number | null;
  nearbyActiveOutbreakCount: number;
  radiusKm: number;
  nearbyOutbreaks: SystemNearbyOutbreakResponse[];
}

export interface SystemHospitalUserMetricResponse {
  hospitalId: string;
  hospitalName: string;
  municipalityName?: string | null;
  stateName?: string | null;
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  doctorUsers: number;
  inactiveUsers: number;
}

export interface SystemDashboardSummaryResponse {
  generatedAt: string;
  metrics: SystemMetricResponse[];
  userActivity: SystemActivityPointResponse[];
  regionalDistribution: SystemRegionalDistributionResponse[];
  recentEvents: SystemEventResponse[];
  hospitalOutbreaks: SystemHospitalOutbreakResponse[];
  hospitalUserMetrics: SystemHospitalUserMetricResponse[];
}

export interface HospitalResponse {
  id: string;
  code: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  inviteCode?: string | null;
  active: boolean;
  postalCode?: string | null;
  bedCount?: number | null;
  doctorCount?: number | null;
  nurseCount?: number | null;
  municipalityId?: string | null;
  municipalityName?: string | null;
  stateId?: string | null;
  stateName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface MunicipalityResponse {
  id: string;
  code: string;
  name: string;
  stateId?: string | null;
  stateName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface HospitalInput {
  code: string;
  name: string;
  address?: string;
  phone?: string;
  inviteCode?: string;
  postalCode?: string;
  bedCount?: number;
  doctorCount?: number;
  nurseCount?: number;
  municipalityId?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateAdminUserInput {
  fullName: string;
  email: string;
  roleCode: BackendRoleCode;
  hospitalId?: string;
  status?: BackendUserStatus;
}

export function getSystemDashboardSummary() {
  return api<SystemDashboardSummaryResponse>('/system/dashboard/summary');
}

export function listSystemHospitals() {
  return api<HospitalResponse[]>('/admin/hospitals');
}

export function listSystemMunicipalities() {
  return api<MunicipalityResponse[]>('/admin/hospitals/municipalities');
}

export function createSystemHospital(input: HospitalInput) {
  return api<HospitalResponse>('/admin/hospitals', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateSystemHospital(id: string, input: HospitalInput) {
  return api<HospitalResponse>(`/admin/hospitals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function updateSystemHospitalStatus(id: string, active: boolean) {
  return api<HospitalResponse>(`/admin/hospitals/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ active }),
  });
}

export function updateAdminUser(id: string, input: UpdateAdminUserInput) {
  return api<AdminUserResponse>(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function updateAdminUserStatus(id: string, status: BackendUserStatus) {
  return api<AdminUserResponse>(`/admin/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export type { AdminUserResponse, BackendRoleCode, BackendUserStatus, CreateAdminUserInput };
