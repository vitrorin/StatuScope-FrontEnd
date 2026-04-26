import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { api } from '@/lib/api';

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

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (payload: RegisterPayload) => Promise<UserProfile>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPrivilege: (priv: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type RawProfile = Omit<UserProfile, 'roles' | 'privileges'> & {
  roles: string[] | null | undefined;
  privileges: string[] | null | undefined;
};

function normalizeProfile(raw: RawProfile): UserProfile {
  return {
    ...raw,
    roles: raw.roles ?? [],
    privileges: raw.privileges ?? [],
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const me = await api<RawProfile>('/auth/me');
          setProfile(normalizeProfile(me));
        } catch {
          await signOut(firebaseAuth).catch(() => undefined);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(firebaseAuth, email, password);
    const me = normalizeProfile(await api<RawProfile>('/auth/me'));
    setProfile(me);
    return me;
  };

  const register = async (payload: RegisterPayload) => {
    await api<RawProfile>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return login(payload.email, payload.password);
  };

  const logout = async () => {
    await signOut(firebaseAuth);
    setProfile(null);
  };

  const hasRole = (r: string) => !!profile?.roles?.includes(r);
  const hasPrivilege = (p: string) => !!profile?.privileges?.includes(p);

  return (
    <AuthContext.Provider
      value={{ firebaseUser, profile, loading, login, register, logout, hasRole, hasPrivilege }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
