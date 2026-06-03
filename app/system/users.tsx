import { Redirect } from 'expo-router';
import { RoleGate } from '@/components/auth/RoleGate';
import { SystemUsers } from '@/components/views/system/users';

export default function SystemUsersRoute() {
  return (
    <RoleGate roles={['SYSTEM_ADMIN']} fallback={<Redirect href="/dashboard/doctor" />}>
      <SystemUsers />
    </RoleGate>
  );
}
