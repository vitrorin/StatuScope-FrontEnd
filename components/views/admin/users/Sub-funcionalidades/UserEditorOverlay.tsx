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
              <Feather name="x" size={18} color="#64748B" />
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
              style={{ ...styles.footerButton, ...styles.primaryButton }}
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
    backgroundColor: 'rgba(255,255,255,0.74)',
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
    fontSize: 22,
    lineHeight: 28,
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
    backgroundColor: '#F8FAFF',
    borderColor: '#E0E7FF',
  },
  readOnlyLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: '#8A9AAF',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  readOnlyValue: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#1718C7',
  },
  selectorLabel: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
    color: '#526174',
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
    backgroundColor: '#F6F8FC',
    borderWidth: 1,
    borderColor: '#E8EDF5',
  },
  chipActive: {
    backgroundColor: '#EEF1FF',
    borderColor: '#C9D1FF',
  },
  chipText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: '#70839B',
  },
  chipTextActive: {
    color: '#1718C7',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 24,
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

export default UserEditorOverlay;
