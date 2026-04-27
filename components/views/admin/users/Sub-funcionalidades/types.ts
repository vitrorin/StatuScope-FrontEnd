import React from 'react';

export type UserRole = 'Hospital Administrator' | 'Doctor';
export type UserStatus = 'Active' | 'Inactive' | 'Suspended';

export interface AdminUserRecord {
  id: string;
  initials: string;
  name: string;
  email: string;
  role: UserRole;
  roleTone: 'neutral' | 'info';
  pcId: string;
  status: UserStatus;
  statusVariant: 'success' | 'neutral' | 'warning';
}

export const initialUsers: AdminUserRecord[] = [
  {
    id: 'u-1',
    initials: 'JD',
    name: 'John Doe',
    email: 'john@statu.scope',
    role: 'Hospital Administrator',
    roleTone: 'neutral',
    pcId: '00010',
    status: 'Active',
    statusVariant: 'success',
  },
  {
    id: 'u-2',
    initials: 'SS',
    name: 'Sarah Smith',
    email: 'sarah.s@hospital.com',
    role: 'Hospital Administrator',
    roleTone: 'neutral',
    pcId: '00012',
    status: 'Active',
    statusVariant: 'success',
  },
  {
    id: 'u-3',
    initials: 'MR',
    name: 'Dr. Mike Ross',
    email: 'mike.ross@health.org',
    role: 'Doctor',
    roleTone: 'info',
    pcId: '00032',
    status: 'Inactive',
    statusVariant: 'neutral',
  },
  {
    id: 'u-4',
    initials: 'EG',
    name: 'Elena Gilbert',
    email: 'elena.g@statu.scope',
    role: 'Doctor',
    roleTone: 'info',
    pcId: '00034',
    status: 'Suspended',
    statusVariant: 'warning',
  },
];

export function mapRoleTone(role: UserRole) {
  return role === 'Hospital Administrator' ? 'neutral' : 'info';
}

export function mapStatusVariant(status: UserStatus) {
  switch (status) {
    case 'Active':
      return 'success' as const;
    case 'Inactive':
      return 'neutral' as const;
    case 'Suspended':
      return 'warning' as const;
  }
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
