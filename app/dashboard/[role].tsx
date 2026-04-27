import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { AdminDashboard } from '@/components/views/admin/dashboard';
import { DoctorDashboard } from '@/components/views/doctor/dashboard';

export default function RoleDashboardScreen() {
  const { role } = useLocalSearchParams<{ role?: string }>();

  if (role === 'administrator') {
    return <AdminDashboard />;
  }

  return <DoctorDashboard />;
}
