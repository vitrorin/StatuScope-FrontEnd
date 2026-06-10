import { Redirect } from 'expo-router';
import { RoleGate } from '@/components/auth/RoleGate';
import AdminRecommendationsView from '@/components/views/admin/recommendations';
import { useAuth } from '@/contexts/AuthContext';

function AdminRecommendationsFallback() {
  const { profile } = useAuth();
  if (profile?.roles.includes('SYSTEM_ADMIN')) {
    return <Redirect href="/system/dashboard" />;
  }
  return <Redirect href="/dashboard/doctor" />;
}

export default function AdminRecommendationsScreen() {
  return (
    <RoleGate
      roles={['HOSPITAL_ADMIN']}
      fallback={<AdminRecommendationsFallback />}
    >
      <AdminRecommendationsView />
    </RoleGate>
  );
}
