import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const { profile } = useAuth();
  if (!profile) {
    return <Redirect href="/login" />;
  }
  const target =
    profile.roles.includes('SYSTEM_ADMIN') || profile.roles.includes('HOSPITAL_ADMIN')
      ? '/dashboard/administrator'
      : '/dashboard/doctor';
  return <Redirect href={target} />;
}
