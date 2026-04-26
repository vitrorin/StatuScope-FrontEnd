import { Redirect } from 'expo-router';
import { RoleGate } from '@/components/auth/RoleGate';
import AdminAnalytics from '@/components/dashboard/AdminAnalytics';

export default function AdminAnalyticsScreen() {
  return (
    <RoleGate
      roles={['HOSPITAL_ADMIN', 'SYSTEM_ADMIN']}
      fallback={<Redirect href="/dashboard/doctor" />}
    >
      <AdminAnalytics />
    </RoleGate>
  );
}
