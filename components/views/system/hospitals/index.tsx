import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { systemNavigationLinks, getSystemSidebarItems } from '@/components/dashboard/systemNavigation';
import { Button } from '@/components/foundation/Button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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

export function SystemHospitals() {
  const router = useRouter();
  const { logout, profile } = useAuth();
  const { language } = useTranslation();
  const es = isSpanish(language);
  const [hospitals, setHospitals] = useState<HospitalResponse[]>([]);
  const [municipalities, setMunicipalities] = useState<MunicipalityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<HospitalResponse | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const sidebarItems = useMemo(() => getSystemSidebarItems(language), [language]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [hospitalRows, municipalityRows] = await Promise.all([listSystemHospitals(), listSystemMunicipalities()]);
      setHospitals(hospitalRows);
      setMunicipalities(municipalityRows);
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
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
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
            leadingIcon={<Feather name="plus" size={16} color="#FFFFFF" />}
            onPress={() => { setSelectedHospital(null); setEditorOpen(true); }}
          />
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard title={es ? 'Total de hospitales' : 'Total Facilities'} value={hospitals.length} icon="hospital-building" tone="#1D4ED8" />
          <SummaryCard title={es ? 'Activos' : 'Active Partners'} value={activeCount} icon="check-decagram-outline" tone="#10B981" />
          <SummaryCard title={es ? 'Inactivos o pendientes' : 'Inactive or Pending'} value={inactiveCount} icon="dots-horizontal-circle-outline" tone="#64748B" />
        </View>

        <View style={styles.toolbar}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={es ? 'Buscar hospitales, ciudades o estados...' : 'Search hospitals, cities, or states...'}
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
        </View>

        {loading ? <HospitalsSkeleton /> : (
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.hospitalCol]}>{es ? 'Hospital' : 'Hospital Name'}</Text>
              <Text style={[styles.headerCell, styles.cityCol]}>{es ? 'Ubicación' : 'Location'}</Text>
              <Text style={[styles.headerCell, styles.staffCol]}>{es ? 'Personal' : 'Staff'}</Text>
              <Text style={[styles.headerCell, styles.statusCol]}>{es ? 'Estado' : 'Status'}</Text>
              <Text style={[styles.headerCell, styles.actionCol]}>{es ? 'Acciones' : 'Actions'}</Text>
            </View>
            {filteredHospitals.map((hospital) => (
              <View key={hospital.id} style={styles.tableRow}>
                <View style={[styles.hospitalCell, styles.hospitalCol]}>
                  <View style={[styles.hospitalIcon, !hospital.active && styles.hospitalIconInactive]}>
                    <MaterialCommunityIcons name="hospital-building" size={17} color={hospital.active ? '#1D4ED8' : '#64748B'} />
                  </View>
                  <View>
                    <Text style={styles.hospitalName}>{hospital.name}</Text>
                    <Text style={styles.hospitalCode}>{hospital.code}</Text>
                  </View>
                </View>
                <View style={styles.cityCol}>
                  <Text style={styles.bodyStrong}>{hospital.municipalityName ?? (es ? 'Sin municipio' : 'No municipality')}</Text>
                  <Text style={styles.bodyMuted}>{hospital.stateName ?? (es ? 'Sin estado' : 'No state')}</Text>
                </View>
                <View style={styles.staffCol}>
                  <Text style={styles.bodyStrong}>{(hospital.doctorCount ?? 0) + (hospital.nurseCount ?? 0)}</Text>
                  <Text style={styles.bodyMuted}>{es ? 'miembros' : 'staff'}</Text>
                </View>
                <View style={styles.statusCol}><StatusPill active={hospital.active} es={es} /></View>
                <View style={[styles.actionCol, styles.actions]}>
                  <TouchableOpacity onPress={() => { setSelectedHospital(hospital); setEditorOpen(true); }} activeOpacity={0.75}>
                    <Feather name="edit-2" size={17} color="#64748B" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { void toggleStatus(hospital); }} activeOpacity={0.75} disabled={saving}>
                    <Feather name={hospital.active ? 'slash' : 'check-circle'} size={18} color={hospital.active ? '#EF4444' : '#10B981'} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

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
            <TouchableOpacity style={styles.closeButton} onPress={onClose}><Feather name="x" size={20} color="#64748B" /></TouchableOpacity>
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
                placeholderTextColor="#94A3B8"
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

function HospitalsSkeleton() {
  return (
    <View style={styles.tableCard}>
      <View style={styles.tableHeader}>
        <View style={[styles.skeletonLine, styles.hospitalCol]} />
        <View style={[styles.skeletonLine, styles.cityCol]} />
        <View style={[styles.skeletonLine, styles.staffCol]} />
        <View style={[styles.skeletonLine, styles.statusCol]} />
      </View>
      {Array.from({ length: 5 }).map((_, index) => (
        <View key={index} style={styles.tableRow}>
          <View style={[styles.hospitalCell, styles.hospitalCol]}>
            <View style={styles.skeletonIcon} />
            <View style={styles.skeletonStack}>
              <View style={[styles.skeletonLine, { width: index === 1 ? 170 : 210 }]} />
              <View style={[styles.skeletonLine, { width: 72, height: 10 }]} />
            </View>
          </View>
          <View style={styles.cityCol}>
            <View style={[styles.skeletonLine, { width: 130 }]} />
          </View>
          <View style={styles.staffCol}>
            <View style={[styles.skeletonLine, { width: 58 }]} />
          </View>
          <View style={styles.statusCol}>
            <View style={styles.skeletonBadge} />
          </View>
          <View style={styles.actionCol}>
            <View style={[styles.skeletonLine, { width: 44 }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

function Field({ label, value, onChangeText }: { label: string; value: string; onChangeText: (value: string) => void }) {
  return (
    <View style={styles.field}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} style={styles.input} placeholderTextColor="#94A3B8" />
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

const styles = StyleSheet.create({
  contentContainer: { padding: 32, gap: 24 },
  hero: { backgroundColor: '#F8FAFF', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(0, 3, 184, 0.08)', padding: 28, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 20, shadowColor: '#000F6B', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 26, elevation: 4 },
  eyebrow: { fontSize: 12, fontWeight: '800', color: '#0003B8', textTransform: 'uppercase' },
  title: { marginTop: 8, fontSize: 30, lineHeight: 38, fontWeight: '800', color: '#111827' },
  subtitle: { marginTop: 6, fontSize: 15, lineHeight: 23, color: '#64748B' },
  summaryGrid: { flexDirection: 'row', gap: 20 },
  summaryCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0', padding: 22, flexDirection: 'row', alignItems: 'center', gap: 14, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 24, elevation: 3 },
  summaryIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  summaryTitle: { fontSize: 12, fontWeight: '800', color: '#64748B', textTransform: 'uppercase' },
  summaryValue: { marginTop: 4, fontSize: 28, fontWeight: '800', color: '#1D4ED8' },
  toolbar: { backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0', padding: 18, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 2 },
  searchInput: { minHeight: 46, borderRadius: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 14, color: '#111827', fontWeight: '600' },
  tableCard: { backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 24, elevation: 3 },
  tableHeader: { minHeight: 52, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 20 },
  tableRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  headerCell: { fontSize: 12, fontWeight: '800', color: '#64748B', textTransform: 'uppercase' },
  hospitalCol: { flex: 1.8 },
  cityCol: { flex: 1.2 },
  staffCol: { flex: 0.8 },
  statusCol: { flex: 0.8 },
  actionCol: { flex: 0.6 },
  hospitalCell: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hospitalIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center' },
  hospitalIconInactive: { backgroundColor: '#F1F5F9' },
  hospitalName: { color: '#111827', fontWeight: '800', fontSize: 14 },
  hospitalCode: { marginTop: 2, color: '#94A3B8', fontWeight: '700', fontSize: 11 },
  bodyStrong: { color: '#111827', fontWeight: '800', fontSize: 14 },
  bodyMuted: { marginTop: 2, color: '#94A3B8', fontWeight: '600', fontSize: 12 },
  statusPill: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  statusActive: { backgroundColor: '#DCFCE7' },
  statusInactive: { backgroundColor: '#F1F5F9' },
  statusText: { fontSize: 11, fontWeight: '800' },
  statusTextActive: { color: '#059669' },
  statusTextInactive: { color: '#64748B' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  errorText: { color: '#DC2626', fontWeight: '700' },
  skeletonTable: { height: 360, backgroundColor: '#F8FAFC' },
  skeletonLine: { height: 12, borderRadius: 999, backgroundColor: '#E8EEF6' },
  skeletonIcon: { width: 36, height: 36, borderRadius: 14, backgroundColor: '#DBEAFE' },
  skeletonStack: { gap: 7 },
  skeletonBadge: { width: 82, height: 28, borderRadius: 999, backgroundColor: '#EEF2F7' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.42)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', maxWidth: 820, maxHeight: '92%', backgroundColor: '#FFFFFF', borderRadius: 24, overflow: 'hidden' },
  modalHeader: { padding: 24, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  modalTitle: { marginTop: 6, fontSize: 24, fontWeight: '800', color: '#111827' },
  closeButton: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  form: { padding: 24, gap: 14 },
  twoCols: { flexDirection: 'row', gap: 12 },
  threeCols: { flexDirection: 'row', gap: 12 },
  field: { flex: 1, gap: 7 },
  formLabel: { fontSize: 12, fontWeight: '800', color: '#64748B', textTransform: 'uppercase' },
  input: { minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 13, color: '#111827', fontWeight: '700' },
  selectedHint: { color: '#64748B', fontSize: 12, fontWeight: '700' },
  municipalityChoices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  municipalityChip: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  municipalityChipActive: { backgroundColor: '#E0E7FF', borderColor: '#C7D2FE' },
  municipalityChipText: { color: '#64748B', fontSize: 12, fontWeight: '800' },
  municipalityChipTextActive: { color: '#0003B8' },
  modalFooter: { padding: 18, borderTopWidth: 1, borderTopColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
});

export default SystemHospitals;
