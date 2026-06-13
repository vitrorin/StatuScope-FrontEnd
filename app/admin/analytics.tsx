import { Redirect } from 'expo-router';
import { RoleGate } from '@/components/auth/RoleGate';
import AdminAnalyticsView from '@/components/views/admin/analytics';

export default function AdminAnalyticsScreen() {
  return (
    <RoleGate
      roles={['HOSPITAL_ADMIN']}
      fallback={<Redirect href="/dashboard/doctor" />}
    >
      <AdminAnalyticsView />
    </RoleGate>
  );
}
