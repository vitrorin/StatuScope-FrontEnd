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
import { useTranslation } from '@/i18n';
import { isSpanish } from '@/components/views/admin/localization';
import { AppColors } from '@/constants/theme';

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
  const { language } = useTranslation();
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
              <Text style={styles.eyebrow}>{isSpanish(language) ? 'Perfiles de personal' : 'Staffing Profiles'}</Text>
              <Text style={styles.title}>{isSpanish(language) ? 'Gestionar personal' : 'Manage Staffing'}</Text>
              <Text style={styles.subtitle}>{isSpanish(language) ? 'Crea, actualiza y elimina perfiles de personal del hospital.' : 'Create, update, and remove real staffing profiles from the hospital database.'}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.scrollContentWrapper}>
            <View style={styles.listPane}>
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>{isSpanish(language) ? 'Perfiles' : 'Profiles'}</Text>
                <Button
                  label={isSpanish(language) ? 'Nuevo' : 'New'}
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
                        {isSpanish(language)
                          ? `${profile.onShiftCount} en turno, ${profile.onCallCount} en guardia, ${profile.standbyCount} en reserva`
                          : `${profile.onShiftCount} on shift, ${profile.onCallCount} on call, ${profile.standbyCount} standby`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.formPane}>
              <Text style={styles.formTitle}>{mode === 'create' ? (isSpanish(language) ? 'Nuevo perfil' : 'New Profile') : (isSpanish(language) ? 'Editar perfil' : 'Edit Profile')}</Text>
              <InputField
                label={isSpanish(language) ? 'Nombre del rol' : 'Role Name'}
                value={draft.roleName}
                onChangeText={(text) => updateField('roleName', text)}
                inputContainerStyle={styles.inputContainer}
              />
              <InputField
                label={isSpanish(language) ? 'Código del rol' : 'Role Code'}
                value={draft.roleCode}
                onChangeText={(text) => updateField('roleCode', text.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
                inputContainerStyle={styles.inputContainer}
              />
              <View style={styles.row}>
                <View style={styles.field}>
                  <InputField
                    label={isSpanish(language) ? 'Total' : 'Headcount'}
                    type="number"
                    value={draft.headcount}
                    onChangeText={(text) => updateField('headcount', text.replace(/[^0-9]/g, ''))}
                    inputContainerStyle={styles.inputContainer}
                  />
                </View>
                <View style={styles.field}>
                  <InputField
                    label={isSpanish(language) ? 'En turno' : 'On Shift'}
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
                    label={isSpanish(language) ? 'En guardia' : 'On Call'}
                    type="number"
                    value={draft.onCallCount}
                    onChangeText={(text) => updateField('onCallCount', text.replace(/[^0-9]/g, ''))}
                    inputContainerStyle={styles.inputContainer}
                  />
                </View>
                <View style={styles.field}>
                  <InputField
                    label={isSpanish(language) ? 'En reserva' : 'Standby'}
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
                    label={deleting ? (isSpanish(language) ? 'Eliminando...' : 'Deleting...') : (isSpanish(language) ? 'Eliminar' : 'Delete')}
                    variant="danger"
                    size="md"
                    style={styles.deleteButton}
                    disabled={saving || deleting}
                    onPress={() => onDelete(draft)}
                  />
                ) : null}
                <Button
                  label={saving ? (isSpanish(language) ? 'Guardando...' : 'Saving...') : mode === 'create' ? (isSpanish(language) ? 'Crear perfil' : 'Create Profile') : (isSpanish(language) ? 'Guardar perfil' : 'Save Profile')}
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
    backgroundColor: AppColors.modal.backdrop,
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
    borderBottomColor: AppColors.border.soft,
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: AppColors.brand.action,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    color: AppColors.text.primary,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: AppColors.text.soft,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.border.default,
  },
  scrollContentWrapper: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  listPane: {
    width: 320,
    borderRightWidth: 1,
    borderRightColor: AppColors.border.soft,
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
    color: AppColors.text.primary,
  },
  profileList: {
    gap: 10,
  },
  profileCard: {
    borderWidth: 1,
    borderColor: AppColors.resourceStatus.stable.track,
    borderRadius: 16,
    padding: 14,
    backgroundColor: AppColors.surface.card,
  },
  profileCardActive: {
    borderColor: AppColors.border.brandMuted,
    backgroundColor: AppColors.surface.raised,
  },
  profileName: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    color: AppColors.text.primary,
  },
  profileMeta: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: AppColors.text.soft,
  },
  formPane: {
    flex: 1,
    padding: 24,
  },
  formTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: AppColors.text.primary,
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
    backgroundColor: AppColors.brand.action,
    borderColor: AppColors.brand.action,
  },
});

export default StaffingManageOverlay;
