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
import { DepartmentResourceItem } from '@/components/views/admin/resources/Sub-funcionalidades/types';
import { useTranslation } from '@/i18n';
import { isSpanish } from '@/components/views/admin/localization';
import { AppColors } from '@/constants/theme';

interface DepartmentManageOverlayProps {
  visible: boolean;
  department: DepartmentResourceItem | null;
  mode: 'create' | 'edit';
  saving?: boolean;
  deleting?: boolean;
  onClose: () => void;
  onSave: (department: DepartmentResourceItem) => void;
  onDelete?: (department: DepartmentResourceItem) => void;
}

const EMPTY_DEPARTMENT: DepartmentResourceItem = {
  id: '',
  code: '',
  name: '',
  level: '',
  totalBeds: '0',
  occupiedBeds: '0',
  status: 'Stable',
  notes: '',
};

export function DepartmentManageOverlay({
  visible,
  department,
  mode,
  saving = false,
  deleting = false,
  onClose,
  onSave,
  onDelete,
}: DepartmentManageOverlayProps) {
  const { language } = useTranslation();
  const [draft, setDraft] = useState<DepartmentResourceItem>(department ?? EMPTY_DEPARTMENT);

  useEffect(() => {
    if (visible) {
      setDraft(department ?? EMPTY_DEPARTMENT);
    }
  }, [department, visible]);

  const updateField = (key: keyof DepartmentResourceItem, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const isCreate = mode === 'create';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>{isSpanish(language) ? 'Gestor de departamentos' : 'Department Manager'}</Text>
              <Text style={styles.title}>{isCreate ? (isSpanish(language) ? 'Agregar departamento' : 'Add Department') : draft.name || (isSpanish(language) ? 'Departamento' : 'Department')}</Text>
              <Text style={styles.subtitle}>{isSpanish(language) ? 'Gestiona el registro de departamento almacenado para este hospital.' : 'Manage the real department record stored for this hospital.'}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.row}>
              <View style={styles.field}>
                <InputField
                  label={isSpanish(language) ? 'Nombre del departamento' : 'Department Name'}
                  value={draft.name}
                  onChangeText={(text) => updateField('name', text)}
                  inputContainerStyle={styles.inputContainer}
                />
              </View>
              <View style={styles.field}>
                <InputField
                  label={isSpanish(language) ? 'Código del departamento' : 'Department Code'}
                  value={draft.code}
                  onChangeText={(text) => updateField('code', text.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
                  inputContainerStyle={styles.inputContainer}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.field}>
                <InputField
                  label={isSpanish(language) ? 'Nivel' : 'Level'}
                  value={draft.level}
                  onChangeText={(text) => updateField('level', text)}
                  inputContainerStyle={styles.inputContainer}
                />
              </View>
              <View style={styles.field}>
                <InputField
                  label={isSpanish(language) ? 'Camas totales' : 'Total Beds'}
                  type="number"
                  value={draft.totalBeds}
                  onChangeText={(text) => updateField('totalBeds', text.replace(/[^0-9]/g, ''))}
                  inputContainerStyle={styles.inputContainer}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.field}>
                <InputField
                  label={isSpanish(language) ? 'Camas ocupadas' : 'Occupied Beds'}
                  type="number"
                  value={draft.occupiedBeds}
                  onChangeText={(text) => updateField('occupiedBeds', text.replace(/[^0-9]/g, ''))}
                  inputContainerStyle={styles.inputContainer}
                />
              </View>
            </View>

            <View style={styles.statusRow}>
              {(['Critical', 'Stable', 'High Demand'] as DepartmentResourceItem['status'][]).map((status) => {
                const statusLabels: Record<string, string> = {
                  'Critical': isSpanish(language) ? 'Crítico' : 'Critical',
                  'Stable': isSpanish(language) ? 'Estable' : 'Stable',
                  'High Demand': isSpanish(language) ? 'Alta demanda' : 'High Demand',
                };
                const isActive = draft.status === status;
                return (
                  <TouchableOpacity
                    key={status}
                    style={[styles.statusChip, isActive && styles.statusChipActive]}
                    onPress={() => updateField('status', status)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.statusChipText, isActive && styles.statusChipTextActive]}>{statusLabels[status] ?? status}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <InputField
              label={isSpanish(language) ? 'Notas operativas' : 'Operational Notes'}
              value={draft.notes}
              onChangeText={(text) => updateField('notes', text)}
              inputContainerStyle={styles.notesInputContainer}
              inputStyle={styles.notesInput}
            />
          </ScrollView>

          <View style={styles.footer}>
            {!isCreate && onDelete ? (
              <Button
                label={deleting ? (isSpanish(language) ? 'Eliminando...' : 'Deleting...') : (isSpanish(language) ? 'Eliminar' : 'Delete')}
                variant="danger"
                size="md"
                style={styles.deleteButton}
                disabled={saving || deleting}
                onPress={() => onDelete(draft)}
              />
            ) : null}
            <Button label={isSpanish(language) ? 'Cancelar' : 'Cancel'} variant="secondary" size="md" style={styles.footerButton} onPress={onClose} />
            <Button
              label={saving ? (isSpanish(language) ? 'Guardando...' : 'Saving...') : isCreate ? (isSpanish(language) ? 'Crear departamento' : 'Create Department') : (isSpanish(language) ? 'Guardar departamento' : 'Save Department')}
              variant="primary"
              size="md"
              style={[styles.footerButton, styles.primaryButton]}
              disabled={saving || deleting || !draft.name.trim() || !draft.code.trim()}
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
    backgroundColor: AppColors.modal.backdrop,
  },
  dialog: {
    width: '100%',
    maxWidth: 720,
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
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: AppColors.brand.action,
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
  statusRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  statusChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: AppColors.surface.subtle,
    borderWidth: 1,
    borderColor: AppColors.resourceStatus.stable.track,
  },
  statusChipActive: {
    backgroundColor: AppColors.surface.brandSoft,
    borderColor: AppColors.border.brandMuted,
  },
  statusChipText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: AppColors.text.soft,
  },
  statusChipTextActive: {
    color: AppColors.brand.action,
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
    borderTopColor: AppColors.border.soft,
  },
  deleteButton: {
    marginRight: 'auto',
    minWidth: 120,
  },
  footerButton: {
    minWidth: 150,
  },
  primaryButton: {
    backgroundColor: AppColors.brand.action,
    borderColor: AppColors.brand.action,
  },
});

export default DepartmentManageOverlay;
