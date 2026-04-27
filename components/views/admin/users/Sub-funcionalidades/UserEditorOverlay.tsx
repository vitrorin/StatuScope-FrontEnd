import React, { useEffect, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/foundation/Button';
import { InputField } from '@/components/inputs/InputField';
import { CardBase } from '@/components/patterns/CardBase';
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
  onSave: (user: AdminUserRecord) => void;
}

const roleOptions: UserRole[] = [
  'Hospital Administrator',
  'Doctor',
];

const statusOptions: UserStatus[] = ['Active', 'Inactive', 'Suspended'];

export function UserEditorOverlay({ visible, mode, user, onClose, onSave }: UserEditorOverlayProps) {
  const [draft, setDraft] = useState<AdminUserRecord>({
    id: '',
    initials: '',
    name: '',
    email: '',
    role: 'Doctor',
    roleTone: 'info',
    pcId: '',
    status: 'Active',
    statusVariant: 'success',
  });

  useEffect(() => {
    if (!visible) return;

    if (mode === 'edit' && user) {
      setDraft(user);
      return;
    }

      setDraft({
        id: `u-${Date.now()}`,
        initials: '',
        name: '',
        email: '',
      role: 'Doctor',
      roleTone: 'info',
      pcId: '',
      status: 'Active',
      statusVariant: 'success',
    });
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
              <Text style={styles.eyebrow}>User Management</Text>
              <Text style={styles.title}>{mode === 'create' ? 'Create New User' : 'Edit User'}</Text>
              <Text style={styles.subtitle}>
                {mode === 'create'
                  ? 'Add a new platform user with role and status.'
                  : 'Update role, email, ID, and account status.'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.row}>
              <View style={styles.field}>
                <InputField
                  label="Full Name"
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

            <CardBase style={styles.readOnlyCard}>
              <Text style={styles.readOnlyLabel}>System Assigned ID</Text>
              <Text style={styles.readOnlyValue}>{draft.pcId || 'Will be generated automatically'}</Text>
            </CardBase>

            <View style={styles.selectorBlock}>
              <Text style={styles.selectorLabel}>Role</Text>
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
                      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{option}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.selectorBlock}>
              <Text style={styles.selectorLabel}>Status</Text>
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
                      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{option}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <Button label="Cancel" variant="secondary" size="md" style={styles.footerButton} onPress={onClose} />
            <Button
              label={mode === 'create' ? 'Create User' : 'Save Changes'}
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
