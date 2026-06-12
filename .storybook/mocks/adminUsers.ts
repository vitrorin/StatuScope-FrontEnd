export type BackendUserStatus = 'ACTIVE' | 'DISABLED' | 'PENDING';
export type BackendRoleCode = 'SYSTEM_ADMIN' | 'HOSPITAL_ADMIN' | 'DOCTOR';

export interface AdminUserResponse {
  id: string;
  fullName: string;
  email: string;
  hospitalId?: string | null;
  hospitalName?: string | null;
  status: BackendUserStatus;
  roleCodes: BackendRoleCode[];
}

export interface CreateAdminUserInput {
  fullName: string;
  email: string;
  password: string;
  roleCode: BackendRoleCode;
  hospitalId?: string;
}

export const adminUsers: AdminUserResponse[] = [
  { id: 'usr-1', fullName: 'Mariana Lopez', email: 'mariana@central.test', hospitalId: 'hosp-central', hospitalName: 'Central Hospital', status: 'ACTIVE', roleCodes: ['HOSPITAL_ADMIN'] },
  { id: 'usr-2', fullName: 'Dr. Elena Ruiz', email: 'elena@central.test', hospitalId: 'hosp-central', hospitalName: 'Central Hospital', status: 'ACTIVE', roleCodes: ['DOCTOR'] },
  { id: 'usr-3', fullName: 'Alex Morgan', email: 'alex@statuscope.test', hospitalId: null, hospitalName: null, status: 'ACTIVE', roleCodes: ['SYSTEM_ADMIN'] },
  { id: 'usr-4', fullName: 'Dr. Tomas Vega', email: 'tomas@north.test', hospitalId: 'hosp-north', hospitalName: 'North Clinic', status: 'PENDING', roleCodes: ['DOCTOR'] },
];

export async function listAdminUsers() {
  return adminUsers;
}

export async function createAdminUser(input: CreateAdminUserInput) {
  return { id: 'usr-new', fullName: input.fullName, email: input.email, hospitalId: input.hospitalId, hospitalName: 'Central Hospital', status: 'ACTIVE', roleCodes: [input.roleCode] };
}

export async function disableAdminUser() {
  return undefined;
}
