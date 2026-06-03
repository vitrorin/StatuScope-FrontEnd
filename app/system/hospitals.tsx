import { Redirect } from 'expo-router';
import { RoleGate } from '@/components/auth/RoleGate';
import { SystemHospitals } from '@/components/views/system/hospitals';

export default function SystemHospitalsRoute() {
  return (
    <RoleGate roles={['SYSTEM_ADMIN']} fallback={<Redirect href="/dashboard/doctor" />}>
      <SystemHospitals />
    </RoleGate>
  );
}
