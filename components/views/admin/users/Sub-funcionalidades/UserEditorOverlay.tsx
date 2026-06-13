import React, { useEffect, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/foundation/Button';
import { InputField } from '@/components/inputs/InputField';
import { CardBase } from '@/components/patterns/CardBase';
import { useTranslation } from '@/i18n';
import { getAdminUserRoleLabel, getAdminUserStatusLabel, isSpanish } from '@/components/views/admin/localization';
import {
  AdminUserRecord,
  getInitials,
  mapRoleTone,
  mapStatusVariant,
  UserRole,
  UserStatus,
} from '@/components/views/admin/users/Sub-funcionalidades/types';
import { AppColors } from '@/constants/theme';

interface UserEditorOverlayProps {
  visible: boolean;
  mode: 'create' | 'edit';
  user: AdminUserRecord | null;
  onClose: () => void;
  saving?: boolean;
  onSave: (user: AdminUserRecord, password?: string) => Promise<void>;
}

const roleOptions: UserRole[] = [
  'Hospital Administrator',
  'Doctor',
];

const statusOptions: UserStatus[] = ['Active', 'Inactive'];

export function UserEditorOverlay({ visible, mode, user, onClose, onSave, saving = false }: UserEditorOverlayProps) {
  const { language } = useTranslation();
  const [draft, setDraft] = useState<AdminUserRecord>({
    id: '',
    initials: '',
    name: '',
    email: '',
    role: 'Doctor',
    roleTone: 'info',
    status: 'Active',
    statusVariant: 'success',
  });
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!visible) return;

    if (mode === 'edit' && user) {
      setDraft(user);
      setPassword('');
      return;
    }

      setDraft({
        id: `u-${Date.now()}`,
        initials: '',
        name: '',
        email: '',
      role: 'Doctor',
      roleTone: 'info',
      status: 'Active',
      statusVariant: 'success',
    });
    setPassword('');
  }, [mode, user, visible]);

  const setField = <K extends keyof AdminUserRecord>(key: K, value: AdminUserRecord[K]) => {
    setDraft((current) => {
      const next = { ...current, [key]: value };
      if (key === 'name') {
        next.initials = getInitials(String(value));
      }
      if (key === 'role') {
        next.roleTone = mapRoleTone(value as UserRole);
      }
      if (key === 'status') {
        next.statusVariant = mapStatusVariant(value as UserStatus);
      }
      return next;
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>{isSpanish(language) ? 'Gestion de usuarios' : 'User Management'}</Text>
              <Text style={styles.title}>{mode === 'create' ? (isSpanish(language) ? 'Crear usuario' : 'Create New User') : (isSpanish(language) ? 'Editar usuario' : 'Edit User')}</Text>
              <Text style={styles.subtitle}>
                {mode === 'create'
                  ? (isSpanish(language) ? 'Agrega un nuevo usuario de la plataforma con rol y estado.' : 'Add a new platform user with role and status.')
                  : (isSpanish(language) ? 'Actualiza el rol y el estado de la cuenta.' : 'Update role and account status.')}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.row}>
              <View style={styles.field}>
                <InputField
                  label={isSpanish(language) ? 'Nombre completo' : 'Full Name'}
                  value={draft.name}
                  onChangeText={(text) => setField('name', text)}
                  inputContainerStyle={styles.inputContainer}
                />
              </View>
              <View style={styles.field}>
                <InputField
                  label="Email"
                  type="email"
                  value={draft.email}
                  onChangeText={(text) => setField('email', text)}
                  inputContainerStyle={styles.inputContainer}
                />
              </View>
            </View>

            {mode === 'create' ? (
              <View style={styles.row}>
                <View style={styles.field}>
                  <InputField
                    label={isSpanish(language) ? 'Contrasena' : 'Password'}
                    type="password"
                    value={password}
                    onChangeText={setPassword}
                    inputContainerStyle={styles.inputContainer}
                  />
                </View>
                <View style={styles.field} />
              </View>
            ) : null}

            <View style={styles.selectorBlock}>
              <Text style={styles.selectorLabel}>{isSpanish(language) ? 'Rol' : 'Role'}</Text>
              <View style={styles.chipsRow}>
                {roleOptions.map((option) => {
                  const isActive = draft.role === option;
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => setField('role', option)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{getAdminUserRoleLabel(option, language)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.selectorBlock}>
              <Text style={styles.selectorLabel}>{isSpanish(language) ? 'Estado' : 'Status'}</Text>
              <View style={styles.chipsRow}>
                {statusOptions.map((option) => {
                  const isActive = draft.status === option;
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => setField('status', option)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{getAdminUserStatusLabel(option, language)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button label={isSpanish(language) ? 'Cancelar' : 'Cancel'} variant="secondary" size="md" style={styles.footerButton} onPress={onClose} />
              <Button
              label={saving ? (isSpanish(language) ? 'Guardando...' : 'Saving...') : mode === 'create' ? (isSpanish(language) ? 'Crear usuario' : 'Create User') : (isSpanish(language) ? 'Guardar cambios' : 'Save Changes')}
              variant="primary"
              size="md"
              style={[styles.footerButton, styles.primaryButton]}
              onPress={() => { void onSave(draft, password); }}
              disabled={saving}
            />
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
    maxWidth: 760,
    maxHeight: '90%',
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
    fontSize: 22,
    lineHeight: 28,
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
  content: {
    padding: 24,
    gap: 16,
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
  selectorBlock: {
    gap: 10,
  },
  readOnlyCard: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: AppColors.surface.raised,
    borderColor: AppColors.border.brandSoft,
  },
  readOnlyLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: AppColors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  readOnlyValue: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: AppColors.brand.action,
  },
  selectorLabel: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
    color: AppColors.text.body,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: AppColors.surface.subtle,
    borderWidth: 1,
    borderColor: AppColors.resourceStatus.stable.track,
  },
  chipActive: {
    backgroundColor: AppColors.surface.brandSoft,
    borderColor: AppColors.border.brandMuted,
  },
  chipText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: AppColors.text.soft,
  },
  chipTextActive: {
    color: AppColors.brand.action,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: AppColors.border.soft,
  },
  footerButton: {
    minWidth: 150,
  },
  primaryButton: {
    backgroundColor: AppColors.brand.action,
    borderColor: AppColors.brand.action,
  },
});

export default UserEditorOverlay;
