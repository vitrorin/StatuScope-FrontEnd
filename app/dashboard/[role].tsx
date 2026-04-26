import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { RoleGate } from '@/components/auth/RoleGate';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { DoctorDashboard } from '@/components/dashboard/DoctorDashboard';

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
