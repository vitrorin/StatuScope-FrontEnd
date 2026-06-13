import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { adminNavigationLinks, getAdminSidebarItems } from '@/components/dashboard/adminNavigation';
import { Button } from '@/components/foundation/Button';
import { SelectableChip } from '@/components/foundation/SelectableChip';
import { EmptyState } from '@/components/feedback/EmptyState';
import { SkeletonLine } from '@/components/feedback/SkeletonLine';
import { StatusBadge } from '@/components/feedback/StatusBadge';
import { InputField } from '@/components/inputs/InputField';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CardBase } from '@/components/patterns/CardBase';
import { PaginationControl } from '@/components/users/PaginationControl';
import { SummaryCountCard } from '@/components/users/SummaryCountCard';
import { UserAvatarBadge } from '@/components/users/UserAvatarBadge';
import { OperationalContactEditorOverlay } from '@/components/views/admin/users/Sub-funcionalidades/OperationalContactEditorOverlay';
import { UserEditorOverlay } from '@/components/views/admin/users/Sub-funcionalidades/UserEditorOverlay';
import { useTranslation } from '@/i18n';
import {
  getAdminUserRoleLabel,
  getAdminUserStatusLabel,
  getHospitalAdminLabel,
  isSpanish,
} from '@/components/views/admin/localization';
import {
  AdminUserRecord,
  mapRoleTone,
  mapStatusVariant,
  UserRole,
  UserStatus,
} from '@/components/views/admin/users/Sub-funcionalidades/types';
import { initialsFromName } from '@/lib/format';
import { AdminUserResponse, createAdminUser, disableAdminUser, listAdminUsers } from '@/lib/adminUsers';
import {
  createOperationalContact,
  getAdminResourceDepartments,
  HospitalDepartmentResourceResponse,
  listOperationalContacts,
  OperationalContactInput,
  OperationalContactResponse,
  updateOperationalContact,
} from '@/lib/adminOperational';
import { AppColors, withAlpha } from '@/constants/theme';

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
  const { language } = useTranslation();
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [contacts, setContacts] = useState<OperationalContactResponse[]>([]);
  const [departments, setDepartments] = useState<HospitalDepartmentResourceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [contactSaving, setContactSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'users' | 'directory'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRoleFilter, setActiveRoleFilter] = useState<'All' | UserRole>('All');
  const [activeStatusFilter, setActiveStatusFilter] = useState<'All' | UserStatus>('All');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<OperationalContactResponse | null>(null);
  const [isContactEditorOpen, setIsContactEditorOpen] = useState(false);

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

  const loadContacts = useCallback(async () => {
    setContactsLoading(true);
    setError(null);
    try {
      const response = await listOperationalContacts();
      setContacts(response);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to load operational directory.');
    } finally {
      setContactsLoading(false);
    }
  }, []);

  const loadDepartments = useCallback(async () => {
    try {
      const response = await getAdminResourceDepartments();
      setDepartments(response.data ?? []);
    } catch {
      setDepartments([]);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
    void loadContacts();
    void loadDepartments();
  }, [loadContacts, loadDepartments, loadUsers]);

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

  const filteredContacts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return contacts.filter((contact) => {
      if (normalizedQuery.length === 0) return true;
      return (
        contact.displayName.toLowerCase().includes(normalizedQuery) ||
        contact.roleLabel.toLowerCase().includes(normalizedQuery) ||
        (contact.contactValue ?? '').toLowerCase().includes(normalizedQuery) ||
        (contact.departmentCode ?? '').toLowerCase().includes(normalizedQuery)
      );
    });
  }, [contacts, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const visibleUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const visibleContacts = filteredContacts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const administratorCount = users.filter((user) => user.role === 'Hospital Administrator').length;
  const medicalStaffCount = users.filter((user) => user.role !== 'Hospital Administrator').length;
  const inactiveUsersCount = users.filter((user) => user.status === 'Inactive').length;
  const assignableContactCount = contacts.filter((contact) => contact.assignable && contact.availabilityStatus !== 'INACTIVE').length;
  const notifiableContactCount = contacts.filter((contact) => contact.notifiable && contact.availabilityStatus !== 'INACTIVE').length;
  const inactiveContactCount = contacts.filter((contact) => contact.availabilityStatus !== 'ACTIVE').length;
  const hospitalAdminLabel = getHospitalAdminLabel(language);
  const roleLabel = (role: 'All' | UserRole) => getAdminUserRoleLabel(role, language);
  const statusLabel = (status: 'All' | UserStatus) => getAdminUserStatusLabel(status, language);
  const sidebarItems = useMemo(() => getAdminSidebarItems(language), [language]);

  const openCreate = () => {
    setEditorMode('create');
    setSelectedUser(null);
    setIsEditorOpen(true);
  };

  const openCreateContact = () => {
    setSelectedContact(null);
    setIsContactEditorOpen(true);
  };

  const openEditContact = (contact: OperationalContactResponse) => {
    setSelectedContact(contact);
    setIsContactEditorOpen(true);
  };

  const primaryAction = activeSection === 'users' ? openCreate : openCreateContact;

  const openEdit = (user: AdminUserRecord) => {
    setEditorMode('edit');
    setSelectedUser(user);
    setIsEditorOpen(true);
  };

  return (
    <DashboardLayout
      active="users"
      sectionLabel={isSpanish(language) ? 'Usuarios' : 'Users'}
      userName={profile?.fullName ?? hospitalAdminLabel}
      userId={profile?.email ?? undefined}
      avatarText={initialsFromName(profile?.fullName)}
      links={adminNavigationLinks}
      sidebarItems={sidebarItems}
      onLogout={async () => { await logout(); router.replace('/login'); }}
    >
      <>
        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <View style={styles.heroStrip}>
              <View style={styles.heroCopy}>
                <Text style={styles.heroEyebrow}>{isSpanish(language) ? 'Control de acceso' : 'Access Control'}</Text>
                <Text style={styles.heroTitle}>{isSpanish(language) ? 'Gestion de usuarios' : 'User Management'}</Text>
                <Text style={styles.heroDescription}>
                  {isSpanish(language)
                    ? 'Administra el acceso a la plataforma, asigna roles y monitorea el estado de los usuarios en todos los hospitales.'
                    : 'Manage platform access, assign roles, and monitor user status across all hospitals.'}
                </Text>
              </View>

              <Button
                label={activeSection === 'users'
                  ? (isSpanish(language) ? 'Crear usuario' : 'Create New User')
                  : (isSpanish(language) ? 'Agregar contacto' : 'Add Contact')}
                variant="primary"
                size="lg"
                leadingIcon={<Feather name={activeSection === 'users' ? 'user-plus' : 'mail'} size={15} color={AppColors.surface.card} />}
                style={styles.createButton}
                onPress={primaryAction}
              />
            </View>

            <CardBase style={styles.filterCard}>
              <View style={styles.sectionSwitch}>
                <TouchableOpacity
                  style={[styles.sectionSwitchButton, activeSection === 'users' && styles.sectionSwitchButtonActive]}
                  onPress={() => {
                    setActiveSection('users');
                    setCurrentPage(1);
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.sectionSwitchText, activeSection === 'users' && styles.sectionSwitchTextActive]}>
                    {isSpanish(language) ? 'Usuarios' : 'Users'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sectionSwitchButton, activeSection === 'directory' && styles.sectionSwitchButtonActive]}
                  onPress={() => {
                    setActiveSection('directory');
                    setCurrentPage(1);
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.sectionSwitchText, activeSection === 'directory' && styles.sectionSwitchTextActive]}>
                    {isSpanish(language) ? 'Directorio operativo' : 'Operational Directory'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.searchRow}>
                <InputField
                  placeholder={activeSection === 'users'
                    ? (isSpanish(language) ? 'Buscar por nombre o correo' : 'Search by name or email')
                    : (isSpanish(language) ? 'Buscar contacto, cargo, correo o departamento' : 'Search contact, role, email or department')}
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    setCurrentPage(1);
                  }}
                  leftIcon={<Feather name="search" size={16} color={AppColors.text.muted} />}
                  inputContainerStyle={styles.searchInputContainer}
                  style={styles.searchField}
                />
                <Button
                  label={isSpanish(language) ? 'Filtros' : 'Filters'}
                  variant="secondary"
                  size="md"
                  leadingIcon={<Feather name="sliders" size={15} color={AppColors.text.secondary} />}
                  style={styles.filterToggleButton}
                  onPress={() => setIsFiltersOpen((current) => !current)}
                  disabled={activeSection !== 'users'}
                />
              </View>

              {isFiltersOpen && activeSection === 'users' ? (
                <>
                  <View style={styles.filterSection}>
                    <Text style={styles.filterLabel}>{isSpanish(language) ? 'Rol' : 'Role'}</Text>
                    <View style={styles.filterChips}>
                      {roleFilters.map((role) => {
                        const isActive = activeRoleFilter === role;
                        return (
                          <SelectableChip
                            key={role}
                            label={roleLabel(role)}
                            selected={isActive}
                            style={styles.filterChip}
                            selectedStyle={styles.filterChipActive}
                            labelStyle={styles.filterChipText}
                            selectedLabelStyle={styles.filterChipTextActive}
                            onPress={() => {
                              setActiveRoleFilter(role);
                              setCurrentPage(1);
                            }}
                          />
                        );
                      })}
                    </View>
                  </View>

                  <View style={styles.filterSection}>
                    <Text style={styles.filterLabel}>{isSpanish(language) ? 'Estado' : 'Status'}</Text>
                    <View style={styles.filterChips}>
                      {statusFilters.map((status) => {
                        const isActive = activeStatusFilter === status;
                        return (
                          <SelectableChip
                            key={status}
                            label={statusLabel(status)}
                            selected={isActive}
                            style={styles.filterChip}
                            selectedStyle={styles.filterChipActive}
                            labelStyle={styles.filterChipText}
                            selectedLabelStyle={styles.filterChipTextActive}
                            onPress={() => {
                              setActiveStatusFilter(status);
                              setCurrentPage(1);
                            }}
                          />
                        );
                      })}
                    </View>
                  </View>
                </>
              ) : null}
            </CardBase>

            {error ? (
              <CardBase style={styles.errorCard}>
                <Text style={styles.errorTitle}>{isSpanish(language) ? 'Usuarios no disponibles' : 'Users unavailable'}</Text>
                <Text style={styles.errorText}>{error}</Text>
                <Button label={isSpanish(language) ? 'Reintentar' : 'Retry'} variant="secondary" size="sm" onPress={() => { void loadUsers(); }} />
              </CardBase>
            ) : null}

            {activeSection === 'users' && loading ? (
              <UsersTableSkeleton mode="users" />
            ) : null}

            {activeSection === 'directory' && contactsLoading ? (
              <UsersTableSkeleton mode="directory" />
            ) : null}

            {activeSection === 'users' && !loading ? (
              <CardBase style={styles.tableCard}>
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, styles.nameCol]}>{isSpanish(language) ? 'Nombre' : 'Name'}</Text>
                <Text style={[styles.headerCell, styles.emailCol]}>Email</Text>
                <Text style={[styles.headerCell, styles.roleCol]}>{isSpanish(language) ? 'Rol' : 'Role'}</Text>
                <Text style={[styles.headerCell, styles.statusCol]}>{isSpanish(language) ? 'Estado' : 'Status'}</Text>
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
                        {getAdminUserRoleLabel(user.role, language)}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.bodyCell, styles.statusCol]}>
                    <StatusBadge label={getAdminUserStatusLabel(user.status, language)} variant={user.statusVariant} />
                  </View>
                </TouchableOpacity>
              ))}

              {visibleUsers.length === 0 ? (
                <EmptyState
                  style={styles.emptyState}
                  title={isSpanish(language) ? 'No se encontraron usuarios' : 'No users found'}
                  message={isSpanish(language) ? 'Prueba ajustando la busqueda o los filtros.' : 'Try adjusting the current search or filters.'}
                />
              ) : null}

              <View style={styles.tableFooter}>
                <Text style={styles.tableFooterText}>
                  {isSpanish(language) ? 'Mostrando ' : 'Showing '}
                  {filteredUsers.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}-
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}
                  {isSpanish(language) ? ' de ' : ' of '}
                  {filteredUsers.length}
                  {isSpanish(language) ? ' usuarios' : ' users'}
                </Text>
                <PaginationControl
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </View>
              </CardBase>
            ) : activeSection === 'directory' && !contactsLoading ? (
              <CardBase style={styles.tableCard}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.headerCell, styles.nameCol]}>{isSpanish(language) ? 'Contacto' : 'Contact'}</Text>
                  <Text style={[styles.headerCell, styles.emailCol]}>Email</Text>
                  <Text style={[styles.headerCell, styles.roleCol]}>{isSpanish(language) ? 'Departamento' : 'Department'}</Text>
                  <Text style={[styles.headerCell, styles.statusCol]}>{isSpanish(language) ? 'Estado' : 'Status'}</Text>
                </View>

                {visibleContacts.map((contact, index) => (
                  <TouchableOpacity
                    key={contact.id}
                    style={[styles.tableRow, index === visibleContacts.length - 1 && styles.tableRowLast]}
                    activeOpacity={0.78}
                    onPress={() => openEditContact(contact)}
                  >
                    <View style={[styles.bodyCell, styles.nameCol, styles.nameCell]}>
                      <UserAvatarBadge initials={initialsFromName(contact.displayName)} variant="default" />
                      <View>
                        <Text style={styles.userName}>{contact.displayName}</Text>
                        <Text style={styles.contactMeta}>{contact.roleLabel}</Text>
                      </View>
                    </View>
                    <Text style={[styles.bodyCell, styles.emailCol, styles.emailText]}>{contact.contactValue}</Text>
                    <Text style={[styles.bodyCell, styles.roleCol, styles.emailText]}>{contact.departmentCode ?? '-'}</Text>
                    <View style={[styles.bodyCell, styles.statusCol]}>
                      <StatusBadge
                        label={contact.availabilityStatus === 'INACTIVE' ? (isSpanish(language) ? 'Inactivo' : 'Inactive') : (isSpanish(language) ? 'Activo' : 'Active')}
                        variant={contact.availabilityStatus === 'INACTIVE' ? 'neutral' : 'success'}
                      />
                    </View>
                  </TouchableOpacity>
                ))}

                {visibleContacts.length === 0 ? (
                  <EmptyState
                    style={styles.emptyState}
                    title={isSpanish(language) ? 'No hay contactos' : 'No contacts found'}
                    message={isSpanish(language) ? 'Agrega contactos para asignar tareas y enviar avisos reales por correo.' : 'Add contacts to assign tasks and send real email notices.'}
                  />
                ) : null}

                <View style={styles.tableFooter}>
                  <Text style={styles.tableFooterText}>
                    {isSpanish(language) ? 'Mostrando ' : 'Showing '}
                    {filteredContacts.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}-
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredContacts.length)}
                    {isSpanish(language) ? ' de ' : ' of '}
                    {filteredContacts.length}
                    {isSpanish(language) ? ' contactos' : ' contacts'}
                  </Text>
                  <PaginationControl
                    currentPage={currentPage}
                    totalPages={Math.max(1, Math.ceil(filteredContacts.length / ITEMS_PER_PAGE))}
                    onPageChange={setCurrentPage}
                  />
                </View>
              </CardBase>
            ) : null}

            <View style={styles.summaryRow}>
              {activeSection === 'users' ? (
                <>
                  <SummaryCountCard
                title={isSpanish(language) ? 'Administradores' : 'Administrators'}
                value={String(administratorCount)}
                variant="info"
                icon={<MaterialCommunityIcons name="account-cog-outline" size={15} color={AppColors.brand.action} />}
                style={styles.summaryCard}
                  />
                  <SummaryCountCard
                title={isSpanish(language) ? 'Personal medico' : 'Medical Staff'}
                value={String(medicalStaffCount)}
                variant="info"
                icon={<MaterialCommunityIcons name="shield-account-outline" size={15} color={AppColors.brand.purple} />}
                style={styles.summaryCard}
                  />
                  <SummaryCountCard
                title={isSpanish(language) ? 'Usuarios inactivos' : 'Inactive Users'}
                value={String(inactiveUsersCount)}
                variant="neutral"
                icon={<MaterialCommunityIcons name="account-off-outline" size={15} color={AppColors.text.muted} />}
                style={styles.summaryCard}
                  />
                </>
              ) : (
                <>
                  <SummaryCountCard
                    title={isSpanish(language) ? 'Asignables' : 'Assignable'}
                    value={String(assignableContactCount)}
                    variant="info"
                    icon={<MaterialCommunityIcons name="clipboard-account-outline" size={15} color={AppColors.brand.action} />}
                    style={styles.summaryCard}
                  />
                  <SummaryCountCard
                    title={isSpanish(language) ? 'Notificables' : 'Notifiable'}
                    value={String(notifiableContactCount)}
                    variant="info"
                    icon={<MaterialCommunityIcons name="email-outline" size={15} color={AppColors.brand.purple} />}
                    style={styles.summaryCard}
                  />
                  <SummaryCountCard
                    title={isSpanish(language) ? 'Contactos inactivos' : 'Inactive Contacts'}
                    value={String(inactiveContactCount)}
                    variant="neutral"
                    icon={<MaterialCommunityIcons name="account-cancel-outline" size={15} color={AppColors.text.muted} />}
                    style={styles.summaryCard}
                  />
                </>
              )}
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
                  throw new Error(isSpanish(language) ? 'La contrasena debe tener al menos 8 caracteres.' : 'Password must be at least 8 characters.');
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
              setError(nextError instanceof Error ? nextError.message : isSpanish(language) ? 'No se pudieron guardar los cambios del usuario.' : 'Unable to save user changes.');
            } finally {
              setSaving(false);
            }
          }}
        />

        <OperationalContactEditorOverlay
          visible={isContactEditorOpen}
          contact={selectedContact}
          departments={departments}
          saving={contactSaving}
          onClose={() => setIsContactEditorOpen(false)}
          onSave={async (input: OperationalContactInput) => {
            setContactSaving(true);
            setError(null);
            try {
              if (selectedContact) {
                await updateOperationalContact(selectedContact.id, input);
              } else {
                await createOperationalContact(input);
              }
              await loadContacts();
              setIsContactEditorOpen(false);
            } catch (nextError) {
              setError(nextError instanceof Error ? nextError.message : isSpanish(language) ? 'No se pudo guardar el contacto.' : 'Unable to save contact.');
            } finally {
              setContactSaving(false);
            }
          }}
        />
      </>
    </DashboardLayout>
  );
}

function UsersTableSkeleton({ mode }: { mode: 'users' | 'directory' }) {
  return (
    <CardBase style={styles.tableCard}>
      <View style={styles.tableHeader}>
        <View style={styles.nameCol}><SkeletonLine width="100%" height={12} /></View>
        <View style={styles.emailCol}><SkeletonLine width="100%" height={12} /></View>
        <View style={styles.roleCol}><SkeletonLine width="100%" height={12} /></View>
        <View style={styles.statusCol}><SkeletonLine width="100%" height={12} /></View>
      </View>
      {[0, 1, 2, 3, 4].map((item) => (
        <View key={item} style={[styles.tableRow, item === 4 && styles.tableRowLast]}>
          <View style={[styles.bodyCell, styles.nameCol, styles.nameCell]}>
            <View style={styles.usersSkeletonAvatar} />
            <View style={styles.usersSkeletonNameStack}>
              <SkeletonLine width={item === 1 ? 116 : 148} height={14} />
              {mode === 'directory' ? <SkeletonLine width={88} height={10} /> : null}
            </View>
          </View>
          <View style={[styles.bodyCell, styles.emailCol]}>
            <SkeletonLine width={item === 2 ? 154 : 190} />
          </View>
          <View style={[styles.bodyCell, styles.roleCol]}>
            <View style={styles.usersSkeletonBadge} />
          </View>
          <View style={[styles.bodyCell, styles.statusCol]}>
            <View style={[styles.usersSkeletonBadge, styles.usersSkeletonStatus]} />
          </View>
        </View>
      ))}
      <View style={styles.tableFooter}>
        <SkeletonLine width={160} />
        <View style={styles.usersSkeletonPager}>
          <View style={styles.usersSkeletonPagerButton} />
          <View style={styles.usersSkeletonPagerButton} />
        </View>
      </View>
    </CardBase>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 32,
  },
  container: {
    padding: 24,
    gap: 24,
  },
  heroStrip: {
    paddingHorizontal: 24,
    paddingVertical: 22,
    borderRadius: 24,
    backgroundColor: AppColors.surface.raised,
    borderWidth: 1,
    borderColor: withAlpha(AppColors.brand.primary, 0.08),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: AppColors.shadow.blue,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 26,
    elevation: 4,
  },
  heroCopy: {
    flex: 1,
    paddingRight: 24,
  },
  heroEyebrow: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: AppColors.brand.primary,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '700',
    color: AppColors.text.primary,
    marginBottom: 8,
    maxWidth: 720,
  },
  heroDescription: {
    fontSize: 15,
    lineHeight: 24,
    color: AppColors.text.body,
    maxWidth: 760,
  },
  createButton: {
    minHeight: 40,
    borderRadius: 12,
    backgroundColor: AppColors.brand.action,
    borderColor: AppColors.brand.action,
    paddingHorizontal: 18,
  },
  filterCard: {
    borderRadius: 16,
    padding: 18,
    gap: 14,
  },
  sectionSwitch: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    padding: 4,
    borderRadius: 14,
    backgroundColor: AppColors.surface.muted,
    borderWidth: 1,
    borderColor: AppColors.border.default,
  },
  sectionSwitchButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  sectionSwitchButtonActive: {
    backgroundColor: AppColors.surface.card,
    shadowColor: AppColors.text.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 2,
  },
  sectionSwitchText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: AppColors.text.secondary,
  },
  sectionSwitchTextActive: {
    color: AppColors.brand.action,
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
    borderColor: AppColors.border.default,
  },
  filterSection: {
    gap: 10,
  },
  filterLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: AppColors.text.muted,
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
    backgroundColor: AppColors.surface.subtle,
    borderWidth: 1,
    borderColor: AppColors.resourceStatus.stable.track,
  },
  filterChipActive: {
    backgroundColor: AppColors.surface.brandSoft,
    borderColor: AppColors.border.brandMuted,
  },
  filterChipText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: AppColors.text.soft,
  },
  filterChipTextActive: {
    color: AppColors.brand.action,
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
    color: AppColors.status.dangerDark,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 20,
    color: AppColors.status.dangerDark,
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
    color: AppColors.text.body,
    fontWeight: '600',
  },
  tableCard: {
    padding: 0,
    overflow: 'hidden',
    backgroundColor: AppColors.surface.card,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border.soft,
  },
  headerCell: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: AppColors.text.soft,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border.soft,
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
    color: AppColors.text.strong,
  },
  contactMeta: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: AppColors.text.soft,
  },
  emailText: {
    fontSize: 14,
    lineHeight: 18,
    color: AppColors.text.secondary,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  roleBadgeNeutral: {
    backgroundColor: AppColors.surface.control,
  },
  roleBadgeInfo: {
    backgroundColor: AppColors.decorative.dashboardRoleWash,
  },
  roleBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  roleBadgeTextNeutral: {
    color: AppColors.text.soft,
  },
  roleBadgeTextInfo: {
    color: AppColors.brand.purple,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    borderWidth: 0,
    borderRadius: 0,
    borderTopWidth: 1,
    borderTopColor: AppColors.border.soft,
    backgroundColor: AppColors.surface.card,
  },
  tableFooter: {
    borderTopWidth: 1,
    borderTopColor: AppColors.border.soft,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tableFooterText: {
    fontSize: 14,
    lineHeight: 18,
    color: AppColors.text.soft,
  },
  usersSkeletonAvatar: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: AppColors.surface.brandSoft,
  },
  usersSkeletonNameStack: {
    gap: 7,
  },
  usersSkeletonBadge: {
    width: 128,
    height: 28,
    borderRadius: 999,
    backgroundColor: AppColors.border.soft,
  },
  usersSkeletonStatus: {
    width: 82,
  },
  usersSkeletonPager: {
    flexDirection: 'row',
    gap: 8,
  },
  usersSkeletonPagerButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: AppColors.chart.grid,
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
export const heroStripStylesForTesting = styles;
