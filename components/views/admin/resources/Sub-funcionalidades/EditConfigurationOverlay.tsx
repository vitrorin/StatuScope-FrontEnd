import React, { useEffect, useMemo, useState } from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '@/components/foundation/Button';
import { InputField } from '@/components/inputs/InputField';
import { CardBase } from '@/components/patterns/CardBase';
import { DepartmentResourceItem, ResourceConfiguration } from '@/components/views/admin/resources/Sub-funcionalidades/types';

type ConfigurationTab = 'capacity' | 'staff' | 'specialists' | 'departments';

interface EditConfigurationOverlayProps {
  visible: boolean;
  value: ResourceConfiguration;
  departments: DepartmentResourceItem[];
  onClose: () => void;
  onSave: (value: ResourceConfiguration) => void;
}

const tabs: { key: ConfigurationTab; label: string }[] = [
  { key: 'capacity', label: 'Capacity' },
  { key: 'staff', label: 'Core Staff' },
  { key: 'specialists', label: 'Specialists' },
  { key: 'departments', label: 'Departments' },
];

const specialistFields: { key: keyof ResourceConfiguration; label: string }[] = [
  { key: 'neurologists', label: 'Neurologists' },
  { key: 'cardiologists', label: 'Cardiologists' },
  { key: 'pediatricians', label: 'Pediatricians' },
  { key: 'surgeons', label: 'Surgeons' },
  { key: 'anesthesiologists', label: 'Anesthesiologists' },
  { key: 'radiologists', label: 'Radiologists' },
  { key: 'pulmonologists', label: 'Pulmonologists' },
  { key: 'infectiousDiseaseSpecialists', label: 'Infectious Disease' },
  { key: 'emergencyPhysicians', label: 'Emergency Physicians' },
];

export function EditConfigurationOverlay({
  visible,
  value,
  departments,
  onClose,
  onSave,
}: EditConfigurationOverlayProps) {
  const [draft, setDraft] = useState<ResourceConfiguration>(value);
  const [activeTab, setActiveTab] = useState<ConfigurationTab>('capacity');

  useEffect(() => {
    if (visible) {
      setDraft(value);
      setActiveTab('capacity');
    }
  }, [value, visible]);

  const totalDepartmentBeds = useMemo(
    () => departments.reduce((sum, item) => sum + parseInteger(item.totalBeds), 0),
    [departments]
  );

  const updateField = (key: keyof ResourceConfiguration, nextValue: string) => {
    const sanitized = nextValue.replace(/[^0-9]/g, '');
    setDraft((current) => ({ ...current, [key]: sanitized }));
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Resource Configuration</Text>
              <Text style={styles.title}>Hospital Capacity Settings</Text>
              <Text style={styles.subtitle}>
                Update bed totals, staffing pool, specialist availability, and monitor department coverage.
              </Text>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.tabsRow}>
            {tabs.map((tab) => {
              const isActive = tab.key === activeTab;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tab, isActive && styles.tabActive]}
                  onPress={() => setActiveTab(tab.key)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
            {activeTab === 'capacity' ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Capacity Overview</Text>
                <View style={styles.grid}>
                  <View style={styles.field}>
                    <InputField
                      label="Total Beds"
                      type="number"
                      value={draft.totalBeds}
                      onChangeText={(text) => updateField('totalBeds', text)}
                      inputContainerStyle={styles.inputContainer}
                    />
                  </View>
                  <View style={styles.field}>
                    <InputField
                      label="Total Personnel"
                      type="number"
                      value={draft.totalPersonnel}
                      onChangeText={(text) => updateField('totalPersonnel', text)}
                      inputContainerStyle={styles.inputContainer}
                    />
                  </View>
                </View>
                <CardBase style={styles.infoCard}>
                  <Text style={styles.infoTitle}>Current Department Bed Count</Text>
                  <Text style={styles.infoValue}>{totalDepartmentBeds} beds mapped across monitored departments</Text>
                </CardBase>
              </View>
            ) : null}

            {activeTab === 'staff' ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Core Staffing</Text>
                <View style={styles.grid}>
                  <View style={styles.field}>
                    <InputField
                      label="Doctors"
                      type="number"
                      value={draft.doctors}
                      onChangeText={(text) => updateField('doctors', text)}
                      inputContainerStyle={styles.inputContainer}
                    />
                  </View>
                  <View style={styles.field}>
                    <InputField
                      label="Nurses"
                      type="number"
                      value={draft.nurses}
                      onChangeText={(text) => updateField('nurses', text)}
                      inputContainerStyle={styles.inputContainer}
                    />
                  </View>
                </View>
                <CardBase style={styles.infoCard}>
                  <Text style={styles.infoTitle}>Staffing Snapshot</Text>
                  <Text style={styles.infoValue}>
                    {draft.doctors || '0'} doctors and {draft.nurses || '0'} nurses are currently planned.
                  </Text>
                </CardBase>
              </View>
            ) : null}

            {activeTab === 'specialists' ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Specialist Doctors</Text>
                <View style={styles.grid}>
                  {specialistFields.map((field) => (
                    <View key={field.key} style={styles.field}>
                      <InputField
                        label={field.label}
                        type="number"
                        value={draft[field.key]}
                        onChangeText={(text) => updateField(field.key, text)}
                        inputContainerStyle={styles.inputContainer}
                      />
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {activeTab === 'departments' ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Departments Overview</Text>
                <View style={styles.departmentList}>
                  {departments.map((department) => (
                    <CardBase key={department.id} style={styles.departmentCard}>
                      <View style={styles.departmentTitleRow}>
                        <Text style={styles.departmentName}>{department.name}</Text>
                        <Text style={styles.departmentStatus}>{department.status}</Text>
                      </View>
                      <Text style={styles.departmentMeta}>{department.level}</Text>
                      <Text style={styles.departmentMeta}>
                        {department.occupiedBeds}/{department.totalBeds} beds currently occupied
                      </Text>
                      <Text style={styles.departmentNote}>{department.notes}</Text>
                    </CardBase>
                  ))}
                </View>
                <View style={styles.departmentHint}>
                  <MaterialCommunityIcons name="information-outline" size={16} color="#1718C7" />
                  <Text style={styles.departmentHintText}>
                    Detailed department editing lives in the individual Manage action from the main resources table.
                  </Text>
                </View>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <Button label="Cancel" variant="secondary" size="md" style={styles.footerButton} onPress={onClose} />
            <Button
              label="Save Configuration"
              variant="primary"
              size="md"
              style={{ ...styles.footerButton, ...styles.primaryButton }}
              onPress={() => onSave(draft)}
            />
          </View>
        </CardBase>
      </View>
    </Modal>
  );
}

function parseInteger(value: string) {
  const parsedValue = Number.parseInt(value || '0', 10);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.74)',
  },
  dialog: {
    width: '100%',
    maxWidth: 860,
    maxHeight: '90%',
    borderRadius: 24,
    padding: 0,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderColor: '#E4EAF4',
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 20,
    paddingHorizontal: 26,
    paddingTop: 24,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#1718C7',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: '#70839B',
    maxWidth: 580,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 26,
    paddingTop: 18,
    paddingBottom: 6,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#F6F8FC',
    borderWidth: 1,
    borderColor: '#E8EDF5',
  },
  tabActive: {
    backgroundColor: '#EEF1FF',
    borderColor: '#C9D1FF',
  },
  tabLabel: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: '#70839B',
  },
  tabLabelActive: {
    color: '#1718C7',
  },
  formContent: {
    paddingHorizontal: 26,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 22,
  },
  section: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  field: {
    width: '50%',
    paddingHorizontal: 8,
  },
  inputContainer: {
    height: 50,
    borderRadius: 12,
    borderColor: '#DCE3EE',
  },
  infoCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F8FAFF',
    borderColor: '#E0E7FF',
  },
  infoTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: '#1718C7',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 14,
    lineHeight: 22,
    color: '#526174',
  },
  departmentList: {
    gap: 12,
  },
  departmentCard: {
    borderRadius: 16,
    padding: 14,
  },
  departmentTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 6,
  },
  departmentName: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  departmentStatus: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#1718C7',
  },
  departmentMeta: {
    fontSize: 12,
    lineHeight: 18,
    color: '#70839B',
  },
  departmentNote: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: '#526174',
  },
  departmentHint: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  departmentHintText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#526174',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 26,
    paddingTop: 18,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
  },
  footerButton: {
    minWidth: 150,
  },
  primaryButton: {
    backgroundColor: '#1718C7',
    borderColor: '#1718C7',
  },
});

export default EditConfigurationOverlay;
