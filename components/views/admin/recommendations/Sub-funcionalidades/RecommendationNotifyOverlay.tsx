import React, { useEffect, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/foundation/Button';
import { InputField } from '@/components/inputs/InputField';
import { CardBase } from '@/components/patterns/CardBase';
import { RecommendationFeedItem } from '@/components/views/admin/recommendations/Sub-funcionalidades/types';
import { HospitalDepartmentResourceResponse, OperationalContactResponse } from '@/lib/adminOperational';
import { useTranslation } from '@/i18n';
import { isSpanish } from '@/components/views/admin/localization';
import { AppColors } from '@/constants/theme';

interface RecommendationNotifyOverlayProps {
  visible: boolean;
  item: RecommendationFeedItem | null;
  contacts: OperationalContactResponse[];
  departments: HospitalDepartmentResourceResponse[];
  onClose: () => void;
  onSend: (payload: { audienceType: 'CONTACT' | 'DEPARTMENT'; audienceContactId?: string; audienceDepartmentCode?: string; audience: string; message: string }) => void;
}

export function RecommendationNotifyOverlay({ visible, item, contacts, departments, onClose, onSend }: RecommendationNotifyOverlayProps) {
  const { language } = useTranslation();
  const spanish = isSpanish(language);
  const [audienceType, setAudienceType] = useState<'CONTACT' | 'DEPARTMENT'>('CONTACT');
  const [audienceContactId, setAudienceContactId] = useState('');
  const [audienceDepartmentCode, setAudienceDepartmentCode] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (visible) {
      setAudienceType('CONTACT');
      setAudienceContactId(contacts[0]?.id ?? '');
      setAudienceDepartmentCode(departments[0]?.departmentCode ?? '');
      setMessage(item
        ? (spanish
          ? `Alerta operativa: ${item.title}. Revise la recomendacion actual y prepare su unidad.`
          : `Operational alert: ${item.title}. Please review the current recommendation and prepare your unit.`)
        : '');
    }
  }, [contacts, departments, item, spanish, visible]);

  if (!item) return null;
  const selectedContact = contacts.find((contact) => contact.id === audienceContactId) ?? null;
  const selectedDepartment = departments.find((department) => department.departmentCode === audienceDepartmentCode) ?? null;
  const canSend = audienceType === 'CONTACT' ? Boolean(selectedContact) : Boolean(selectedDepartment);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>{spanish ? 'Notificar personal' : 'Notify Staff'}</Text>
              <Text style={styles.title}>{spanish ? 'Difundir guia operativa' : 'Broadcast Operational Guidance'}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <View>
              <Text style={styles.fieldLabel}>{spanish ? 'Tipo de destinatario' : 'Recipient type'}</Text>
              <View style={styles.segmented}>
                <TouchableOpacity style={[styles.segment, audienceType === 'CONTACT' && styles.segmentActive]} onPress={() => setAudienceType('CONTACT')} activeOpacity={0.75}>
                  <Text style={[styles.segmentText, audienceType === 'CONTACT' && styles.segmentTextActive]}>{spanish ? 'Contacto' : 'Contact'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.segment, audienceType === 'DEPARTMENT' && styles.segmentActive]} onPress={() => setAudienceType('DEPARTMENT')} activeOpacity={0.75}>
                  <Text style={[styles.segmentText, audienceType === 'DEPARTMENT' && styles.segmentTextActive]}>{spanish ? 'Area' : 'Area'}</Text>
                </TouchableOpacity>
              </View>
            </View>
            {audienceType === 'CONTACT' ? (
            <View>
              <Text style={styles.fieldLabel}>{spanish ? 'Destinatario' : 'Recipient'}</Text>
              <View style={styles.contactList}>
                {contacts.length === 0 ? (
                  <Text style={styles.emptyText}>{spanish ? 'No hay contactos notificables activos en el directorio.' : 'No active notifiable contacts are available in the directory.'}</Text>
                ) : contacts.map((contact) => {
                  const active = audienceContactId === contact.id;
                  return (
                    <TouchableOpacity
                      key={contact.id}
                      style={[styles.contactOption, active && styles.contactOptionActive]}
                      onPress={() => setAudienceContactId(contact.id)}
                      activeOpacity={0.76}
                    >
                      <View>
                        <Text style={[styles.contactName, active && styles.contactNameActive]}>{contact.displayName}</Text>
                        <Text style={styles.contactMeta}>{contact.roleLabel} | {contact.contactValue}</Text>
                      </View>
                      {active ? <Feather name="check" size={16} color={AppColors.brand.action} /> : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            ) : (
            <View>
              <Text style={styles.fieldLabel}>{spanish ? 'Area' : 'Area'}</Text>
              <View style={styles.contactList}>
                {departments.length === 0 ? (
                  <Text style={styles.emptyText}>{spanish ? 'No hay departamentos registrados.' : 'No departments registered.'}</Text>
                ) : departments.map((department) => {
                  const active = audienceDepartmentCode === department.departmentCode;
                  return (
                    <TouchableOpacity
                      key={department.id}
                      style={[styles.contactOption, active && styles.contactOptionActive]}
                      onPress={() => setAudienceDepartmentCode(department.departmentCode)}
                      activeOpacity={0.76}
                    >
                      <View>
                        <Text style={[styles.contactName, active && styles.contactNameActive]}>{department.departmentName}</Text>
                        <Text style={styles.contactMeta}>{department.departmentCode}</Text>
                      </View>
                      {active ? <Feather name="check" size={16} color={AppColors.brand.action} /> : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            )}
            <InputField label={spanish ? 'Mensaje' : 'Message'} value={message} onChangeText={setMessage} inputContainerStyle={styles.inputContainer} />
          </View>
          <View style={styles.footer}>
            <Button label={spanish ? 'Cancelar' : 'Cancel'} variant="secondary" size="md" style={styles.footerButton} onPress={onClose} />
            <Button
              label={spanish ? 'Enviar aviso' : 'Send Notice'}
              variant="primary"
              size="md"
              style={[styles.footerButton, styles.primaryButton]}
              disabled={!canSend}
              onPress={() => {
                if (audienceType === 'CONTACT') {
                  if (!selectedContact) return;
                  onSend({ audienceType, audienceContactId: selectedContact.id, audience: selectedContact.displayName, message });
                  return;
                }
                if (!selectedDepartment) return;
                onSend({ audienceType, audienceDepartmentCode: selectedDepartment.departmentCode, audience: selectedDepartment.departmentName, message });
              }}
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
  dialog: { width: '100%', maxWidth: 620, borderRadius: 24, padding: 0, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 18, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: AppColors.border.soft },
  eyebrow: { fontSize: 12, lineHeight: 16, fontWeight: '800', color: AppColors.brand.action, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '900', color: AppColors.text.primary },
  closeButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: AppColors.border.default },
  content: { padding: 24, gap: 16 },
  segmented: { flexDirection: 'row', alignSelf: 'flex-start', borderRadius: 12, borderWidth: 1, borderColor: AppColors.border.default, overflow: 'hidden', backgroundColor: AppColors.surface.subtle, marginBottom: 12 },
  segment: { paddingHorizontal: 14, paddingVertical: 9 },
  segmentActive: { backgroundColor: AppColors.surface.brandSoft },
  segmentText: { fontSize: 13, lineHeight: 18, fontWeight: '800', color: AppColors.text.secondary },
  segmentTextActive: { color: AppColors.brand.action },
  fieldLabel: { fontSize: 12, lineHeight: 16, fontWeight: '800', color: AppColors.text.muted, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8 },
  contactList: { gap: 8 },
  contactOption: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderWidth: 1, borderColor: AppColors.border.default, backgroundColor: AppColors.surface.card, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  contactOptionActive: { borderColor: AppColors.border.brandMuted, backgroundColor: AppColors.selection.activeWash },
  contactName: { fontSize: 14, lineHeight: 18, fontWeight: '800', color: AppColors.text.primary },
  contactNameActive: { color: AppColors.brand.action },
  contactMeta: { marginTop: 2, fontSize: 12, lineHeight: 16, color: AppColors.text.soft },
  emptyText: { fontSize: 13, lineHeight: 20, color: AppColors.text.soft },
  inputContainer: { height: 50, borderRadius: 12 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, paddingHorizontal: 24, paddingTop: 18, paddingBottom: 24, borderTopWidth: 1, borderTopColor: AppColors.border.soft },
  footerButton: { minWidth: 150 },
  primaryButton: { backgroundColor: AppColors.brand.action, borderColor: AppColors.brand.action },
});

export default RecommendationNotifyOverlay;
