import { Redirect } from 'expo-router';
import { RoleGate } from '@/components/auth/RoleGate';
import AdminUsers from '@/components/views/admin/users';

export default function AdminUsersScreen() {
  return (
    <RoleGate
      roles={['HOSPITAL_ADMIN', 'SYSTEM_ADMIN']}
      fallback={<Redirect href="/dashboard/doctor" />}
    >
      <AdminUsers />
    </RoleGate>
  );
}
