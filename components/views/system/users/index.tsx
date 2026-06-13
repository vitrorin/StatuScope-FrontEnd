import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { systemNavigationLinks, getSystemSidebarItems } from '@/components/dashboard/systemNavigation';
import { Button } from '@/components/foundation/Button';
import { SelectableChip } from '@/components/foundation/SelectableChip';
import { StatusBadge, StatusBadgeVariant } from '@/components/feedback/StatusBadge';
import { InputField } from '@/components/inputs/InputField';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DetailRow } from '@/components/overlays/DetailRow';
import { CardBase } from '@/components/patterns/CardBase';
import { ResponsiveTable, ResponsiveTableColumn } from '@/components/tables/ResponsiveTable';
import { PaginationControl } from '@/components/users/PaginationControl';
import { SummaryCountCard } from '@/components/users/SummaryCountCard';
import { UserAvatarBadge } from '@/components/users/UserAvatarBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/i18n';
import { createAdminUser, listAdminUsers } from '@/lib/adminUsers';
import {
  AdminUserResponse,
  BackendRoleCode,
  BackendUserStatus,
  HospitalResponse,
  listSystemHospitals,
  updateAdminUser,
} from '@/lib/systemAdmin';
import { initialsFromName } from '@/lib/format';
import { isSpanish } from '@/components/views/admin/localization';
import { AppColors, withAlpha } from '@/constants/theme';

const roleOptions: BackendRoleCode[] = ['SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR'];
const statusOptions: BackendUserStatus[] = ['ACTIVE', 'DISABLED', 'PENDING'];
const ITEMS_PER_PAGE = 6;

export function SystemUsers() {
  const router = useRouter();
  const { logout, profile } = useAuth();
  const { language } = useTranslation();
  const es = isSpanish(language);
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [hospitals, setHospitals] = useState<HospitalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | BackendRoleCode>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | BackendUserStatus>('ALL');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUserResponse | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUserResponse | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const sidebarItems = useMemo(() => getSystemSidebarItems(language), [language]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [userRows, hospitalRows] = await Promise.all([listAdminUsers(), listSystemHospitals()]);
      setUsers(userRows);
      setHospitals(hospitalRows);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : es ? 'No se pudieron cargar los usuarios.' : 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  }, [es]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return users.filter((user) => {
      const primaryRole = user.roleCodes[0] ?? 'DOCTOR';
      const matchesRole = roleFilter === 'ALL' || user.roleCodes.includes(roleFilter);
      const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
      const matchesQuery = !normalized ||
        user.fullName.toLowerCase().includes(normalized) ||
        user.email.toLowerCase().includes(normalized) ||
        (user.hospitalName ?? '').toLowerCase().includes(normalized) ||
        roleLabel(primaryRole, es).toLowerCase().includes(normalized);
      return matchesRole && matchesStatus && matchesQuery;
    });
  }, [es, query, roleFilter, statusFilter, users]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const visibleUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const systemAdminCount = users.filter((user) => user.roleCodes.includes('SYSTEM_ADMIN')).length;
  const hospitalAdminCount = users.filter((user) => user.roleCodes.includes('HOSPITAL_ADMIN')).length;
  const medicalCount = users.filter((user) => user.roleCodes.includes('DOCTOR')).length;
  const inactiveCount = users.filter((user) => user.status !== 'ACTIVE').length;

  const openCreate = () => {
    setEditingUser(null);
    setEditorOpen(true);
  };

  const openEdit = (user: AdminUserResponse) => {
    setSelectedUser(null);
    setEditingUser(user);
    setEditorOpen(true);
  };

  const saveUser = async (input: UserFormState) => {
    setSaving(true);
    setError(null);
    try {
      const hospitalId = input.roleCode === 'SYSTEM_ADMIN' ? undefined : input.hospitalId;
      if (input.roleCode !== 'SYSTEM_ADMIN' && !hospitalId) {
        throw new Error(es ? 'Selecciona un hospital para este rol.' : 'Select a hospital for this role.');
      }
      if (editingUser) {
        await updateAdminUser(editingUser.id, {
          fullName: input.fullName,
          email: input.email,
          roleCode: input.roleCode,
          hospitalId,
          status: input.status,
        });
      } else {
        if (input.password.length < 8) {
          throw new Error(es ? 'La contrasena debe tener al menos 8 caracteres.' : 'Password must be at least 8 characters.');
        }
        await createAdminUser({
          fullName: input.fullName,
          email: input.email,
          password: input.password,
          roleCode: input.roleCode,
          hospitalId,
        });
      }
      setEditorOpen(false);
      await load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : es ? 'No se pudo guardar el usuario.' : 'Unable to save user.');
    } finally {
      setSaving(false);
    }
  };

  const toggleUserStatus = async (user: AdminUserResponse) => {
    const nextStatus: BackendUserStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    setActionBusyId(user.id);
    setError(null);
    try {
      await updateAdminUser(user.id, {
        fullName: user.fullName,
        email: user.email,
        roleCode: user.roleCodes[0] ?? 'DOCTOR',
        hospitalId: user.roleCodes.includes('SYSTEM_ADMIN') ? undefined : user.hospitalId ?? undefined,
        status: nextStatus,
      });
      await load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : es ? 'No se pudo actualizar el estado del usuario.' : 'Unable to update user status.');
    } finally {
      setActionBusyId(null);
    }
  };

  const userTableColumns: ResponsiveTableColumn<AdminUserResponse>[] = [
    {
      key: 'name',
      label: es ? 'Nombre' : 'Name',
      flex: 1.35,
      minWidth: 220,
      render: (user) => (
        <View style={styles.nameCell}>
          <UserAvatarBadge initials={initialsFromName(user.fullName)} variant="default" />
          <View style={styles.userNameStack}>
            <Text style={styles.userName}>{user.fullName}</Text>
            <Text style={styles.userHospital}>{user.hospitalName ?? (es ? 'Sistema' : 'System')}</Text>
          </View>
        </View>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      flex: 1.35,
      minWidth: 210,
      render: (user) => <Text style={styles.emailText}>{user.email}</Text>,
    },
    {
      key: 'role',
      label: es ? 'Rol' : 'Role',
      flex: 1,
      minWidth: 150,
      render: (user) => <RoleBadge role={user.roleCodes[0] ?? 'DOCTOR'} es={es} />,
    },
    {
      key: 'status',
      label: es ? 'Estado' : 'Status',
      flex: 0.72,
      minWidth: 130,
      render: (user) => <StatusBadge label={statusLabel(user.status, es)} variant={statusBadgeVariant(user.status)} />,
    },
    {
      key: 'actions',
      label: es ? 'Acciones' : 'Actions',
      width: 92,
      align: 'center',
      render: (user) => (
        <View style={styles.actionsCol}>
          <TouchableOpacity
            style={styles.iconActionButton}
            activeOpacity={0.76}
            onPress={() => openEdit(user)}
            disabled={actionBusyId === user.id}
          >
            <Feather name="edit-3" size={18} color={AppColors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconActionButton}
            activeOpacity={0.76}
            onPress={() => { void toggleUserStatus(user); }}
            disabled={actionBusyId === user.id}
          >
            <Feather name={user.status === 'ACTIVE' ? 'slash' : 'check-circle'} size={18} color={user.status === 'ACTIVE' ? AppColors.status.dangerBright : AppColors.status.success} />
          </TouchableOpacity>
        </View>
      ),
    },
  ];

  return (
    <DashboardLayout
      active="users"
      sectionLabel={es ? 'Usuarios y roles' : 'Users & Roles'}
      userName={profile?.fullName ?? (es ? 'Administrador del sistema' : 'System Administrator')}
      userId={profile?.email ?? undefined}
      avatarText={initialsFromName(profile?.fullName)}
      links={systemNavigationLinks}
      sidebarItems={sidebarItems}
      onLogout={async () => { await logout(); router.replace('/login'); }}
    >
      <>
        <ScrollView testID="system-users-screen" contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <View style={styles.heroStrip}>
              <View style={styles.heroCopy}>
                <Text style={styles.heroEyebrow}>{es ? 'Control de acceso' : 'Access Control'}</Text>
                <Text style={styles.heroTitle}>{es ? 'Gestion de usuarios' : 'User Management'}</Text>
                <Text style={styles.heroDescription}>
                  {es
                    ? 'Administra el acceso a la plataforma, asigna roles y monitorea el estado de los usuarios en todos los hospitales.'
                    : 'Manage platform access, assign roles, and monitor user status across all hospitals.'}
                </Text>
              </View>

              <Button
                label={es ? 'Crear usuario' : 'Create New User'}
                variant="primary"
                size="lg"
                leadingIcon={<Feather name="user-plus" size={15} color={AppColors.surface.card} />}
                style={styles.createButton}
                onPress={openCreate}
              />
            </View>

            <CardBase style={styles.filterCard}>
              <View style={styles.searchRow}>
                <InputField
                  placeholder={es ? 'Buscar por nombre o correo' : 'Search by name or email'}
                  value={query}
                  onChangeText={setQuery}
                  leftIcon={<Feather name="search" size={16} color={AppColors.text.muted} />}
                  inputContainerStyle={styles.searchInputContainer}
                  style={styles.searchField}
                />
                <Button
                  label={es ? 'Filtros' : 'Filters'}
                  variant="secondary"
                  size="md"
                  leadingIcon={<Feather name="sliders" size={15} color={AppColors.text.secondary} />}
                  style={styles.filterToggleButton}
                  onPress={() => setIsFiltersOpen((current) => !current)}
                />
              </View>

              {isFiltersOpen ? (
                <>
                  <View style={styles.filterSection}>
                    <Text style={styles.filterLabel}>{es ? 'Rol' : 'Role'}</Text>
                    <View style={styles.filterChips}>
                      {(['ALL', ...roleOptions] as ('ALL' | BackendRoleCode)[]).map((role) => {
                        const isActive = roleFilter === role;
                        return (
                          <SelectableChip
                            key={role}
                            label={role === 'ALL' ? (es ? 'Todos' : 'All') : roleLabel(role, es)}
                            selected={isActive}
                            style={styles.filterChip}
                            selectedStyle={styles.filterChipActive}
                            labelStyle={styles.filterChipText}
                            selectedLabelStyle={styles.filterChipTextActive}
                            onPress={() => setRoleFilter(role)}
                          />
                        );
                      })}
                    </View>
                  </View>

                  <View style={styles.filterSection}>
                    <Text style={styles.filterLabel}>{es ? 'Estado' : 'Status'}</Text>
                    <View style={styles.filterChips}>
                      {(['ALL', ...statusOptions] as ('ALL' | BackendUserStatus)[]).map((status) => {
                        const isActive = statusFilter === status;
                        return (
                          <SelectableChip
                            key={status}
                            label={status === 'ALL' ? (es ? 'Todos' : 'All') : statusLabel(status, es)}
                            selected={isActive}
                            style={styles.filterChip}
                            selectedStyle={styles.filterChipActive}
                            labelStyle={styles.filterChipText}
                            selectedLabelStyle={styles.filterChipTextActive}
                            onPress={() => setStatusFilter(status)}
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
                <Text style={styles.errorTitle}>{es ? 'Usuarios no disponibles' : 'Users unavailable'}</Text>
                <Text style={styles.errorText}>{error}</Text>
                <Button label={es ? 'Reintentar' : 'Retry'} variant="secondary" size="sm" onPress={() => { void load(); }} />
              </CardBase>
            ) : null}

            <ResponsiveTable
              columns={userTableColumns}
              rows={visibleUsers}
              getRowKey={(user) => user.id}
              loading={loading}
              emptyTitle={es ? 'No se encontraron usuarios' : 'No users found'}
              emptyMessage={es ? 'Prueba ajustando la busqueda o los filtros.' : 'Try adjusting the current search or filters.'}
              onRowPress={(user) => setSelectedUser(user)}
              style={styles.tableCard}
              rowStyle={(_, index) => (index === visibleUsers.length - 1 ? styles.tableRowLast : undefined)}
              footer={!loading ? (
                <View style={styles.tableFooter}>
                  <Text style={styles.tableFooterText}>
                    {es ? 'Mostrando ' : 'Showing '}
                    {filteredUsers.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}-
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}
                    {es ? ' de ' : ' of '}
                    {filteredUsers.length}
                    {es ? ' usuarios' : ' users'}
                  </Text>
                  <PaginationControl currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </View>
              ) : null}
            />

            <View style={styles.summaryRow}>
              <SummaryCountCard
                title={es ? 'Admins sistema' : 'System Admins'}
                value={String(systemAdminCount)}
                variant="info"
                icon={<MaterialCommunityIcons name="shield-account-outline" size={15} color={AppColors.brand.purple} />}
                style={styles.summaryCard}
              />
              <SummaryCountCard
                title={es ? 'Admins hospital' : 'Hospital Admins'}
                value={String(hospitalAdminCount)}
                variant="info"
                icon={<MaterialCommunityIcons name="account-cog-outline" size={15} color={AppColors.brand.action} />}
                style={styles.summaryCard}
              />
              <SummaryCountCard
                title={es ? 'Personal medico' : 'Medical Staff'}
                value={String(medicalCount)}
                variant="info"
                icon={<MaterialCommunityIcons name="shield-account-outline" size={15} color={AppColors.brand.purple} />}
                style={styles.summaryCard}
              />
              <SummaryCountCard
                title={es ? 'Usuarios inactivos' : 'Inactive Users'}
                value={String(inactiveCount)}
                variant="neutral"
                icon={<MaterialCommunityIcons name="account-off-outline" size={15} color={AppColors.text.muted} />}
                style={styles.summaryCard}
              />
            </View>
          </View>
        </ScrollView>

        <UserEditorModal
          visible={editorOpen}
          user={editingUser}
          hospitals={hospitals}
          saving={saving}
          es={es}
          onClose={() => setEditorOpen(false)}
          onSave={saveUser}
        />
        <UserDetailModal
          visible={selectedUser !== null}
          user={selectedUser}
          es={es}
          onClose={() => setSelectedUser(null)}
        />
      </>
    </DashboardLayout>
  );
}

interface UserFormState {
  fullName: string;
  email: string;
  password: string;
  roleCode: BackendRoleCode;
  hospitalId?: string;
  status: BackendUserStatus;
}

function UserEditorModal({
  visible,
  user,
  hospitals,
  saving,
  es,
  onClose,
  onSave,
}: {
  visible: boolean;
  user: AdminUserResponse | null;
  hospitals: HospitalResponse[];
  saving: boolean;
  es: boolean;
  onClose: () => void;
  onSave: (input: UserFormState) => Promise<void>;
}) {
  const [draft, setDraft] = useState<UserFormState>({
    fullName: '',
    email: '',
    password: '',
    roleCode: 'DOCTOR',
    hospitalId: undefined,
    status: 'ACTIVE',
  });

  useEffect(() => {
    if (!visible) return;
    setDraft({
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
      password: '',
      roleCode: user?.roleCodes[0] ?? 'DOCTOR',
      hospitalId: user?.hospitalId ?? hospitals[0]?.id,
      status: user?.status ?? 'ACTIVE',
    });
  }, [hospitals, user, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <CardBase style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderCopy}>
              <Text style={styles.modalEyebrow}>{es ? 'Usuarios y roles' : 'Users & Roles'}</Text>
              <Text style={styles.modalTitle}>{user ? (es ? 'Editar usuario' : 'Edit User') : (es ? 'Crear usuario' : 'Create User')}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.78}>
              <Feather name="x" size={20} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
            <Field label={es ? 'Nombre completo' : 'Full Name'} value={draft.fullName} onChangeText={(fullName) => setDraft((prev) => ({ ...prev, fullName }))} />
            <Field label="Email" value={draft.email} onChangeText={(email) => setDraft((prev) => ({ ...prev, email }))} />
            {!user ? (
              <Field label={es ? 'Contrasena' : 'Password'} value={draft.password} onChangeText={(password) => setDraft((prev) => ({ ...prev, password }))} secure />
            ) : null}

            <Text style={styles.formLabel}>{es ? 'Rol' : 'Role'}</Text>
            <View style={styles.choiceRow}>
              {roleOptions.map((role) => (
                <SelectableChip
                  key={role}
                  label={roleLabel(role, es)}
                  selected={draft.roleCode === role}
                  style={styles.choiceChip}
                  selectedStyle={styles.choiceChipActive}
                  labelStyle={styles.choiceChipText}
                  selectedLabelStyle={styles.choiceChipTextActive}
                  onPress={() => setDraft((prev) => ({ ...prev, roleCode: role, hospitalId: role === 'SYSTEM_ADMIN' ? undefined : prev.hospitalId ?? hospitals[0]?.id }))}
                />
              ))}
            </View>

            {draft.roleCode !== 'SYSTEM_ADMIN' ? (
              <>
                <Text style={styles.formLabel}>{es ? 'Hospital asignado' : 'Assigned Hospital'}</Text>
                <View style={styles.hospitalChoices}>
                  {hospitals.map((hospital) => (
                    <SelectableChip
                      key={hospital.id}
                      label={hospital.name}
                      selected={draft.hospitalId === hospital.id}
                      style={styles.choiceChip}
                      selectedStyle={styles.choiceChipActive}
                      labelStyle={styles.choiceChipText}
                      selectedLabelStyle={styles.choiceChipTextActive}
                      onPress={() => setDraft((prev) => ({ ...prev, hospitalId: hospital.id }))}
                    />
                  ))}
                </View>
              </>
            ) : null}

            {user ? (
              <>
                <Text style={styles.formLabel}>{es ? 'Estado' : 'Status'}</Text>
                <View style={styles.choiceRow}>
                  {statusOptions.map((status) => (
                    <SelectableChip
                      key={status}
                      label={statusLabel(status, es)}
                      selected={draft.status === status}
                      style={styles.choiceChip}
                      selectedStyle={styles.choiceChipActive}
                      labelStyle={styles.choiceChipText}
                      selectedLabelStyle={styles.choiceChipTextActive}
                      onPress={() => setDraft((prev) => ({ ...prev, status }))}
                    />
                  ))}
                </View>
              </>
            ) : null}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button label={es ? 'Cancelar' : 'Cancel'} variant="secondary" onPress={onClose} />
            <Button
              label={saving ? (es ? 'Guardando...' : 'Saving...') : (es ? 'Guardar' : 'Save')}
              variant="primary"
              disabled={saving}
              onPress={() => { void onSave(draft); }}
            />
          </View>
        </CardBase>
      </View>
    </Modal>
  );
}

function UserDetailModal({
  visible,
  user,
  es,
  onClose,
}: {
  visible: boolean;
  user: AdminUserResponse | null;
  es: boolean;
  onClose: () => void;
}) {
  const role = user?.roleCodes[0] ?? 'DOCTOR';
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <CardBase style={[styles.modalCard, styles.detailModalCard]}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderCopy}>
              <Text style={styles.modalEyebrow}>{es ? 'Informacion de usuario' : 'User Information'}</Text>
              <Text style={styles.modalTitle}>{user?.fullName ?? (es ? 'Usuario' : 'User')}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.78}>
              <Feather name="x" size={20} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.detailContent}>
            <View style={styles.detailIdentity}>
              <UserAvatarBadge initials={initialsFromName(user?.fullName)} variant="default" />
              <View style={styles.detailIdentityText}>
                <Text style={styles.detailName}>{user?.fullName ?? '-'}</Text>
                <Text style={styles.detailEmail}>{user?.email ?? '-'}</Text>
              </View>
            </View>

            <View style={styles.detailGrid}>
              <DetailRow boxed style={styles.detailItem} label={es ? 'Rol' : 'Role'} value={roleLabel(role, es)} />
              <DetailRow boxed style={styles.detailItem} label={es ? 'Estado' : 'Status'} value={user ? statusLabel(user.status, es) : '-'} />
              <DetailRow boxed style={styles.detailItem} label={es ? 'Hospital asignado' : 'Assigned Hospital'} value={user?.hospitalName ?? (es ? 'Sistema' : 'System')} />
              <DetailRow boxed style={styles.detailItem} label="ID" value={user?.id ?? '-'} />
            </View>
          </View>

          <View style={styles.modalFooter}>
            <Button label={es ? 'Cerrar' : 'Close'} variant="secondary" onPress={onClose} />
          </View>
        </CardBase>
      </View>
    </Modal>
  );
}

function Field({ label, value, onChangeText, secure = false }: { label: string; value: string; onChangeText: (value: string) => void; secure?: boolean }) {
  return (
    <View style={styles.field}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} secureTextEntry={secure} style={styles.input} placeholderTextColor={AppColors.text.muted} />
    </View>
  );
}

function RoleBadge({ role, es }: { role: BackendRoleCode; es: boolean }) {
  const system = role === 'SYSTEM_ADMIN';
  const doctor = role === 'DOCTOR';
  return (
    <View style={[styles.roleBadge, system ? styles.roleBadgeSystem : doctor ? styles.roleBadgeInfo : styles.roleBadgeNeutral]}>
      <Text style={[styles.roleBadgeText, system ? styles.roleBadgeTextSystem : doctor ? styles.roleBadgeTextInfo : styles.roleBadgeTextNeutral]}>
        {roleLabel(role, es)}
      </Text>
    </View>
  );
}

function roleLabel(role: BackendRoleCode, es: boolean) {
  if (role === 'SYSTEM_ADMIN') return es ? 'Administrador del sistema' : 'System Administrator';
  if (role === 'HOSPITAL_ADMIN') return es ? 'Administrador hospitalario' : 'Hospital Administrator';
  return es ? 'Doctor' : 'Doctor';
}

function statusLabel(status: BackendUserStatus, es: boolean) {
  if (status === 'ACTIVE') return es ? 'Activo' : 'Active';
  if (status === 'PENDING') return es ? 'Pendiente' : 'Pending';
  return es ? 'Inactivo' : 'Inactive';
}

function statusBadgeVariant(status: BackendUserStatus): StatusBadgeVariant {
  if (status === 'ACTIVE') return 'success';
  if (status === 'PENDING') return 'warning';
  return 'neutral';
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
    borderColor: withAlpha(AppColors.brand.action, 0.24),
  },
  filterChipText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: AppColors.text.secondary,
  },
  filterChipTextActive: {
    color: AppColors.brand.action,
  },
  tableCard: {
    borderRadius: 16,
    padding: 0,
    overflow: 'hidden',
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  actionsCol: {
    width: 92,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  nameCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userNameStack: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    color: AppColors.text.primary,
  },
  userHospital: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: AppColors.text.muted,
  },
  emailText: {
    color: AppColors.text.body,
  },
  iconActionButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.surface.card,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  roleBadgeInfo: {
    backgroundColor: AppColors.surface.brandSoft,
  },
  roleBadgeNeutral: {
    backgroundColor: AppColors.surface.muted,
  },
  roleBadgeSystem: {
    backgroundColor: AppColors.recommendationCategory.logistics.soft,
  },
  roleBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
  },
  roleBadgeTextInfo: {
    color: AppColors.brand.action,
  },
  roleBadgeTextNeutral: {
    color: AppColors.text.secondary,
  },
  roleBadgeTextSystem: {
    color: AppColors.brand.purple,
  },
  tableFooter: {
    minHeight: 58,
    borderTopWidth: 1,
    borderTopColor: AppColors.surface.muted,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  tableFooterText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: AppColors.text.secondary,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 16,
  },
  summaryCard: {
    flex: 1,
  },
  errorCard: {
    borderRadius: 16,
    padding: 18,
    borderColor: AppColors.status.dangerBorder,
    gap: 8,
  },
  errorTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '900',
    color: AppColors.status.dangerDeep,
  },
  errorText: {
    color: AppColors.text.secondary,
    lineHeight: 20,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: AppColors.modal.darkBackdrop,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 720,
    maxHeight: '92%',
    borderRadius: 24,
    padding: 0,
    overflow: 'hidden',
  },
  detailModalCard: {
    maxWidth: 620,
  },
  modalHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border.default,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  modalHeaderCopy: {
    flex: 1,
    minWidth: 0,
  },
  modalEyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: AppColors.brand.action,
    textTransform: 'uppercase',
  },
  modalTitle: {
    marginTop: 6,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    color: AppColors.text.strong,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    padding: 24,
    gap: 14,
  },
  detailContent: {
    padding: 24,
    gap: 22,
  },
  detailIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  detailIdentityText: {
    flex: 1,
    minWidth: 0,
  },
  detailName: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
    color: AppColors.text.primary,
  },
  detailEmail: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: AppColors.text.secondary,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 220,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.border.default,
    backgroundColor: AppColors.surface.subtle,
    padding: 14,
    gap: 6,
  },
  field: {
    gap: 7,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: AppColors.text.secondary,
    textTransform: 'uppercase',
  },
  input: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.border.strong,
    paddingHorizontal: 13,
    color: AppColors.text.strong,
    fontWeight: '700',
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hospitalChoices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    maxHeight: 136,
  },
  choiceChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: AppColors.surface.subtle,
    borderWidth: 1,
    borderColor: AppColors.border.default,
  },
  choiceChipActive: {
    backgroundColor: AppColors.border.brandSoft,
    borderColor: AppColors.border.brandSubtle,
  },
  choiceChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: AppColors.text.secondary,
  },
  choiceChipTextActive: {
    color: AppColors.brand.primary,
  },
  modalFooter: {
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: AppColors.border.default,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
});

export default SystemUsers;
