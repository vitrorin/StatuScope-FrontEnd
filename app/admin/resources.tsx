import { Redirect } from 'expo-router';
import { RoleGate } from '@/components/auth/RoleGate';
import AdminResources from '@/components/views/admin/resources';

export default function AdminResourcesScreen() {
  return (
    <RoleGate
      roles={['HOSPITAL_ADMIN', 'SYSTEM_ADMIN']}
      fallback={<Redirect href="/dashboard/doctor" />}
    >
      <AdminResources />
    </RoleGate>
  );
}
