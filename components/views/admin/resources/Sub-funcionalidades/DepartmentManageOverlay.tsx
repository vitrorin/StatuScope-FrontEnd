import React, { useEffect, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '@/components/foundation/Button';
import { InputField } from '@/components/inputs/InputField';
import { CardBase } from '@/components/patterns/CardBase';
import { DepartmentResourceItem } from '@/components/views/admin/resources/Sub-funcionalidades/types';

interface DepartmentManageOverlayProps {
  visible: boolean;
  department: DepartmentResourceItem | null;
  onClose: () => void;
  onSave: (department: DepartmentResourceItem) => void;
}

export function DepartmentManageOverlay({
  visible,
  department,
  onClose,
  onSave,
}: DepartmentManageOverlayProps) {
  const [draft, setDraft] = useState<DepartmentResourceItem | null>(department);

  useEffect(() => {
    if (visible) {
      setDraft(department);
    }
  }, [department, visible]);

  if (!draft) return null;

  const updateField = (
    key: keyof DepartmentResourceItem,
    value: string
  ) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Department Manager</Text>
              <Text style={styles.title}>{draft.name}</Text>
              <Text style={styles.subtitle}>Adjust beds, occupancy, status, and operational notes.</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.row}>
              <View style={styles.field}>
                <InputField
                  label="Total Beds"
                  type="number"
                  value={draft.totalBeds}
                  onChangeText={(text) => updateField('totalBeds', text.replace(/[^0-9]/g, ''))}
                  inputContainerStyle={styles.inputContainer}
                />
              </View>
              <View style={styles.field}>
                <InputField
                  label="Occupied Beds"
                  type="number"
                  value={draft.occupiedBeds}
                  onChangeText={(text) => updateField('occupiedBeds', text.replace(/[^0-9]/g, ''))}
                  inputContainerStyle={styles.inputContainer}
                />
              </View>
            </View>

            <View style={styles.statusRow}>
              {(['Critical', 'Stable', 'High Demand'] as DepartmentResourceItem['status'][]).map((status) => {
                const isActive = draft.status === status;
                return (
                  <TouchableOpacity
                    key={status}
                    style={[styles.statusChip, isActive && styles.statusChipActive]}
                    onPress={() => updateField('status', status)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.statusChipText, isActive && styles.statusChipTextActive]}>{status}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <InputField
              label="Operational Notes"
              value={draft.notes}
              onChangeText={(text) => updateField('notes', text)}
              inputContainerStyle={styles.notesInputContainer}
              inputStyle={styles.notesInput}
            />
          </View>

          <View style={styles.footer}>
            <Button label="Cancel" variant="secondary" size="md" style={styles.footerButton} onPress={onClose} />
            <Button
              label="Save Department"
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
    maxWidth: 620,
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
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#1718C7',
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
  statusRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  statusChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#F6F8FC',
    borderWidth: 1,
    borderColor: '#E8EDF5',
  },
  statusChipActive: {
    backgroundColor: '#EEF1FF',
    borderColor: '#C9D1FF',
  },
  statusChipText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: '#70839B',
  },
  statusChipTextActive: {
    color: '#1718C7',
  },
  notesInputContainer: {
    height: 52,
    borderRadius: 12,
  },
  notesInput: {
    fontSize: 14,
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

export default DepartmentManageOverlay;
