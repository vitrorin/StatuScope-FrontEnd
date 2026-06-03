import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { systemNavigationLinks, getSystemSidebarItems } from '@/components/dashboard/systemNavigation';
import { Button } from '@/components/foundation/Button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
  updateAdminUserStatus,
} from '@/lib/systemAdmin';
import { initialsFromName } from '@/lib/format';
import { isSpanish } from '@/components/views/admin/localization';

const roleOptions: BackendRoleCode[] = ['SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR'];
const statusOptions: BackendUserStatus[] = ['ACTIVE', 'DISABLED', 'PENDING'];

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
  const [selectedUser, setSelectedUser] = useState<AdminUserResponse | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
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
        primaryRole.toLowerCase().includes(normalized);
      return matchesRole && matchesStatus && matchesQuery;
    });
  }, [query, roleFilter, statusFilter, users]);

  const adminCount = users.filter((user) => user.roleCodes.includes('SYSTEM_ADMIN') || user.roleCodes.includes('HOSPITAL_ADMIN')).length;
  const medicalCount = users.filter((user) => user.roleCodes.includes('DOCTOR')).length;
  const inactiveCount = users.filter((user) => user.status !== 'ACTIVE').length;

  const openCreate = () => {
    setSelectedUser(null);
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
      if (selectedUser) {
        await updateAdminUser(selectedUser.id, {
          fullName: input.fullName,
          email: input.email,
          roleCode: input.roleCode,
          hospitalId,
          status: input.status,
        });
      } else {
        if (input.password.length < 8) {
          throw new Error(es ? 'La contraseña debe tener al menos 8 caracteres.' : 'Password must be at least 8 characters.');
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

  const toggleStatus = async (user: AdminUserResponse) => {
    setSaving(true);
    setError(null);
    try {
      await updateAdminUserStatus(user.id, user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE');
      await load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : es ? 'No se pudo actualizar el estado.' : 'Unable to update status.');
    } finally {
      setSaving(false);
    }
  };

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
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View>
            <Text style={styles.eyebrow}>{es ? 'Control global de acceso' : 'Global Access Control'}</Text>
            <Text style={styles.title}>{es ? 'Gestión de usuarios' : 'User Management'}</Text>
            <Text style={styles.subtitle}>
              {es ? 'Administra usuarios, roles y asignaciones hospitalarias de toda la plataforma.' : 'Manage platform access, roles, and hospital assignments across the full network.'}
            </Text>
          </View>
          <Button
            label={es ? 'Crear usuario' : 'Create New User'}
            variant="primary"
            size="md"
            leadingIcon={<Feather name="user-plus" size={16} color="#FFFFFF" />}
            onPress={openCreate}
          />
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard title={es ? 'Administradores' : 'Administrators'} value={adminCount} icon="shield" tone="#1D4ED8" />
          <SummaryCard title={es ? 'Personal médico' : 'Medical Staff'} value={medicalCount} icon="activity" tone="#4F46E5" />
          <SummaryCard title={es ? 'Inactivos/Suspendidos' : 'Inactive/Suspended'} value={inactiveCount} icon="user-x" tone="#64748B" />
        </View>

        <View style={styles.toolbar}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={es ? 'Buscar usuarios, correos u hospitales...' : 'Search users, emails, or hospitals...'}
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
          <View style={styles.filterRow}>
            {(['ALL', ...roleOptions] as ('ALL' | BackendRoleCode)[]).map((role) => (
              <FilterChip key={role} label={role === 'ALL' ? (es ? 'Todos' : 'All') : roleLabel(role, es)} active={roleFilter === role} onPress={() => setRoleFilter(role)} />
            ))}
          </View>
          <View style={styles.filterRow}>
            {(['ALL', ...statusOptions] as ('ALL' | BackendUserStatus)[]).map((status) => (
              <FilterChip key={status} label={status === 'ALL' ? (es ? 'Todos' : 'All') : statusLabel(status, es)} active={statusFilter === status} onPress={() => setStatusFilter(status)} />
            ))}
          </View>
        </View>

        {loading ? <UsersSkeleton /> : (
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.nameCol]}>{es ? 'Nombre' : 'Name'}</Text>
              <Text style={[styles.headerCell, styles.emailCol]}>Email</Text>
              <Text style={[styles.headerCell, styles.roleCol]}>{es ? 'Rol' : 'Role'}</Text>
              <Text style={[styles.headerCell, styles.hospitalCol]}>{es ? 'Hospital' : 'Hospital'}</Text>
              <Text style={[styles.headerCell, styles.statusCol]}>{es ? 'Estado' : 'Status'}</Text>
              <Text style={[styles.headerCell, styles.actionCol]}>{es ? 'Acciones' : 'Actions'}</Text>
            </View>
            {filteredUsers.map((user) => {
              const role = user.roleCodes[0] ?? 'DOCTOR';
              return (
                <View key={user.id} style={styles.tableRow}>
                  <View style={[styles.userCell, styles.nameCol]}>
                    <View style={styles.avatar}><Text style={styles.avatarText}>{initialsFromName(user.fullName)}</Text></View>
                    <Text style={styles.userName}>{user.fullName}</Text>
                  </View>
                  <Text style={[styles.bodyCell, styles.emailCol]}>{user.email}</Text>
                  <View style={styles.roleCol}><RoleBadge role={role} es={es} /></View>
                  <Text style={[styles.bodyCell, styles.hospitalCol]}>{user.hospitalName ?? (es ? 'Sistema' : 'System')}</Text>
                  <View style={styles.statusCol}><StatusPill status={user.status} es={es} /></View>
                  <View style={[styles.actionCol, styles.actions]}>
                    <TouchableOpacity onPress={() => { setSelectedUser(user); setEditorOpen(true); }} activeOpacity={0.75}>
                      <Feather name="edit-2" size={17} color="#64748B" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { void toggleStatus(user); }} activeOpacity={0.75} disabled={saving}>
                      <Feather name={user.status === 'ACTIVE' ? 'slash' : 'check-circle'} size={18} color={user.status === 'ACTIVE' ? '#EF4444' : '#10B981'} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
            {filteredUsers.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>{es ? 'No se encontraron usuarios' : 'No users found'}</Text>
              </View>
            ) : null}
          </View>
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>

      <UserEditorModal
        visible={editorOpen}
        user={selectedUser}
        hospitals={hospitals}
        saving={saving}
        es={es}
        onClose={() => setEditorOpen(false)}
        onSave={saveUser}
      />
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
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.eyebrow}>{es ? 'Usuarios y roles' : 'Users & Roles'}</Text>
              <Text style={styles.modalTitle}>{user ? (es ? 'Editar usuario' : 'Edit User') : (es ? 'Crear usuario' : 'Create User')}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}><Feather name="x" size={20} color="#64748B" /></TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.form}>
            <Field label={es ? 'Nombre completo' : 'Full Name'} value={draft.fullName} onChangeText={(fullName) => setDraft((prev) => ({ ...prev, fullName }))} />
            <Field label="Email" value={draft.email} onChangeText={(email) => setDraft((prev) => ({ ...prev, email }))} />
            {!user ? <Field label={es ? 'Contraseña' : 'Password'} value={draft.password} onChangeText={(password) => setDraft((prev) => ({ ...prev, password }))} secure /> : null}

            <Text style={styles.formLabel}>{es ? 'Rol' : 'Role'}</Text>
            <View style={styles.choiceRow}>
              {roleOptions.map((role) => <FilterChip key={role} label={roleLabel(role, es)} active={draft.roleCode === role} onPress={() => setDraft((prev) => ({ ...prev, roleCode: role }))} />)}
            </View>

            {draft.roleCode !== 'SYSTEM_ADMIN' ? (
              <>
                <Text style={styles.formLabel}>{es ? 'Hospital asignado' : 'Assigned Hospital'}</Text>
                <View style={styles.hospitalChoices}>
                  {hospitals.map((hospital) => (
                    <FilterChip key={hospital.id} label={hospital.name} active={draft.hospitalId === hospital.id} onPress={() => setDraft((prev) => ({ ...prev, hospitalId: hospital.id }))} />
                  ))}
                </View>
              </>
            ) : null}

            {user ? (
              <>
                <Text style={styles.formLabel}>{es ? 'Estado' : 'Status'}</Text>
                <View style={styles.choiceRow}>
                  {statusOptions.map((status) => <FilterChip key={status} label={statusLabel(status, es)} active={draft.status === status} onPress={() => setDraft((prev) => ({ ...prev, status }))} />)}
                </View>
              </>
            ) : null}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button label={es ? 'Cancelar' : 'Cancel'} variant="secondary" onPress={onClose} />
            <Button label={saving ? (es ? 'Guardando...' : 'Saving...') : (es ? 'Guardar' : 'Save')} variant="primary" disabled={saving} onPress={() => { void onSave(draft); }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SummaryCard({ title, value, icon, tone }: { title: string; value: number; icon: keyof typeof Feather.glyphMap; tone: string }) {
  return (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: `${tone}14` }]}><Feather name={icon} size={18} color={tone} /></View>
      <Text style={styles.summaryTitle}>{title}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.chip, active && styles.chipActive]} onPress={onPress} activeOpacity={0.75}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Field({ label, value, onChangeText, secure = false }: { label: string; value: string; onChangeText: (value: string) => void; secure?: boolean }) {
  return (
    <View style={styles.field}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} secureTextEntry={secure} style={styles.input} placeholderTextColor="#94A3B8" />
    </View>
  );
}

function RoleBadge({ role, es }: { role: BackendRoleCode; es: boolean }) {
  return <View style={styles.roleBadge}><Text style={styles.roleBadgeText}>{roleLabel(role, es)}</Text></View>;
}

function StatusPill({ status, es }: { status: BackendUserStatus; es: boolean }) {
  const active = status === 'ACTIVE';
  const pending = status === 'PENDING';
  return (
    <View style={[styles.statusPill, active ? styles.statusActive : pending ? styles.statusPending : styles.statusDisabled]}>
      <Text style={[styles.statusText, active ? styles.statusTextActive : pending ? styles.statusTextPending : styles.statusTextDisabled]}>{statusLabel(status, es)}</Text>
    </View>
  );
}

function UsersSkeleton() {
  return <View style={[styles.tableCard, styles.skeletonTable]} />;
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

const styles = StyleSheet.create({
  contentContainer: { padding: 32, gap: 24 },
  hero: { backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', padding: 28, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 20 },
  eyebrow: { fontSize: 12, fontWeight: '800', color: '#0003B8', textTransform: 'uppercase' },
  title: { marginTop: 8, fontSize: 30, lineHeight: 38, fontWeight: '800', color: '#111827' },
  subtitle: { marginTop: 6, fontSize: 15, lineHeight: 23, color: '#64748B' },
  summaryGrid: { flexDirection: 'row', gap: 20 },
  summaryCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', padding: 22 },
  summaryIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  summaryTitle: { marginTop: 14, fontSize: 14, fontWeight: '800', color: '#334155' },
  summaryValue: { marginTop: 8, fontSize: 30, fontWeight: '800', color: '#1D4ED8' },
  toolbar: { backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', padding: 18, gap: 12 },
  searchInput: { minHeight: 44, borderRadius: 10, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 14, color: '#111827', fontWeight: '600' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  chipActive: { backgroundColor: '#E0E7FF', borderColor: '#C7D2FE' },
  chipText: { fontSize: 12, fontWeight: '800', color: '#64748B' },
  chipTextActive: { color: '#0003B8' },
  tableCard: { backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  tableHeader: { minHeight: 52, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 20 },
  tableRow: { minHeight: 74, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  headerCell: { fontSize: 12, fontWeight: '800', color: '#64748B', textTransform: 'uppercase' },
  bodyCell: { fontSize: 14, fontWeight: '600', color: '#475569' },
  nameCol: { flex: 1.45 },
  emailCol: { flex: 1.45 },
  roleCol: { flex: 1.15 },
  hospitalCol: { flex: 1.25 },
  statusCol: { flex: 0.85 },
  actionCol: { flex: 0.7 },
  userCell: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 34, height: 34, borderRadius: 999, backgroundColor: '#E0E7FF', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#0003B8', fontWeight: '800', fontSize: 12 },
  userName: { color: '#111827', fontWeight: '800', fontSize: 14 },
  roleBadge: { alignSelf: 'flex-start', backgroundColor: '#EEF2FF', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  roleBadgeText: { color: '#0003B8', fontSize: 11, fontWeight: '800' },
  statusPill: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  statusActive: { backgroundColor: '#DCFCE7' },
  statusPending: { backgroundColor: '#FEF3C7' },
  statusDisabled: { backgroundColor: '#F1F5F9' },
  statusText: { fontSize: 11, fontWeight: '800' },
  statusTextActive: { color: '#059669' },
  statusTextPending: { color: '#D97706' },
  statusTextDisabled: { color: '#64748B' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  emptyState: { padding: 28, alignItems: 'center' },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: '#64748B' },
  errorText: { color: '#DC2626', fontWeight: '700' },
  skeletonTable: { height: 360, backgroundColor: '#F8FAFC' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.42)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', maxWidth: 720, maxHeight: '92%', backgroundColor: '#FFFFFF', borderRadius: 14, overflow: 'hidden' },
  modalHeader: { padding: 24, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  modalTitle: { marginTop: 6, fontSize: 24, fontWeight: '800', color: '#111827' },
  closeButton: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  form: { padding: 24, gap: 14 },
  field: { gap: 7 },
  formLabel: { fontSize: 12, fontWeight: '800', color: '#64748B', textTransform: 'uppercase' },
  input: { minHeight: 44, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 13, color: '#111827', fontWeight: '700' },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hospitalChoices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, maxHeight: 120 },
  modalFooter: { padding: 18, borderTopWidth: 1, borderTopColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
});

export default SystemUsers;
