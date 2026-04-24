import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { DoctorDashboard } from '@/components/dashboard/DoctorDashboard';

export default function RoleDashboardScreen() {
  const { role } = useLocalSearchParams<{ role?: string }>();

  if (role === 'administrator') {
    return <AdminDashboard />;
  }

  return <DoctorDashboard />;
}
