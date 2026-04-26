import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface RoleGateProps {
  roles?: string[];
  privileges?: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function RoleGate({ roles, privileges, fallback = null, children }: RoleGateProps) {
  const { profile } = useAuth();
  if (!profile) return <>{fallback}</>;
  const roleOk = !roles || roles.length === 0 || roles.some((r) => profile.roles.includes(r));
  const privOk =
    !privileges ||
    privileges.length === 0 ||
    privileges.some((p) => profile.privileges.includes(p));
  return roleOk && privOk ? <>{children}</> : <>{fallback}</>;
}

export default RoleGate;
