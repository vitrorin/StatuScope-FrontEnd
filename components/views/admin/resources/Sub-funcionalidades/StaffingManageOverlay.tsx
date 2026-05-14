import React, { useEffect, useState } from 'react';
import { Feather } from '@expo/vector-icons';
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
import { StaffingProfileItem } from '@/components/views/admin/resources/Sub-funcionalidades/types';

interface StaffingManageOverlayProps {
  visible: boolean;
  profiles: StaffingProfileItem[];
  saving?: boolean;
  deleting?: boolean;
  onClose: () => void;
  onSave: (profile: StaffingProfileItem, mode: 'create' | 'edit') => void;
  onDelete: (profile: StaffingProfileItem) => void;
}

const EMPTY_PROFILE: StaffingProfileItem = {
  id: '',
  roleCode: '',
  roleName: '',
  headcount: '0',
  onShiftCount: '0',
  onCallCount: '0',
  standbyCount: '0',
};

export function StaffingManageOverlay({
  visible,
  profiles,
  saving = false,
  deleting = false,
  onClose,
  onSave,
  onDelete,
}: StaffingManageOverlayProps) {
  const [draft, setDraft] = useState<StaffingProfileItem>(EMPTY_PROFILE);
  const [mode, setMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    if (visible) {
      setDraft(EMPTY_PROFILE);
      setMode('create');
    }
  }, [visible]);

  const updateField = (key: keyof StaffingProfileItem, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const selectProfile = (profile: StaffingProfileItem) => {
    setDraft(profile);
    setMode('edit');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Staffing Profiles</Text>
              <Text style={styles.title}>Manage Staffing</Text>
              <Text style={styles.subtitle}>Create, update, and remove real staffing profiles from the hospital database.</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.listPane}>
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Profiles</Text>
                <Button
                  label="New"
                  variant="surface"
                  size="sm"
                  onPress={() => {
                    setDraft(EMPTY_PROFILE);
                    setMode('create');
                  }}
                />
              </View>
              <ScrollView contentContainerStyle={styles.profileList} showsVerticalScrollIndicator={false}>
                {profiles.map((profile) => {
                  const isActive = mode === 'edit' && draft.id === profile.id;
                  return (
                    <TouchableOpacity
                      key={profile.id}
                      style={[styles.profileCard, isActive && styles.profileCardActive]}
                      activeOpacity={0.75}
                      onPress={() => selectProfile(profile)}
                    >
                      <Text style={styles.profileName}>{profile.roleName}</Text>
                      <Text style={styles.profileMeta}>{profile.roleCode}</Text>
                      <Text style={styles.profileMeta}>
                        {profile.onShiftCount} on shift, {profile.onCallCount} on call, {profile.standbyCount} standby
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.formPane}>
              <Text style={styles.formTitle}>{mode === 'create' ? 'New Profile' : 'Edit Profile'}</Text>
              <InputField
                label="Role Name"
                value={draft.roleName}
                onChangeText={(text) => updateField('roleName', text)}
                inputContainerStyle={styles.inputContainer}
              />
              <InputField
                label="Role Code"
                value={draft.roleCode}
                onChangeText={(text) => updateField('roleCode', text.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
                inputContainerStyle={styles.inputContainer}
              />
              <View style={styles.row}>
                <View style={styles.field}>
                  <InputField
                    label="Headcount"
                    type="number"
                    value={draft.headcount}
                    onChangeText={(text) => updateField('headcount', text.replace(/[^0-9]/g, ''))}
                    inputContainerStyle={styles.inputContainer}
                  />
                </View>
                <View style={styles.field}>
                  <InputField
                    label="On Shift"
                    type="number"
                    value={draft.onShiftCount}
                    onChangeText={(text) => updateField('onShiftCount', text.replace(/[^0-9]/g, ''))}
                    inputContainerStyle={styles.inputContainer}
                  />
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.field}>
                  <InputField
                    label="On Call"
                    type="number"
                    value={draft.onCallCount}
                    onChangeText={(text) => updateField('onCallCount', text.replace(/[^0-9]/g, ''))}
                    inputContainerStyle={styles.inputContainer}
                  />
                </View>
                <View style={styles.field}>
                  <InputField
                    label="Standby"
                    type="number"
                    value={draft.standbyCount}
                    onChangeText={(text) => updateField('standbyCount', text.replace(/[^0-9]/g, ''))}
                    inputContainerStyle={styles.inputContainer}
                  />
                </View>
              </View>

              <View style={styles.footer}>
                {mode === 'edit' ? (
                  <Button
                    label={deleting ? 'Deleting...' : 'Delete'}
                    variant="danger"
                    size="md"
                    style={styles.deleteButton}
                    disabled={saving || deleting}
                    onPress={() => onDelete(draft)}
                  />
                ) : null}
                <Button
                  label={saving ? 'Saving...' : mode === 'create' ? 'Create Profile' : 'Save Profile'}
                  variant="primary"
                  size="md"
                  style={styles.primaryButton}
                  disabled={saving || deleting || !draft.roleName.trim() || !draft.roleCode.trim()}
                  onPress={() => onSave(draft, mode)}
                />
              </View>
            </View>
          </View>
        </CardBase>
      </View>
    </Modal>
  );
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
    maxWidth: 980,
    maxHeight: '88%',
    borderRadius: 24,
    padding: 0,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 18,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: '#1718C7',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  content: {
    flexDirection: 'row',
    minHeight: 520,
  },
  listPane: {
    width: 320,
    borderRightWidth: 1,
    borderRightColor: '#EEF2F7',
    padding: 20,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  profileList: {
    gap: 10,
  },
  profileCard: {
    borderWidth: 1,
    borderColor: '#E8EDF5',
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  profileCardActive: {
    borderColor: '#C9D1FF',
    backgroundColor: '#F8FAFF',
  },
  profileName: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  profileMeta: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: '#70839B',
  },
  formPane: {
    flex: 1,
    padding: 24,
  },
  formTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  field: {
    flex: 1,
  },
  inputContainer: {
    height: 50,
    borderRadius: 12,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  deleteButton: {
    minWidth: 120,
  },
  primaryButton: {
    marginLeft: 'auto',
    minWidth: 160,
    backgroundColor: '#1718C7',
    borderColor: '#1718C7',
  },
});

export default StaffingManageOverlay;
