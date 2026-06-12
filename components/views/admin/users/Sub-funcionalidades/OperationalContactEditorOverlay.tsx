import React, { useEffect, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/foundation/Button';
import { SelectableChip } from '@/components/foundation/SelectableChip';
import { InputField } from '@/components/inputs/InputField';
import { CardBase } from '@/components/patterns/CardBase';
import { HospitalDepartmentResourceResponse, OperationalContactInput, OperationalContactResponse } from '@/lib/adminOperational';
import { useTranslation } from '@/i18n';
import { isSpanish } from '@/components/views/admin/localization';
import { AppColors } from '@/constants/theme';

interface OperationalContactEditorOverlayProps {
  visible: boolean;
  contact: OperationalContactResponse | null;
  departments: HospitalDepartmentResourceResponse[];
  saving: boolean;
  onClose: () => void;
  onSave: (input: OperationalContactInput) => void;
}

export function OperationalContactEditorOverlay({
  visible,
  contact,
  departments,
  saving,
  onClose,
  onSave,
}: OperationalContactEditorOverlayProps) {
  const { language } = useTranslation();
  const spanish = isSpanish(language);
  const [displayName, setDisplayName] = useState('');
  const [roleLabel, setRoleLabel] = useState('');
  const [departmentCode, setDepartmentCode] = useState('');
  const [email, setEmail] = useState('');
  const [assignable, setAssignable] = useState(true);
  const [notifiable, setNotifiable] = useState(true);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!visible) return;
    setDisplayName(contact?.displayName ?? '');
    setRoleLabel(contact?.roleLabel ?? '');
    setDepartmentCode(contact?.departmentCode ?? '');
    setEmail(contact?.contactValue ?? '');
    setAssignable(contact?.assignable ?? true);
    setNotifiable(contact?.notifiable ?? true);
    setActive((contact?.availabilityStatus ?? 'ACTIVE') !== 'INACTIVE');
  }, [contact, visible]);

  const canSave = displayName.trim() && roleLabel.trim() && departmentCode.trim() && email.trim() && !saving;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>{spanish ? 'Directorio operativo' : 'Operational Directory'}</Text>
              <Text style={styles.title}>{contact ? (spanish ? 'Editar contacto' : 'Edit Contact') : (spanish ? 'Nuevo contacto' : 'New Contact')}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.row}>
              <View style={styles.field}>
                <InputField label={spanish ? 'Nombre' : 'Name'} value={displayName} onChangeText={setDisplayName} inputContainerStyle={styles.inputContainer} />
              </View>
              <View style={styles.field}>
                <InputField label={spanish ? 'Cargo' : 'Role'} value={roleLabel} onChangeText={setRoleLabel} inputContainerStyle={styles.inputContainer} />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>{spanish ? 'Departamento' : 'Department'}</Text>
                <View style={styles.departmentList}>
                  {departments.map((department) => {
                    const active = departmentCode === department.departmentCode;
                    return (
                      <TouchableOpacity
                        key={department.id}
                        style={[styles.departmentOption, active && styles.departmentOptionActive]}
                        onPress={() => setDepartmentCode(department.departmentCode)}
                        activeOpacity={0.75}
                      >
                        <Text style={[styles.departmentName, active && styles.departmentNameActive]}>{department.departmentName}</Text>
                        <Text style={styles.departmentCode}>{department.departmentCode}</Text>
                      </TouchableOpacity>
                    );
                  })}
                  {departments.length === 0 ? (
                    <Text style={styles.emptyText}>{spanish ? 'No hay departamentos registrados.' : 'No departments registered.'}</Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.field}>
                <InputField label="Email" value={email} onChangeText={setEmail} inputContainerStyle={styles.inputContainer} />
              </View>
            </View>
            <View style={styles.toggleGrid}>
              <SelectableChip
                label={spanish ? 'Puede recibir tareas' : 'Assignable'}
                selected={assignable}
                icon={<Feather name={assignable ? 'check-circle' : 'circle'} size={15} color={assignable ? AppColors.brand.action : AppColors.text.muted} />}
                onPress={() => setAssignable((value) => !value)}
              />
              <SelectableChip
                label={spanish ? 'Puede recibir avisos' : 'Notifiable'}
                selected={notifiable}
                icon={<Feather name={notifiable ? 'check-circle' : 'circle'} size={15} color={notifiable ? AppColors.brand.action : AppColors.text.muted} />}
                onPress={() => setNotifiable((value) => !value)}
              />
              <SelectableChip
                label={spanish ? 'Activo' : 'Active'}
                selected={active}
                icon={<Feather name={active ? 'check-circle' : 'circle'} size={15} color={active ? AppColors.brand.action : AppColors.text.muted} />}
                onPress={() => setActive((value) => !value)}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button label={spanish ? 'Cancelar' : 'Cancel'} variant="secondary" size="md" style={styles.footerButton} onPress={onClose} />
            <Button
              label={saving ? (spanish ? 'Guardando...' : 'Saving...') : (spanish ? 'Guardar contacto' : 'Save Contact')}
              variant="primary"
              size="md"
              disabled={!canSave}
              style={[styles.footerButton, styles.primaryButton]}
              onPress={() => onSave({
                displayName: displayName.trim(),
                roleLabel: roleLabel.trim(),
                departmentCode: departmentCode.trim(),
                email: email.trim(),
                assignable,
                notifiable,
                availabilityStatus: active ? 'ACTIVE' : 'INACTIVE',
              })}
            />
          </View>
        </CardBase>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: AppColors.modal.backdrop },
  dialog: { width: '100%', maxWidth: 720, maxHeight: '90%', borderRadius: 24, padding: 0, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 18, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: AppColors.border.soft },
  eyebrow: { fontSize: 12, lineHeight: 16, fontWeight: '800', color: AppColors.brand.action, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '900', color: AppColors.text.primary },
  closeButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: AppColors.border.default },
  content: { padding: 24, gap: 16 },
  row: { flexDirection: 'row', gap: 16 },
  field: { flex: 1 },
  fieldLabel: { fontSize: 12, lineHeight: 16, fontWeight: '800', color: AppColors.text.muted, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8 },
  inputContainer: { height: 50, borderRadius: 12 },
  departmentList: { gap: 8 },
  departmentOption: { minHeight: 48, borderWidth: 1, borderColor: AppColors.border.default, backgroundColor: AppColors.surface.card, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9 },
  departmentOptionActive: { borderColor: AppColors.border.brandMuted, backgroundColor: AppColors.selection.activeWash },
  departmentName: { fontSize: 13, lineHeight: 17, fontWeight: '800', color: AppColors.text.primary },
  departmentNameActive: { color: AppColors.brand.action },
  departmentCode: { marginTop: 2, fontSize: 11, lineHeight: 15, color: AppColors.text.soft, fontWeight: '700' },
  emptyText: { fontSize: 13, lineHeight: 18, color: AppColors.text.soft },
  toggleGrid: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, paddingHorizontal: 24, paddingTop: 18, paddingBottom: 24, borderTopWidth: 1, borderTopColor: AppColors.border.soft },
  footerButton: { minWidth: 150 },
  primaryButton: { backgroundColor: AppColors.brand.action, borderColor: AppColors.brand.action },
});

export default OperationalContactEditorOverlay;
