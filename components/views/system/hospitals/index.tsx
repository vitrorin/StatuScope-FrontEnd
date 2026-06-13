import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { systemNavigationLinks, getSystemSidebarItems } from '@/components/dashboard/systemNavigation';
import { Button } from '@/components/foundation/Button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DetailRow } from '@/components/overlays/DetailRow';
import { OverlayStatCard } from '@/components/overlays/OverlayStatCard';
import { ResponsiveTable, ResponsiveTableColumn } from '@/components/tables/ResponsiveTable';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/i18n';
import {
  createSystemHospital,
  HospitalInput,
  HospitalResponse,
  listSystemMunicipalities,
  listSystemHospitals,
  MunicipalityResponse,
  updateSystemHospital,
  updateSystemHospitalStatus,
} from '@/lib/systemAdmin';
import { initialsFromName } from '@/lib/format';
import { isSpanish } from '@/components/views/admin/localization';
import { AdminUserResponse, listAdminUsers } from '@/lib/adminUsers';
import { AppColors, withAlpha } from '@/constants/theme';

export function SystemHospitals() {
  const router = useRouter();
  const { logout, profile } = useAuth();
  const { language } = useTranslation();
  const es = isSpanish(language);
  const [hospitals, setHospitals] = useState<HospitalResponse[]>([]);
  const [municipalities, setMunicipalities] = useState<MunicipalityResponse[]>([]);
  const [userCountsByHospital, setUserCountsByHospital] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<HospitalResponse | null>(null);
  const [detailHospital, setDetailHospital] = useState<HospitalResponse | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const sidebarItems = useMemo(() => getSystemSidebarItems(language), [language]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [hospitalRows, municipalityRows, userRows] = await Promise.all([
        listSystemHospitals(),
        listSystemMunicipalities(),
        listAdminUsers(),
      ]);
      setHospitals(hospitalRows);
      setMunicipalities(municipalityRows);
      setUserCountsByHospital(countHospitalUsers(userRows));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : es ? 'No se pudieron cargar los hospitales.' : 'Unable to load hospitals.');
    } finally {
      setLoading(false);
    }
  }, [es]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredHospitals = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return hospitals.filter((hospital) => {
      if (!normalized) return true;
      return (
        hospital.name.toLowerCase().includes(normalized) ||
        hospital.code.toLowerCase().includes(normalized) ||
        (hospital.municipalityName ?? '').toLowerCase().includes(normalized) ||
        (hospital.stateName ?? '').toLowerCase().includes(normalized)
      );
    });
  }, [hospitals, query]);

  const activeCount = hospitals.filter((hospital) => hospital.active).length;
  const inactiveCount = hospitals.length - activeCount;

  const saveHospital = async (input: HospitalFormState) => {
    setSaving(true);
    setError(null);
    try {
      const payload: HospitalInput = {
        code: input.code.trim(),
        name: input.name.trim(),
        address: input.address.trim(),
        phone: input.phone.trim(),
        inviteCode: input.inviteCode.trim(),
        postalCode: input.postalCode.trim(),
        bedCount: numberOrUndefined(input.bedCount),
        doctorCount: numberOrUndefined(input.doctorCount),
        nurseCount: numberOrUndefined(input.nurseCount),
        latitude: numberOrUndefined(input.latitude),
        longitude: numberOrUndefined(input.longitude),
        municipalityId: input.municipalityId || selectedHospital?.municipalityId || undefined,
      };
      if (selectedHospital) {
        await updateSystemHospital(selectedHospital.id, payload);
      } else {
        await createSystemHospital(payload);
      }
      setEditorOpen(false);
      await load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : es ? 'No se pudo guardar el hospital.' : 'Unable to save hospital.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (hospital: HospitalResponse) => {
    setSaving(true);
    setError(null);
    try {
      await updateSystemHospitalStatus(hospital.id, !hospital.active);
      await load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : es ? 'No se pudo actualizar el hospital.' : 'Unable to update hospital.');
    } finally {
      setSaving(false);
    }
  };

  const hospitalTableColumns: ResponsiveTableColumn<HospitalResponse>[] = [
    {
      key: 'hospital',
      label: es ? 'Hospital' : 'Hospital Name',
      flex: 1.8,
      minWidth: 260,
      render: (hospital) => (
        <TouchableOpacity
          style={styles.hospitalCell}
          activeOpacity={0.78}
          onPress={() => setDetailHospital(hospital)}
        >
          <View style={[styles.hospitalIcon, !hospital.active && styles.hospitalIconInactive]}>
            <MaterialCommunityIcons name="hospital-building" size={17} color={hospital.active ? AppColors.brand.link : AppColors.text.secondary} />
          </View>
          <View>
            <Text style={styles.hospitalName}>{hospital.name}</Text>
            <Text style={styles.hospitalCode}>{hospital.code}</Text>
          </View>
        </TouchableOpacity>
      ),
    },
    {
      key: 'location',
      label: es ? 'Ubicación' : 'Location',
      flex: 1.2,
      minWidth: 180,
      render: (hospital) => (
        <View>
          <Text style={styles.bodyStrong}>{hospital.municipalityName ?? (es ? 'Sin municipio' : 'No municipality')}</Text>
          <Text style={styles.bodyMuted}>{hospital.stateName ?? (es ? 'Sin estado' : 'No state')}</Text>
        </View>
      ),
    },
    {
      key: 'users',
      label: es ? 'Usuarios' : 'Users',
      flex: 0.8,
      minWidth: 120,
      render: (hospital) => (
        <View>
          <Text style={styles.bodyStrong}>{userCountsByHospital[hospital.id] ?? 0}</Text>
          <Text style={styles.bodyMuted}>{es ? 'registrados' : 'registered'}</Text>
        </View>
      ),
    },
    {
      key: 'status',
      label: es ? 'Estado' : 'Status',
      flex: 0.8,
      minWidth: 120,
      render: (hospital) => <StatusPill active={hospital.active} es={es} />,
    },
    {
      key: 'actions',
      label: es ? 'Acciones' : 'Actions',
      width: 96,
      align: 'center',
      render: (hospital) => (
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => { setSelectedHospital(hospital); setEditorOpen(true); }} activeOpacity={0.75}>
            <Feather name="edit-2" size={17} color={AppColors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { void toggleStatus(hospital); }} activeOpacity={0.75} disabled={saving}>
            <Feather name={hospital.active ? 'slash' : 'check-circle'} size={18} color={hospital.active ? AppColors.status.dangerBright : AppColors.status.successAccent} />
          </TouchableOpacity>
        </View>
      ),
    },
  ];

  return (
    <DashboardLayout
      active="hospitals"
      sectionLabel={es ? 'Hospitales' : 'Hospitals'}
      userName={profile?.fullName ?? (es ? 'Administrador del sistema' : 'System Administrator')}
      userId={profile?.email ?? undefined}
      avatarText={initialsFromName(profile?.fullName)}
      links={systemNavigationLinks}
      sidebarItems={sidebarItems}
      onLogout={async () => { await logout(); router.replace('/login'); }}
    >
      <ScrollView testID="system-hospitals-screen" contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View>
            <Text style={styles.eyebrow}>{es ? 'Red hospitalaria' : 'Hospital Network'}</Text>
            <Text style={styles.title}>{es ? 'Gestión de hospitales' : 'Hospital Management'}</Text>
            <Text style={styles.subtitle}>
              {es ? 'Controla las instituciones asociadas, su estado y sus datos operativos base.' : 'Manage partner healthcare facilities, status, and core operational metadata.'}
            </Text>
          </View>
          <Button
            label={es ? 'Registrar hospital' : 'Register New Hospital'}
            variant="primary"
            size="md"
            leadingIcon={<Feather name="plus" size={16} color={AppColors.surface.card} />}
            onPress={() => { setSelectedHospital(null); setEditorOpen(true); }}
          />
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard title={es ? 'Total de hospitales' : 'Total Facilities'} value={hospitals.length} icon="hospital-building" tone={AppColors.brand.link} />
          <SummaryCard title={es ? 'Activos' : 'Active Partners'} value={activeCount} icon="check-decagram-outline" tone={AppColors.status.successAccent} />
          <SummaryCard title={es ? 'Inactivos o pendientes' : 'Inactive or Pending'} value={inactiveCount} icon="dots-horizontal-circle-outline" tone={AppColors.text.secondary} />
        </View>

        <View style={styles.toolbar}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={es ? 'Buscar hospitales, ciudades o estados...' : 'Search hospitals, cities, or states...'}
            placeholderTextColor={AppColors.text.muted}
            style={styles.searchInput}
          />
        </View>

        <ResponsiveTable
          columns={hospitalTableColumns}
          rows={filteredHospitals}
          getRowKey={(hospital) => hospital.id}
          loading={loading}
          emptyTitle={es ? 'No se encontraron hospitales' : 'No hospitals found'}
          emptyMessage={es ? 'Prueba ajustando la busqueda.' : 'Try adjusting the current search.'}
          style={styles.tableCard}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>

      <HospitalEditorModal
        visible={editorOpen}
        hospital={selectedHospital}
        municipalities={municipalities}
        saving={saving}
        es={es}
        onClose={() => setEditorOpen(false)}
        onSave={saveHospital}
      />
      <HospitalDetailModal
        visible={Boolean(detailHospital)}
        hospital={detailHospital}
        registeredUsers={detailHospital ? userCountsByHospital[detailHospital.id] ?? 0 : 0}
        es={es}
        onClose={() => setDetailHospital(null)}
      />
    </DashboardLayout>
  );
}

interface HospitalFormState {
  code: string;
  name: string;
  address: string;
  phone: string;
  inviteCode: string;
  postalCode: string;
  bedCount: string;
  doctorCount: string;
  nurseCount: string;
  latitude: string;
  longitude: string;
  municipalityId?: string;
}

function HospitalEditorModal({
  visible,
  hospital,
  municipalities,
  saving,
  es,
  onClose,
  onSave,
}: {
  visible: boolean;
  hospital: HospitalResponse | null;
  municipalities: MunicipalityResponse[];
  saving: boolean;
  es: boolean;
  onClose: () => void;
  onSave: (input: HospitalFormState) => Promise<void>;
}) {
  const [draft, setDraft] = useState<HospitalFormState>(emptyHospitalDraft());
  const [municipalityQuery, setMunicipalityQuery] = useState('');

  useEffect(() => {
    if (!visible) return;
    setDraft(hospital ? {
      code: hospital.code ?? '',
      name: hospital.name ?? '',
      address: hospital.address ?? '',
      phone: hospital.phone ?? '',
      inviteCode: hospital.inviteCode ?? '',
      postalCode: hospital.postalCode ?? '',
      bedCount: String(hospital.bedCount ?? ''),
      doctorCount: String(hospital.doctorCount ?? ''),
      nurseCount: String(hospital.nurseCount ?? ''),
      latitude: String(hospital.latitude ?? ''),
      longitude: String(hospital.longitude ?? ''),
      municipalityId: hospital.municipalityId ?? undefined,
    } : emptyHospitalDraft());
    setMunicipalityQuery(hospital?.municipalityName ?? '');
  }, [hospital, visible]);

  const setField = (key: keyof HospitalFormState, value: string) => setDraft((prev) => ({ ...prev, [key]: value }));
  const visibleMunicipalities = municipalities
    .filter((municipality) => {
      const normalized = municipalityQuery.trim().toLowerCase();
      if (!normalized) return true;
      return municipality.name.toLowerCase().includes(normalized) || (municipality.stateName ?? '').toLowerCase().includes(normalized);
    })
    .slice(0, 8);
  const selectedMunicipality = municipalities.find((municipality) => municipality.id === draft.municipalityId);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.eyebrow}>{es ? 'Hospitales' : 'Hospitals'}</Text>
              <Text style={styles.modalTitle}>{hospital ? (es ? 'Editar hospital' : 'Edit Hospital') : (es ? 'Registrar hospital' : 'Register Hospital')}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}><Feather name="x" size={20} color={AppColors.text.secondary} /></TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.form}>
            <View style={styles.twoCols}>
              <Field label={es ? 'Código' : 'Code'} value={draft.code} onChangeText={(value) => setField('code', value)} />
              <Field label={es ? 'Nombre' : 'Name'} value={draft.name} onChangeText={(value) => setField('name', value)} />
            </View>
            <Field label={es ? 'Dirección' : 'Address'} value={draft.address} onChangeText={(value) => setField('address', value)} />
            <View style={styles.twoCols}>
              <Field label={es ? 'Teléfono' : 'Phone'} value={draft.phone} onChangeText={(value) => setField('phone', value)} />
              <Field label="Invite Code" value={draft.inviteCode} onChangeText={(value) => setField('inviteCode', value)} />
            </View>
            <View style={styles.threeCols}>
              <Field label={es ? 'Camas' : 'Beds'} value={draft.bedCount} onChangeText={(value) => setField('bedCount', value)} />
              <Field label={es ? 'Doctores' : 'Doctors'} value={draft.doctorCount} onChangeText={(value) => setField('doctorCount', value)} />
              <Field label={es ? 'Enfermeras' : 'Nurses'} value={draft.nurseCount} onChangeText={(value) => setField('nurseCount', value)} />
            </View>
            <View style={styles.threeCols}>
              <Field label={es ? 'Código postal' : 'Postal Code'} value={draft.postalCode} onChangeText={(value) => setField('postalCode', value)} />
              <Field label="Latitude" value={draft.latitude} onChangeText={(value) => setField('latitude', value)} />
              <Field label="Longitude" value={draft.longitude} onChangeText={(value) => setField('longitude', value)} />
            </View>
            <View style={styles.field}>
              <Text style={styles.formLabel}>{es ? 'Municipio' : 'Municipality'}</Text>
              <TextInput
                value={municipalityQuery}
                onChangeText={setMunicipalityQuery}
                style={styles.input}
                placeholder={es ? 'Buscar municipio o estado' : 'Search municipality or state'}
                placeholderTextColor={AppColors.text.muted}
              />
              {selectedMunicipality ? (
                <Text style={styles.selectedHint}>
                  {es ? 'Seleccionado: ' : 'Selected: '}{selectedMunicipality.name}{selectedMunicipality.stateName ? `, ${selectedMunicipality.stateName}` : ''}
                </Text>
              ) : null}
              <View style={styles.municipalityChoices}>
                {visibleMunicipalities.map((municipality) => (
                  <TouchableOpacity
                    key={municipality.id}
                    style={[styles.municipalityChip, draft.municipalityId === municipality.id && styles.municipalityChipActive]}
                    onPress={() => {
                      setDraft((prev) => ({
                        ...prev,
                        municipalityId: municipality.id,
                        latitude: prev.latitude || String(municipality.latitude ?? ''),
                        longitude: prev.longitude || String(municipality.longitude ?? ''),
                      }));
                      setMunicipalityQuery(municipality.name);
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.municipalityChipText, draft.municipalityId === municipality.id && styles.municipalityChipTextActive]}>
                      {municipality.name}{municipality.stateName ? `, ${municipality.stateName}` : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
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

function SummaryCard({ title, value, icon, tone }: { title: string; value: number; icon: keyof typeof MaterialCommunityIcons.glyphMap; tone: string }) {
  return (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: `${tone}14` }]}><MaterialCommunityIcons name={icon} size={19} color={tone} /></View>
      <View>
        <Text style={styles.summaryTitle}>{title}</Text>
        <Text style={styles.summaryValue}>{value}</Text>
      </View>
    </View>
  );
}

function StatusPill({ active, es }: { active: boolean; es: boolean }) {
  return (
    <View style={[styles.statusPill, active ? styles.statusActive : styles.statusInactive]}>
      <Text style={[styles.statusText, active ? styles.statusTextActive : styles.statusTextInactive]}>{active ? (es ? 'Activo' : 'Active') : (es ? 'Inactivo' : 'Inactive')}</Text>
    </View>
  );
}

function HospitalDetailModal({
  visible,
  hospital,
  registeredUsers,
  es,
  onClose,
}: {
  visible: boolean;
  hospital: HospitalResponse | null;
  registeredUsers: number;
  es: boolean;
  onClose: () => void;
}) {
  if (!hospital) return null;
  const operationalStaff = (hospital.doctorCount ?? 0) + (hospital.nurseCount ?? 0);
  const location = [hospital.municipalityName, hospital.stateName].filter(Boolean).join(', ') || (es ? 'Sin ubicacion' : 'No location');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.modalCard, styles.detailModalCard]}>
          <View style={styles.modalHeader}>
            <View style={styles.detailTitleRow}>
              <View style={[styles.hospitalIcon, !hospital.active && styles.hospitalIconInactive]}>
                <MaterialCommunityIcons name="hospital-building" size={18} color={hospital.active ? AppColors.brand.link : AppColors.text.secondary} />
              </View>
              <View style={styles.detailTitleCopy}>
                <Text style={styles.eyebrow}>{es ? 'Detalle del hospital' : 'Hospital Detail'}</Text>
                <Text style={styles.modalTitle}>{hospital.name}</Text>
                <Text style={styles.detailSubtitle}>{hospital.code} - {location}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}><Feather name="x" size={20} color={AppColors.text.secondary} /></TouchableOpacity>
          </View>

          <View style={styles.detailBody}>
            <View style={styles.detailStats}>
              <OverlayStatCard
                valueFirst
                showAccentBar={false}
                style={styles.detailStat}
                valueStyle={styles.detailStatValue}
                labelStyle={styles.detailStatLabel}
                label={es ? 'Usuarios registrados' : 'Registered users'}
                value={String(registeredUsers)}
              />
              <OverlayStatCard
                valueFirst
                showAccentBar={false}
                style={styles.detailStat}
                valueStyle={styles.detailStatValue}
                labelStyle={styles.detailStatLabel}
                label={es ? 'Camas' : 'Beds'}
                value={formatNullableNumber(hospital.bedCount, es)}
              />
              <OverlayStatCard
                valueFirst
                showAccentBar={false}
                style={styles.detailStat}
                valueStyle={styles.detailStatValue}
                labelStyle={styles.detailStatLabel}
                label={es ? 'Personal operativo' : 'Operational staff'}
                value={formatNullableNumber(operationalStaff, es)}
              />
            </View>

            <View style={styles.detailRows}>
              <DetailRow boxed style={styles.detailRow} labelStyle={styles.detailRowLabel} valueStyle={styles.detailRowValue} label={es ? 'Estado' : 'Status'} value={hospital.active ? (es ? 'Activo' : 'Active') : (es ? 'Inactivo' : 'Inactive')} />
              <DetailRow boxed style={styles.detailRow} labelStyle={styles.detailRowLabel} valueStyle={styles.detailRowValue} label={es ? 'Direccion' : 'Address'} value={hospital.address || (es ? 'Sin direccion' : 'No address')} />
              <DetailRow boxed style={styles.detailRow} labelStyle={styles.detailRowLabel} valueStyle={styles.detailRowValue} label={es ? 'Telefono' : 'Phone'} value={hospital.phone || (es ? 'Sin telefono' : 'No phone')} />
              <DetailRow boxed style={styles.detailRow} labelStyle={styles.detailRowLabel} valueStyle={styles.detailRowValue} label={es ? 'Codigo postal' : 'Postal code'} value={hospital.postalCode || (es ? 'Sin codigo postal' : 'No postal code')} />
              <DetailRow boxed style={styles.detailRow} labelStyle={styles.detailRowLabel} valueStyle={styles.detailRowValue} label="Invite Code" value={hospital.inviteCode || 'N/A'} />
              <DetailRow
                boxed
                style={styles.detailRow}
                labelStyle={styles.detailRowLabel}
                valueStyle={styles.detailRowValue}
                label={es ? 'Coordenadas' : 'Coordinates'}
                value={
                  hospital.latitude != null && hospital.longitude != null
                    ? `${hospital.latitude}, ${hospital.longitude}`
                    : (es ? 'Sin coordenadas' : 'No coordinates')
                }
              />
              <DetailRow
                boxed
                style={styles.detailRow}
                labelStyle={styles.detailRowLabel}
                valueStyle={styles.detailRowValue}
                label={es ? 'Doctores / Enfermeras' : 'Doctors / Nurses'}
                value={`${formatNullableNumber(hospital.doctorCount, es)} / ${formatNullableNumber(hospital.nurseCount, es)}`}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Field({ label, value, onChangeText }: { label: string; value: string; onChangeText: (value: string) => void }) {
  return (
    <View style={styles.field}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} style={styles.input} placeholderTextColor={AppColors.text.muted} />
    </View>
  );
}

function emptyHospitalDraft(): HospitalFormState {
  return {
    code: '',
    name: '',
    address: '',
    phone: '',
    inviteCode: '',
    postalCode: '',
    bedCount: '',
    doctorCount: '',
    nurseCount: '',
    latitude: '',
    longitude: '',
    municipalityId: undefined,
  };
}

function numberOrUndefined(value: string) {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function countHospitalUsers(users: AdminUserResponse[]) {
  return users.reduce<Record<string, number>>((counts, user) => {
    if (!user.hospitalId || user.roleCodes.includes('SYSTEM_ADMIN')) return counts;
    counts[user.hospitalId] = (counts[user.hospitalId] ?? 0) + 1;
    return counts;
  }, {});
}

function formatNullableNumber(value: number | null | undefined, es: boolean) {
  return value == null ? (es ? 'Sin dato' : 'No data') : String(value);
}

const styles = StyleSheet.create({
  contentContainer: { padding: 32, gap: 24 },
  hero: { backgroundColor: AppColors.surface.raised, borderRadius: 24, borderWidth: 1, borderColor: withAlpha(AppColors.brand.primary, 0.08), padding: 28, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 20, shadowColor: AppColors.shadow.blue, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 26, elevation: 4 },
  eyebrow: { fontSize: 12, fontWeight: '800', color: AppColors.brand.primary, textTransform: 'uppercase' },
  title: { marginTop: 8, fontSize: 30, lineHeight: 38, fontWeight: '800', color: AppColors.text.strong },
  subtitle: { marginTop: 6, fontSize: 15, lineHeight: 23, color: AppColors.text.secondary },
  summaryGrid: { flexDirection: 'row', gap: 20 },
  summaryCard: { flex: 1, backgroundColor: AppColors.surface.card, borderRadius: 18, borderWidth: 1, borderColor: AppColors.border.default, padding: 22, flexDirection: 'row', alignItems: 'center', gap: 14, shadowColor: AppColors.text.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 24, elevation: 3 },
  summaryIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  summaryTitle: { fontSize: 12, fontWeight: '800', color: AppColors.text.secondary, textTransform: 'uppercase' },
  summaryValue: { marginTop: 4, fontSize: 28, fontWeight: '800', color: AppColors.brand.link },
  toolbar: { backgroundColor: AppColors.surface.card, borderRadius: 18, borderWidth: 1, borderColor: AppColors.border.default, padding: 18, shadowColor: AppColors.text.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 2 },
  searchInput: { minHeight: 46, borderRadius: 12, backgroundColor: AppColors.surface.subtle, borderWidth: 1, borderColor: AppColors.border.default, paddingHorizontal: 14, color: AppColors.text.strong, fontWeight: '600' },
  tableCard: { backgroundColor: AppColors.surface.card, borderRadius: 18, borderWidth: 1, borderColor: AppColors.border.default, overflow: 'hidden', shadowColor: AppColors.text.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 24, elevation: 3 },
  hospitalCell: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hospitalIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: AppColors.status.infoSoft, alignItems: 'center', justifyContent: 'center' },
  hospitalIconInactive: { backgroundColor: AppColors.surface.muted },
  hospitalName: { color: AppColors.text.strong, fontWeight: '800', fontSize: 14 },
  hospitalCode: { marginTop: 2, color: AppColors.text.muted, fontWeight: '700', fontSize: 11 },
  bodyStrong: { color: AppColors.text.strong, fontWeight: '800', fontSize: 14 },
  bodyMuted: { marginTop: 2, color: AppColors.text.muted, fontWeight: '600', fontSize: 12 },
  statusPill: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  statusActive: { backgroundColor: AppColors.status.successSoft },
  statusInactive: { backgroundColor: AppColors.surface.muted },
  statusText: { fontSize: 11, fontWeight: '800' },
  statusTextActive: { color: AppColors.severityTone.active },
  statusTextInactive: { color: AppColors.text.secondary },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  errorText: { color: AppColors.status.danger, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: AppColors.modal.darkBackdrop, alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', maxWidth: 820, maxHeight: '92%', backgroundColor: AppColors.surface.card, borderRadius: 24, overflow: 'hidden' },
  modalHeader: { padding: 24, borderBottomWidth: 1, borderBottomColor: AppColors.border.default, flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  modalTitle: { marginTop: 6, fontSize: 24, fontWeight: '800', color: AppColors.text.strong },
  closeButton: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: AppColors.border.default, alignItems: 'center', justifyContent: 'center' },
  form: { padding: 24, gap: 14 },
  twoCols: { flexDirection: 'row', gap: 12 },
  threeCols: { flexDirection: 'row', gap: 12 },
  field: { flex: 1, gap: 7 },
  formLabel: { fontSize: 12, fontWeight: '800', color: AppColors.text.secondary, textTransform: 'uppercase' },
  input: { minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: AppColors.border.strong, paddingHorizontal: 13, color: AppColors.text.strong, fontWeight: '700' },
  selectedHint: { color: AppColors.text.secondary, fontSize: 12, fontWeight: '700' },
  municipalityChoices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  municipalityChip: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: AppColors.surface.subtle, borderWidth: 1, borderColor: AppColors.border.default },
  municipalityChipActive: { backgroundColor: AppColors.border.brandSoft, borderColor: AppColors.border.brandSubtle },
  municipalityChipText: { color: AppColors.text.secondary, fontSize: 12, fontWeight: '800' },
  municipalityChipTextActive: { color: AppColors.brand.primary },
  modalFooter: { padding: 18, borderTopWidth: 1, borderTopColor: AppColors.border.default, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  detailModalCard: { maxWidth: 720 },
  detailTitleRow: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 14 },
  detailTitleCopy: { flex: 1, minWidth: 0 },
  detailSubtitle: { marginTop: 6, color: AppColors.text.secondary, fontWeight: '700', fontSize: 13 },
  detailBody: { padding: 24, gap: 20 },
  detailStats: { flexDirection: 'row', gap: 12 },
  detailStat: { flex: 1, minHeight: 82, borderRadius: 16, borderWidth: 1, borderColor: AppColors.border.default, backgroundColor: AppColors.surface.subtle, padding: 14, justifyContent: 'center' },
  detailStatValue: { color: AppColors.text.strong, fontWeight: '900', fontSize: 24, lineHeight: 30 },
  detailStatLabel: { marginTop: 4, color: AppColors.text.secondary, fontWeight: '800', fontSize: 11, textTransform: 'uppercase' },
  detailRows: { borderTopWidth: 1, borderTopColor: AppColors.border.default },
  detailRow: { minHeight: 48, borderBottomWidth: 1, borderBottomColor: AppColors.border.default, flexDirection: 'row', alignItems: 'center', gap: 18, paddingVertical: 12 },
  detailRowLabel: { width: 160, color: AppColors.text.secondary, fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  detailRowValue: { flex: 1, minWidth: 0, color: AppColors.text.strong, fontWeight: '700', fontSize: 13, lineHeight: 19 },
});

export default SystemHospitals;
