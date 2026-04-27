import { Redirect } from 'expo-router';
import { RoleGate } from '@/components/auth/RoleGate';
import AdminRecommendations from '@/components/views/admin/recommendations';

export default function AdminRecommendationsScreen() {
  return (
    <RoleGate
      roles={['HOSPITAL_ADMIN', 'SYSTEM_ADMIN']}
      fallback={<Redirect href="/dashboard/doctor" />}
    >
      <AdminRecommendations />
    </RoleGate>
  );
}
