import React from 'react';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SummaryCountCard } from '@/components/users/SummaryCountCard';
import { StaffingStatusCard } from '@/components/resources/StaffingStatusCard';
import { InventoryProgressCard } from '@/components/resources/InventoryProgressCard';
import { UserTableCard, UserData } from '@/components/users/UserTableCard';

const users: UserData[] = [
  {
    initials: 'SC',
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@hospital.com',
    role: 'Doctor',
    pcId: '442910',
    status: 'Active',
    statusVariant: 'success',
  },
  {
    initials: 'AM',
    name: 'Ana Martinez',
    email: 'ana.martinez@hospital.com',
    role: 'Admin',
    pcId: '442911',
    status: 'Review',
    statusVariant: 'warning',
  },
  {
    initials: 'JR',
    name: 'Jorge Rivera',
    email: 'jorge.rivera@hospital.com',
    role: 'Analyst',
    pcId: '442912',
    status: 'Online',
    statusVariant: 'info',
  },
  {
    initials: 'LC',
    name: 'Laura Cruz',
    email: 'laura.cruz@hospital.com',
    role: 'Nurse',
    pcId: '442913',
    status: 'Offline',
    statusVariant: 'neutral',
  },
];

const navigationLinks = {
  dashboard: '/dashboard/administrator',
} as const;

export function AdminDashboard() {
  const router = useRouter();

  return (
    <DashboardLayout
      active="dashboard"
      sectionLabel="Dashboard"
      searchPlaceholder="Search users, departments..."
      userName="Admin Martinez"
      userId="ID: 001245"
      avatarText="AM"
      links={navigationLinks}
      onLogout={() => router.replace('/')}
    >
      <View style={styles.container}>
        <View style={styles.metricsRow}>
          <SummaryCountCard
            title="Active Staff"
            value="284"
            variant="info"
            style={styles.metricCard}
            icon={<Feather name="users" size={18} color="#2563EB" />}
          />
          <SummaryCountCard
            title="Open Incidents"
            value="12"
            variant="warning"
            style={styles.metricCard}
            icon={<Feather name="alert-triangle" size={18} color="#D97706" />}
          />
          <SummaryCountCard
            title="System Status"
            value="Stable"
            variant="neutral"
            style={styles.metricCard}
            icon={<Feather name="activity" size={18} color="#6B7280" />}
          />
        </View>

        <View style={styles.secondaryRow}>
          <StaffingStatusCard
            title="Emergency Shift Coverage"
            subtitle="Tonight 18:00 - 06:00"
            value="92%"
            variant="doctor"
            style={styles.halfCard}
          />
          <InventoryProgressCard
            title="Critical Supplies"
            valueText="74%"
            progress={74}
            statusText="Stock levels within acceptable range"
            variant="warning"
            style={styles.halfCard}
          />
        </View>

        <UserTableCard
          title="Operational Users"
          users={users}
          showPagination
          currentPage={1}
          totalPages={5}
          style={styles.tableCard}
        />

        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>
            Administrative overview for user access, staffing coordination, and operational status.
          </Text>
        </View>
      </View>
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    gap: 24,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  metricCard: {
    flex: 1,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 24,
  },
  halfCard: {
    flex: 1,
  },
  tableCard: {
    flex: 1,
  },
  footerNote: {
    alignItems: 'flex-start',
  },
  footerNoteText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
  },
});

export default AdminDashboard;
