import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { adminNavigationLinks, adminSidebarItems } from '@/components/dashboard/adminNavigation';
import { Button } from '@/components/foundation/Button';
import { StatusBadge } from '@/components/feedback/StatusBadge';
import { InputField } from '@/components/inputs/InputField';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CardBase } from '@/components/patterns/CardBase';
import { PaginationControl } from '@/components/users/PaginationControl';
import { SummaryCountCard } from '@/components/users/SummaryCountCard';
import { UserAvatarBadge } from '@/components/users/UserAvatarBadge';
import { UserEditorOverlay } from '@/components/views/admin/users/Sub-funcionalidades/UserEditorOverlay';
import {
  AdminUserRecord,
  mapRoleTone,
  mapStatusVariant,
  UserRole,
  UserStatus,
} from '@/components/views/admin/users/Sub-funcionalidades/types';
import { initialsFromName } from '@/lib/format';
import { AdminUserResponse, createAdminUser, disableAdminUser, listAdminUsers } from '@/lib/adminUsers';

const roleFilters: ('All' | UserRole)[] = [
  'All',
  'Hospital Administrator',
  'Doctor',
];

const statusFilters: ('All' | UserStatus)[] = ['All', 'Active', 'Inactive'];
const ITEMS_PER_PAGE = 6;

function mapApiUserToRecord(user: AdminUserResponse): AdminUserRecord {
  const primaryRole = user.roleCodes.includes('HOSPITAL_ADMIN') ? 'Hospital Administrator' : 'Doctor';
  const status: UserStatus = user.status === 'ACTIVE' ? 'Active' : 'Inactive';
  return {
    id: user.id,
    initials: initialsFromName(user.fullName),
    name: user.fullName,
    email: user.email,
    role: primaryRole,
    roleTone: mapRoleTone(primaryRole),
    status,
    statusVariant: mapStatusVariant(status),
  };
}

export function AdminUsers() {
  const router = useRouter();
  const { logout, profile } = useAuth();
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRoleFilter, setActiveRoleFilter] = useState<'All' | UserRole>('All');
  const [activeStatusFilter, setActiveStatusFilter] = useState<'All' | UserStatus>('All');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listAdminUsers();
      setUsers(response.map(mapApiUserToRecord));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole = activeRoleFilter === 'All' || user.role === activeRoleFilter;
      const matchesStatus = activeStatusFilter === 'All' || user.status === activeStatusFilter;
      const matchesSearch =
        normalizedQuery.length === 0 ||
        user.name.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery);

      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [activeRoleFilter, activeStatusFilter, searchQuery, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const visibleUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const administratorCount = users.filter((user) => user.role === 'Hospital Administrator').length;
  const medicalStaffCount = users.filter((user) => user.role !== 'Hospital Administrator').length;
  const inactiveUsersCount = users.filter((user) => user.status === 'Inactive').length;

  const openCreate = () => {
    setEditorMode('create');
    setSelectedUser(null);
    setIsEditorOpen(true);
  };

  const openEdit = (user: AdminUserRecord) => {
    setEditorMode('edit');
    setSelectedUser(user);
    setIsEditorOpen(true);
  };

  return (
    <DashboardLayout
      active="users"
      sectionLabel="Users"
      searchPlaceholder="Search users, emails..."
      userName={profile?.fullName ?? 'Hospital Admin'}
      userId={profile?.email ?? undefined}
      avatarText={initialsFromName(profile?.fullName)}
      links={adminNavigationLinks}
      sidebarItems={adminSidebarItems}
      onLogout={async () => { await logout(); router.replace('/login'); }}
    >
      <>
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
                onPress={openCreate}
              />
            </View>

            <CardBase style={styles.filterCard}>
              <View style={styles.searchRow}>
                <InputField
                  placeholder="Search by name or email"
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    setCurrentPage(1);
                  }}
                  leftIcon={<Feather name="search" size={16} color="#94A3B8" />}
                  inputContainerStyle={styles.searchInputContainer}
                  style={styles.searchField}
                />
                <Button
                  label="Filters"
                  variant="secondary"
                  size="md"
                  leadingIcon={<Feather name="sliders" size={15} color="#64748B" />}
                  style={styles.filterToggleButton}
                  onPress={() => setIsFiltersOpen((current) => !current)}
                />
              </View>

              {isFiltersOpen ? (
                <>
                  <View style={styles.filterSection}>
                    <Text style={styles.filterLabel}>Role</Text>
                    <View style={styles.filterChips}>
                      {roleFilters.map((role) => {
                        const isActive = activeRoleFilter === role;
                        return (
                          <TouchableOpacity
                            key={role}
                            style={[styles.filterChip, isActive && styles.filterChipActive]}
                            onPress={() => {
                              setActiveRoleFilter(role);
                              setCurrentPage(1);
                            }}
                            activeOpacity={0.75}
                          >
                            <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{role}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <View style={styles.filterSection}>
                    <Text style={styles.filterLabel}>Status</Text>
                    <View style={styles.filterChips}>
                      {statusFilters.map((status) => {
                        const isActive = activeStatusFilter === status;
                        return (
                          <TouchableOpacity
                            key={status}
                            style={[styles.filterChip, isActive && styles.filterChipActive]}
                            onPress={() => {
                              setActiveStatusFilter(status);
                              setCurrentPage(1);
                            }}
                            activeOpacity={0.75}
                          >
                            <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{status}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </>
              ) : null}
            </CardBase>

            {error ? (
              <CardBase style={styles.errorCard}>
                <Text style={styles.errorTitle}>Users unavailable</Text>
                <Text style={styles.errorText}>{error}</Text>
                <Button label="Retry" variant="secondary" size="sm" onPress={() => { void loadUsers(); }} />
              </CardBase>
            ) : null}

            {loading ? (
              <CardBase style={styles.loadingCard}>
                <ActivityIndicator color="#1718C7" />
                <Text style={styles.loadingText}>Loading users...</Text>
              </CardBase>
            ) : null}

            <CardBase style={styles.tableCard}>
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, styles.nameCol]}>Name</Text>
                <Text style={[styles.headerCell, styles.emailCol]}>Email</Text>
                <Text style={[styles.headerCell, styles.roleCol]}>Role</Text>
                <Text style={[styles.headerCell, styles.statusCol]}>Status</Text>
              </View>

              {visibleUsers.map((user, index) => (
                <TouchableOpacity
                  key={user.id}
                  style={[
                    styles.tableRow,
                    index === visibleUsers.length - 1 && styles.tableRowLast,
                    user.role === 'Hospital Administrator' && styles.tableRowDisabled,
                  ]}
                  activeOpacity={user.role === 'Hospital Administrator' ? 1 : 0.78}
                  disabled={user.role === 'Hospital Administrator'}
                  onPress={() => openEdit(user)}
                >
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
                  <View style={[styles.bodyCell, styles.statusCol]}>
                    <StatusBadge label={user.status} variant={user.statusVariant} />
                  </View>
                </TouchableOpacity>
              ))}

              {visibleUsers.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateTitle}>No users found</Text>
                  <Text style={styles.emptyStateSubtitle}>Try adjusting the current search or filters.</Text>
                </View>
              ) : null}

              <View style={styles.tableFooter}>
                <Text style={styles.tableFooterText}>
                  Showing {filteredUsers.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}-
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
                </Text>
                <PaginationControl
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </View>
            </CardBase>

            <View style={styles.summaryRow}>
              <SummaryCountCard
                title="Administrators"
                value={String(administratorCount)}
                variant="info"
                icon={<MaterialCommunityIcons name="account-cog-outline" size={15} color="#1718C7" />}
                style={styles.summaryCard}
              />
              <SummaryCountCard
                title="Medical Staff"
                value={String(medicalStaffCount)}
                variant="info"
                icon={<MaterialCommunityIcons name="shield-account-outline" size={15} color="#5B63E2" />}
                style={styles.summaryCard}
              />
              <SummaryCountCard
                title="Inactive Users"
                value={String(inactiveUsersCount)}
                variant="neutral"
                icon={<MaterialCommunityIcons name="account-off-outline" size={15} color="#94A3B8" />}
                style={styles.summaryCard}
              />
            </View>
          </View>
        </ScrollView>

        <UserEditorOverlay
          visible={isEditorOpen}
          mode={editorMode}
          user={selectedUser}
          onClose={() => setIsEditorOpen(false)}
          saving={saving}
          onSave={async (nextUser, password) => {
            setSaving(true);
            setError(null);
            try {
              if (editorMode === 'create') {
                if (!password || password.trim().length < 8) {
                  throw new Error('Password must be at least 8 characters.');
                }
                await createAdminUser({
                  fullName: nextUser.name,
                  email: nextUser.email,
                  password,
                  roleCode: nextUser.role === 'Hospital Administrator' ? 'HOSPITAL_ADMIN' : 'DOCTOR',
                });
              } else if (nextUser.status === 'Inactive') {
                await disableAdminUser(nextUser.id);
              }
              await loadUsers();
              setIsEditorOpen(false);
            } catch (nextError) {
              setError(nextError instanceof Error ? nextError.message : 'Unable to save user changes.');
            } finally {
              setSaving(false);
            }
          }}
        />
      </>
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
  filterCard: {
    borderRadius: 18,
    padding: 18,
    gap: 14,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  searchField: {
    flex: 1,
    marginBottom: 0,
  },
  filterToggleButton: {
    minHeight: 46,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchInputContainer: {
    height: 46,
    borderRadius: 12,
    borderColor: '#DCE3EE',
  },
  filterSection: {
    gap: 10,
  },
  filterLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: '#8A9AAF',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#F6F8FC',
    borderWidth: 1,
    borderColor: '#E8EDF5',
  },
  filterChipActive: {
    backgroundColor: '#EEF1FF',
    borderColor: '#C9D1FF',
  },
  filterChipText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: '#70839B',
  },
  filterChipTextActive: {
    color: '#1718C7',
  },
  errorCard: {
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  errorTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: '#B91C1C',
  },
  errorText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#7F1D1D',
  },
  loadingCard: {
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    lineHeight: 18,
    color: '#334155',
    fontWeight: '600',
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
  tableRowDisabled: {
    opacity: 0.82,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
  },
  emptyStateTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyStateSubtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: '#70839B',
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
