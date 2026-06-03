import React, { useEffect, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/foundation/Button';
import { InputField } from '@/components/inputs/InputField';
import { CardBase } from '@/components/patterns/CardBase';
import { RecommendationFeedItem } from '@/components/views/admin/recommendations/Sub-funcionalidades/types';
import { OperationalContactResponse } from '@/lib/adminOperational';
import { useTranslation } from '@/i18n';
import { isSpanish } from '@/components/views/admin/localization';

interface RecommendationTaskOverlayProps {
  visible: boolean;
  item: RecommendationFeedItem | null;
  contacts: OperationalContactResponse[];
  onClose: () => void;
  onSave: (payload: { ownerContactId: string; owner: string; area: string; deadline: string; notes: string }) => void;
}

export function RecommendationTaskOverlay({ visible, item, contacts, onClose, onSave }: RecommendationTaskOverlayProps) {
  const { language } = useTranslation();
  const spanish = isSpanish(language);
  const [ownerContactId, setOwnerContactId] = useState('');
  const [area, setArea] = useState('ICU');
  const [deadline, setDeadline] = useState('Today 18:00');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (visible) {
      const firstContact = contacts.find((contact) => contact.id === item?.activeTask?.ownerContactId) ?? contacts[0];
      setOwnerContactId(firstContact?.id ?? '');
      setArea(firstContact?.departmentCode ?? item?.activeTask?.departmentLabel ?? item?.affectedDepartments[0] ?? (spanish ? 'UCI' : 'ICU'));
      setDeadline(spanish ? 'Hoy 18:00' : 'Today 18:00');
      setNotes(item?.activeTask?.notes ?? '');
    }
  }, [contacts, item, spanish, visible]);

  if (!item) return null;
  const selectedContact = contacts.find((contact) => contact.id === ownerContactId) ?? null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>{spanish ? 'Plan de accion' : 'Action Plan'}</Text>
              <Text style={styles.title}>{item.activeTask ? (spanish ? 'Reasignar responsable operativo' : 'Reassign Operational Owner') : (spanish ? 'Asignar responsable operativo' : 'Assign Operational Owner')}</Text>
              <Text style={styles.subtitle}>
                {spanish
                  ? 'Convierte esta recomendacion en una tarea hospitalaria ejecutable.'
                  : 'Turn this recommendation into an executable hospital task.'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.row}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>{spanish ? 'Responsable' : 'Responsible Owner'}</Text>
                <View style={styles.contactList}>
                  {contacts.length === 0 ? (
                    <Text style={styles.emptyText}>{spanish ? 'No hay contactos asignables activos en el directorio.' : 'No active assignable contacts are available in the directory.'}</Text>
                  ) : contacts.map((contact) => {
                    const active = ownerContactId === contact.id;
                    return (
                      <TouchableOpacity
                        key={contact.id}
                        style={[styles.contactOption, active && styles.contactOptionActive]}
                        onPress={() => {
                          setOwnerContactId(contact.id);
                          setArea(contact.departmentCode ?? area);
                        }}
                        activeOpacity={0.76}
                      >
                        <View>
                          <Text style={[styles.contactName, active && styles.contactNameActive]}>{contact.displayName}</Text>
                          <Text style={styles.contactMeta}>{contact.roleLabel} | {contact.contactValue}</Text>
                        </View>
                        {active ? <Feather name="check" size={16} color="#1718C7" /> : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
              <View style={styles.field}>
                <InputField label={spanish ? 'Area / Departamento' : 'Area / Department'} value={area} onChangeText={setArea} inputContainerStyle={styles.inputContainer} />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.field}>
                <InputField label={spanish ? 'Limite' : 'Deadline'} value={deadline} onChangeText={setDeadline} inputContainerStyle={styles.inputContainer} />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>{spanish ? 'Prioridad' : 'Priority'}</Text>
                <View style={styles.priorityReadOnly}>
                  <Text style={styles.priorityValue}>{priorityLabel(item.backendSeverity, spanish)}</Text>
                </View>
              </View>
            </View>
            <InputField
              label={spanish ? 'Notas operativas' : 'Operational Notes'}
              value={notes}
              onChangeText={setNotes}
              inputContainerStyle={styles.inputContainer}
            />
          </ScrollView>

          <View style={styles.footer}>
            <Button label={spanish ? 'Cancelar' : 'Cancel'} variant="secondary" size="md" style={styles.footerButton} onPress={onClose} />
            <Button
              label={spanish ? 'Asignar plan' : 'Assign Plan'}
              variant="primary"
              size="md"
              style={{ ...styles.footerButton, ...styles.primaryButton }}
              disabled={!selectedContact}
              onPress={() => {
                if (!selectedContact) return;
                onSave({ ownerContactId: selectedContact.id, owner: selectedContact.displayName, area, deadline, notes });
              }}
            />
          </View>
        </CardBase>
      </View>
    </Modal>
  );
}

function priorityLabel(value: string, spanish: boolean) {
  const normalized = value.toUpperCase();
  if (normalized === 'CRITICAL') return spanish ? 'Critica' : 'Critical';
  if (normalized === 'HIGH') return spanish ? 'Alta' : 'High';
  if (normalized === 'MEDIUM') return spanish ? 'Media' : 'Medium';
  return spanish ? 'Baja' : 'Low';
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.74)' },
  dialog: { width: '100%', maxWidth: 700, maxHeight: '90%', borderRadius: 24, padding: 0, overflow: 'hidden' },
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
  eyebrow: { fontSize: 12, lineHeight: 16, fontWeight: '800', color: '#1718C7', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '900', color: '#0F172A' },
  subtitle: { marginTop: 8, fontSize: 14, lineHeight: 22, color: '#70839B' },
  closeButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  content: { padding: 24, gap: 16 },
  row: { flexDirection: 'row', gap: 16 },
  field: { flex: 1 },
  fieldLabel: { fontSize: 12, lineHeight: 16, fontWeight: '800', color: '#8A9AAF', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8 },
  inputContainer: { height: 50, borderRadius: 12 },
  priorityReadOnly: { height: 50, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC', justifyContent: 'center', paddingHorizontal: 14 },
  priorityValue: { fontSize: 14, lineHeight: 18, color: '#0F172A', fontWeight: '900' },
  contactList: { gap: 8 },
  contactOption: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  contactOptionActive: { borderColor: '#C9D1FF', backgroundColor: '#F7F8FF' },
  contactName: { fontSize: 14, lineHeight: 18, fontWeight: '800', color: '#0F172A' },
  contactNameActive: { color: '#1718C7' },
  contactMeta: { marginTop: 2, fontSize: 12, lineHeight: 16, color: '#70839B' },
  emptyText: { fontSize: 13, lineHeight: 20, color: '#70839B' },
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
  footerButton: { minWidth: 150 },
  primaryButton: { backgroundColor: '#1718C7', borderColor: '#1718C7' },
});

export default RecommendationTaskOverlay;
