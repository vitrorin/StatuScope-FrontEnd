import React from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { adminNavigationLinks, adminSidebarItems } from '@/components/dashboard/adminNavigation';
import { Button } from '@/components/foundation/Button';
import { StatusBadge } from '@/components/feedback/StatusBadge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CardBase } from '@/components/patterns/CardBase';
import { PaginationControl } from '@/components/users/PaginationControl';
import { SummaryCountCard } from '@/components/users/SummaryCountCard';
import { UserAvatarBadge } from '@/components/users/UserAvatarBadge';

const users = [
  {
    initials: 'SS',
    name: 'John Doe',
    email: 'john@statu.scope',
    role: 'Hospital Administrator',
    roleTone: 'neutral' as const,
    pcId: '00010',
    status: 'Active',
    statusVariant: 'success' as const,
  },
  {
    initials: 'SS',
    name: 'Sarah Smith',
    email: 'sarah.s@hospital.com',
    role: 'Hospital Administrator',
    roleTone: 'neutral' as const,
    pcId: '00012',
    status: 'Active',
    statusVariant: 'success' as const,
  },
  {
    initials: 'MR',
    name: 'Dr. Mike Ross',
    email: 'mike.ross@health.org',
    role: 'Doctor',
    roleTone: 'info' as const,
    pcId: '00032',
    status: 'Inactive',
    statusVariant: 'neutral' as const,
  },
  {
    initials: 'EG',
    name: 'Elena Gilbert',
    email: 'elena.g@statu.scope',
    role: 'Doctor',
    roleTone: 'info' as const,
    pcId: '00034',
    status: 'Suspended',
    statusVariant: 'warning' as const,
  },
];

export function AdminUsers() {
  const router = useRouter();

  return (
    <DashboardLayout
      active="users"
      sectionLabel="Users"
      searchPlaceholder="Search users, emails..."
      userName="Dr. Sarah Chen"
      userId="ID: 442910"
      avatarText="SC"
      links={adminNavigationLinks}
      sidebarItems={adminSidebarItems}
      onLogout={() => router.replace('/')}
    >
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroTitle}>User Management</Text>
              <Text style={styles.heroSubtitle}>
                Manage platform access, assign roles, and monitor user status across all hospitals.
              </Text>
            </View>

            <Button
              label="Create New User"
              variant="primary"
              size="lg"
              leadingIcon={<Feather name="user-plus" size={15} color="#FFFFFF" />}
              style={styles.createButton}
            />
          </View>

          <CardBase style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.nameCol]}>Name</Text>
              <Text style={[styles.headerCell, styles.emailCol]}>Email</Text>
              <Text style={[styles.headerCell, styles.roleCol]}>Role</Text>
              <Text style={[styles.headerCell, styles.pcCol]}>PC ID</Text>
              <Text style={[styles.headerCell, styles.statusCol]}>Status</Text>
            </View>

            {users.map((user, index) => (
              <View key={user.email} style={[styles.tableRow, index === users.length - 1 && styles.tableRowLast]}>
                <View style={[styles.bodyCell, styles.nameCol, styles.nameCell]}>
                  <UserAvatarBadge initials={user.initials} variant="default" />
                  <Text style={styles.userName}>{user.name}</Text>
                </View>
                <Text style={[styles.bodyCell, styles.emailCol, styles.emailText]}>{user.email}</Text>
                <View style={[styles.bodyCell, styles.roleCol]}>
                  <View
                    style={[
                      styles.roleBadge,
                      user.roleTone === 'info' ? styles.roleBadgeInfo : styles.roleBadgeNeutral,
                    ]}
                  >
                    <Text
                      style={[
                        styles.roleBadgeText,
                        user.roleTone === 'info' ? styles.roleBadgeTextInfo : styles.roleBadgeTextNeutral,
                      ]}
                    >
                      {user.role}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.bodyCell, styles.pcCol, styles.pcIdText]}>{user.pcId}</Text>
                <View style={[styles.bodyCell, styles.statusCol]}>
                  <StatusBadge label={user.status} variant={user.statusVariant} />
                </View>
              </View>
            ))}

            <View style={styles.tableFooter}>
              <Text style={styles.tableFooterText}>Showing 1-4 of 128 users</Text>
              <PaginationControl currentPage={1} totalPages={12} />
            </View>
          </CardBase>

          <View style={styles.summaryRow}>
            <SummaryCountCard
              title="Administrators"
              value="12"
              variant="info"
              icon={<MaterialCommunityIcons name="account-cog-outline" size={15} color="#1718C7" />}
              style={styles.summaryCard}
            />
            <SummaryCountCard
              title="Medical Staff"
              value="84"
              variant="info"
              icon={<MaterialCommunityIcons name="shield-account-outline" size={15} color="#5B63E2" />}
              style={styles.summaryCard}
            />
            <SummaryCountCard
              title="Inactive/Suspended"
              value="32"
              variant="neutral"
              icon={<MaterialCommunityIcons name="account-off-outline" size={15} color="#94A3B8" />}
              style={styles.summaryCard}
            />
          </View>
        </View>
      </ScrollView>
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 32,
  },
  container: {
    padding: 28,
    gap: 26,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 20,
  },
  heroTitle: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '900',
    color: '#0F172A',
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 22,
    color: '#70839B',
  },
  createButton: {
    minHeight: 40,
    borderRadius: 999,
    backgroundColor: '#1718C7',
    borderColor: '#1718C7',
    paddingHorizontal: 18,
  },
  tableCard: {
    padding: 0,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  headerCell: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: '#7C8CA4',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  bodyCell: {},
  nameCol: {
    flex: 1.45,
  },
  emailCol: {
    flex: 1.55,
  },
  roleCol: {
    flex: 1.25,
  },
  pcCol: {
    flex: 0.9,
  },
  statusCol: {
    flex: 0.95,
  },
  nameCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userName: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  emailText: {
    fontSize: 14,
    lineHeight: 18,
    color: '#64748B',
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  roleBadgeNeutral: {
    backgroundColor: '#EFF2F6',
  },
  roleBadgeInfo: {
    backgroundColor: '#EEF0FF',
  },
  roleBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  roleBadgeTextNeutral: {
    color: '#7C8CA4',
  },
  roleBadgeTextInfo: {
    color: '#6A68F5',
  },
  pcIdText: {
    fontSize: 14,
    lineHeight: 18,
    color: '#64748B',
  },
  tableFooter: {
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tableFooterText: {
    fontSize: 14,
    lineHeight: 18,
    color: '#70839B',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 18,
  },
  summaryCard: {
    flex: 1,
    minHeight: 86,
    borderRadius: 16,
  },
});

export default AdminUsers;
