import { Redirect } from 'expo-router';
import { RoleGate } from '@/components/auth/RoleGate';
import { SystemDashboard } from '@/components/views/system/dashboard';

export default function SystemDashboardRoute() {
  return (
    <RoleGate roles={['SYSTEM_ADMIN']} privileges={['isSystemAdmin']} fallback={<Redirect href="/dashboard/doctor" />}>
      <SystemDashboard />
    </RoleGate>
  );
}
