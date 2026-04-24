import type { ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'

interface RoleGateProps {
  roles?: string[]
  privileges?: string[]
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Renders children only if the current user has at least one of the
 * required roles OR at least one of the required privileges.
 */
export default function RoleGate({ roles, privileges, children, fallback = null }: RoleGateProps) {
  const { profile } = useAuth()

  if (!profile) return <>{fallback}</>

  const hasRole = roles?.some((r) => profile.roles.includes(r)) ?? false
  const hasPrivilege = privileges?.some((p) => profile.privileges.includes(p)) ?? false

  if ((roles && hasRole) || (privileges && hasPrivilege) || (!roles && !privileges)) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
