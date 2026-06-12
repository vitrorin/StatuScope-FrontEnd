import { adminUsers, AdminUserResponse, BackendRoleCode, BackendUserStatus, CreateAdminUserInput } from './adminUsers';

export type { AdminUserResponse, BackendRoleCode, BackendUserStatus, CreateAdminUserInput };

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

const hospitals: HospitalResponse[] = [
  { id: 'hosp-central', code: 'HSP-001', name: 'Central Hospital', address: 'Av. Salud 120', phone: '+52 999 100 2000', inviteCode: 'CENTRAL-2026', active: true, postalCode: '97000', bedCount: 180, doctorCount: 64, nurseCount: 130, municipalityId: 'mun-merida', municipalityName: 'Merida', stateId: 'yuc', stateName: 'Yucatan', latitude: 20.967, longitude: -89.623 },
  { id: 'hosp-north', code: 'HSP-002', name: 'North Clinic', address: 'Calle Norte 45', phone: '+52 999 300 4000', inviteCode: 'NORTH-2026', active: true, postalCode: '97110', bedCount: 72, doctorCount: 28, nurseCount: 56, municipalityId: 'mun-merida', municipalityName: 'Merida', stateId: 'yuc', stateName: 'Yucatan', latitude: 21.04, longitude: -89.62 },
  { id: 'hosp-coast', code: 'HSP-003', name: 'Coastal Medical Center', address: 'Malecon 88', phone: '+52 999 500 6000', inviteCode: 'COAST-2026', active: false, postalCode: '97320', bedCount: 48, doctorCount: 16, nurseCount: 36, municipalityId: 'mun-progreso', municipalityName: 'Progreso', stateId: 'yuc', stateName: 'Yucatan', latitude: 21.28, longitude: -89.66 },
];

const municipalities: MunicipalityResponse[] = [
  { id: 'mun-merida', code: 'MER', name: 'Merida', stateId: 'yuc', stateName: 'Yucatan', latitude: 20.967, longitude: -89.623 },
  { id: 'mun-progreso', code: 'PRO', name: 'Progreso', stateId: 'yuc', stateName: 'Yucatan', latitude: 21.28, longitude: -89.66 },
];

export async function getSystemDashboardSummary() {
  return {
    generatedAt: '2026-06-10T12:00:00.000Z',
    metrics: [
      { id: 'hospitals', title: 'Hospitals', value: '3', detail: '2 active, 1 inactive', status: 'good', iconKey: 'hospital' },
      { id: 'users', title: 'Users', value: '4', detail: 'Across all hospitals', status: 'good', iconKey: 'users' },
      { id: 'outbreaks', title: 'Nearby Outbreaks', value: '16', detail: 'Mock epidemiology feed', status: 'warning', iconKey: 'alert' },
    ],
    userActivity: [
      { label: 'Mon', value: 18, adminValue: 6, doctorValue: 12 },
      { label: 'Tue', value: 24, adminValue: 8, doctorValue: 16 },
      { label: 'Wed', value: 31, adminValue: 10, doctorValue: 21 },
      { label: 'Thu', value: 27, adminValue: 9, doctorValue: 18 },
    ],
    regionalDistribution: [
      { label: 'Yucatan', value: 3, percent: 100 },
    ],
    recentEvents: [
      { id: 'evt-1', title: 'Hospital created', detail: 'North Clinic joined the platform', type: 'SYSTEM', occurredAt: '2026-06-10T10:30:00.000Z' },
      { id: 'evt-2', title: 'User invited', detail: 'Doctor account pending activation', type: 'USER', occurredAt: '2026-06-10T09:20:00.000Z' },
    ],
    hospitalOutbreaks: hospitals.map((hospital, index) => ({
      id: hospital.id,
      code: hospital.code,
      name: hospital.name,
      municipalityName: hospital.municipalityName,
      stateName: hospital.stateName,
      active: hospital.active,
      latitude: hospital.latitude,
      longitude: hospital.longitude,
      nearbyActiveOutbreakCount: 5 - index,
      radiusKm: 75,
      nearbyOutbreaks: [
        { id: `${hospital.id}-dengue`, diseaseName: 'Dengue', municipalityName: hospital.municipalityName, stateName: hospital.stateName, caseCount: 18 + index, confirmationStatus: 'CONFIRMED', severity: 'HIGH', distanceKm: 8 + index, startedAt: '2026-06-01' },
      ],
    })),
    hospitalUserMetrics: hospitals.map((hospital, index) => ({
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      municipalityName: hospital.municipalityName,
      stateName: hospital.stateName,
      totalUsers: 24 - index * 5,
      activeUsers: 20 - index * 4,
      adminUsers: 2,
      doctorUsers: 18 - index * 4,
      inactiveUsers: 2,
    })),
  };
}

export async function listSystemHospitals() { return hospitals; }
export async function listSystemMunicipalities() { return municipalities; }
export async function createSystemHospital(input: HospitalInput) { return { ...hospitals[0], ...input, id: 'hosp-new', active: true }; }
export async function updateSystemHospital(id: string, input: HospitalInput) { return { ...hospitals[0], ...input, id }; }
export async function updateSystemHospitalStatus(id: string, active: boolean) { return { ...hospitals[0], id, active }; }
export async function updateAdminUser(id: string, input: UpdateAdminUserInput): Promise<AdminUserResponse> { return { ...adminUsers[0], id, fullName: input.fullName, email: input.email, hospitalId: input.hospitalId, status: input.status ?? 'ACTIVE', roleCodes: [input.roleCode] }; }
export async function updateAdminUserStatus(id: string, status: BackendUserStatus): Promise<AdminUserResponse> { return { ...adminUsers[0], id, status }; }
