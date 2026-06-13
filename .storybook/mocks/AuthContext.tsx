import React, { createContext, ReactNode, useContext } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  hospitalId: string | null;
  hospitalName: string | null;
  roles: string[];
  privileges: string[];
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  inviteCode: string;
}

export interface AuthContextValue {
  firebaseUser: null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (payload: RegisterPayload) => Promise<UserProfile>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPrivilege: (privilege: string) => boolean;
  isAdmin: () => boolean;
  isSystemAdmin: () => boolean;
}

export const mockProfiles = {
  doctor: {
    id: 'mock-doctor',
    email: 'doctor@statuscope.test',
    fullName: 'Dr. Elena Ruiz',
    hospitalId: 'hosp-central',
    hospitalName: 'Central Hospital',
    roles: ['DOCTOR'],
    privileges: ['diagnosis:read', 'diagnosis:write'],
  },
  hospitalAdmin: {
    id: 'mock-admin',
    email: 'admin@statuscope.test',
    fullName: 'Mariana Lopez',
    hospitalId: 'hosp-central',
    hospitalName: 'Central Hospital',
    roles: ['HOSPITAL_ADMIN'],
    privileges: ['resources:write', 'users:read', 'recommendations:write'],
  },
  systemAdmin: {
    id: 'mock-system',
    email: 'system@statuscope.test',
    fullName: 'Alex Morgan',
    hospitalId: null,
    hospitalName: null,
    roles: ['SYSTEM_ADMIN'],
    privileges: ['isSystemAdmin'],
  },
} satisfies Record<string, UserProfile>;

export function createMockAuthValue(profile: UserProfile | null = mockProfiles.hospitalAdmin): AuthContextValue {
  return {
    firebaseUser: null,
    profile,
    loading: false,
    login: async () => profile ?? mockProfiles.doctor,
    register: async (payload) => ({
      ...mockProfiles.doctor,
      fullName: payload.fullName,
      email: payload.email,
    }),
    logout: async () => undefined,
    hasRole: (role) => Boolean(profile?.roles.includes(role)),
    hasPrivilege: (privilege) => Boolean(profile?.privileges.includes(privilege)),
    isAdmin: () => Boolean(profile?.roles.includes('HOSPITAL_ADMIN')),
    isSystemAdmin: () => Boolean(profile?.roles.includes('SYSTEM_ADMIN') || profile?.privileges.includes('isSystemAdmin')),
  };
}

const defaultAuthValue = createMockAuthValue();

export const AuthContext = createContext<AuthContextValue | undefined>(defaultAuthValue);

export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthContext.Provider value={defaultAuthValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext) ?? defaultAuthValue;
}
