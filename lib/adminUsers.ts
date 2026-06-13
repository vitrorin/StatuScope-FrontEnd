import { api } from './api';

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

export async function listAdminUsers() {
  return api<AdminUserResponse[]>('/admin/users');
}

export async function createAdminUser(input: CreateAdminUserInput) {
  return api('/admin/users', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function disableAdminUser(userId: string) {
  return api<void>(`/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'DISABLED' }),
  });
}
