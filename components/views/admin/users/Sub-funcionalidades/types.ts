export type UserRole = 'Hospital Administrator' | 'Doctor';
export type UserStatus = 'Active' | 'Inactive' | 'Suspended';

export interface AdminUserRecord {
  id: string;
  initials: string;
  name: string;
  email: string;
  role: UserRole;
  roleTone: 'neutral' | 'info';
  status: UserStatus;
  statusVariant: 'success' | 'neutral' | 'warning';
}

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
