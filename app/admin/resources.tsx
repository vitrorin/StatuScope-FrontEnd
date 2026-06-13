import { Redirect } from 'expo-router';
import { RoleGate } from '@/components/auth/RoleGate';
import AdminResourcesView from '@/components/views/admin/resources';

export default function AdminResourcesScreen() {
  return (
    <RoleGate
      roles={['HOSPITAL_ADMIN']}
      fallback={<Redirect href="/dashboard/doctor" />}
    >
      <AdminResourcesView />
    </RoleGate>
  );
}
