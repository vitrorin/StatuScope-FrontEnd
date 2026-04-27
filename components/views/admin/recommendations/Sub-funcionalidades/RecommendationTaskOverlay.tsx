import React, { useEffect, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/foundation/Button';
import { InputField } from '@/components/inputs/InputField';
import { CardBase } from '@/components/patterns/CardBase';
import { RecommendationFeedItem } from '@/components/views/admin/recommendations/Sub-funcionalidades/types';

interface RecommendationTaskOverlayProps {
  visible: boolean;
  item: RecommendationFeedItem | null;
  onClose: () => void;
  onSave: (payload: { owner: string; area: string; deadline: string; priority: string; notes: string }) => void;
}

export function RecommendationTaskOverlay({ visible, item, onClose, onSave }: RecommendationTaskOverlayProps) {
  const [owner, setOwner] = useState('Operations Lead');
  const [area, setArea] = useState('ICU');
  const [deadline, setDeadline] = useState('Today · 18:00');
  const [priority, setPriority] = useState('High');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (visible) {
      setOwner('Operations Lead');
      setArea(item?.affectedDepartments[0] ?? 'ICU');
      setDeadline('Today · 18:00');
      setPriority(item?.severity === 'high' ? 'Critical' : 'High');
      setNotes('');
    }
  }, [item, visible]);

  if (!item) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Action Plan</Text>
              <Text style={styles.title}>Assign Operational Owner</Text>
              <Text style={styles.subtitle}>Turn this recommendation into an executable hospital task.</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.row}>
              <View style={styles.field}>
                <InputField label="Responsible Owner" value={owner} onChangeText={setOwner} inputContainerStyle={styles.inputContainer} />
              </View>
              <View style={styles.field}>
                <InputField label="Area / Department" value={area} onChangeText={setArea} inputContainerStyle={styles.inputContainer} />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.field}>
                <InputField label="Deadline" value={deadline} onChangeText={setDeadline} inputContainerStyle={styles.inputContainer} />
              </View>
              <View style={styles.field}>
                <InputField label="Priority" value={priority} onChangeText={setPriority} inputContainerStyle={styles.inputContainer} />
              </View>
            </View>
            <InputField
              label="Operational Notes"
              value={notes}
              onChangeText={setNotes}
              inputContainerStyle={styles.inputContainer}
            />
          </View>

          <View style={styles.footer}>
            <Button label="Cancel" variant="secondary" size="md" style={styles.footerButton} onPress={onClose} />
            <Button
              label="Assign Plan"
              variant="primary"
              size="md"
              style={{ ...styles.footerButton, ...styles.primaryButton }}
              onPress={() => onSave({ owner, area, deadline, priority, notes })}
            />
          </View>
        </CardBase>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.74)' },
  dialog: { width: '100%', maxWidth: 700, borderRadius: 24, padding: 0, overflow: 'hidden' },
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
  inputContainer: { height: 50, borderRadius: 12 },
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
