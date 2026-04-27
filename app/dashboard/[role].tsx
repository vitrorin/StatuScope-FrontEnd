import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { RoleGate } from '@/components/auth/RoleGate';
import { AdminDashboard } from '@/components/views/admin/dashboard';
import { DoctorDashboard } from '@/components/views/doctor/dashboard';

export default function RoleDashboardScreen() {
  const { role } = useLocalSearchParams<{ role?: string }>();

  if (role === 'administrator') {
    return (
      <RoleGate
        roles={['HOSPITAL_ADMIN', 'SYSTEM_ADMIN']}
        fallback={<Redirect href="/dashboard/doctor" />}
      >
        <AdminDashboard />
      </RoleGate>
    );
  }

  return <DoctorDashboard />;
}
