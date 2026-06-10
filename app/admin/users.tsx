import { Redirect } from 'expo-router';
import { RoleGate } from '@/components/auth/RoleGate';
import AdminUsersView from '@/components/views/admin/users';

export default function AdminUsersScreen() {
  return (
    <RoleGate
      roles={['HOSPITAL_ADMIN']}
      fallback={<Redirect href="/dashboard/doctor" />}
    >
      <AdminUsersView />
    </RoleGate>
  );
}
