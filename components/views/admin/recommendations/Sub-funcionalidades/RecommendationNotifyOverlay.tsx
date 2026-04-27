import React, { useEffect, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/foundation/Button';
import { InputField } from '@/components/inputs/InputField';
import { CardBase } from '@/components/patterns/CardBase';
import { RecommendationFeedItem } from '@/components/views/admin/recommendations/Sub-funcionalidades/types';

interface RecommendationNotifyOverlayProps {
  visible: boolean;
  item: RecommendationFeedItem | null;
  onClose: () => void;
  onSend: (payload: { audience: string; message: string }) => void;
}

export function RecommendationNotifyOverlay({ visible, item, onClose, onSend }: RecommendationNotifyOverlayProps) {
  const [audience, setAudience] = useState('ICU Team');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (visible) {
      setAudience(item?.affectedDepartments[0] ? `${item.affectedDepartments[0]} Team` : 'Clinical Staff');
      setMessage(item ? `Operational alert: ${item.title}. Please review the current recommendation and prepare your unit.` : '');
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
              <Text style={styles.eyebrow}>Notify Staff</Text>
              <Text style={styles.title}>Broadcast Operational Guidance</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <InputField label="Audience" value={audience} onChangeText={setAudience} inputContainerStyle={styles.inputContainer} />
            <InputField label="Message" value={message} onChangeText={setMessage} inputContainerStyle={styles.inputContainer} />
          </View>
          <View style={styles.footer}>
            <Button label="Cancel" variant="secondary" size="md" style={styles.footerButton} onPress={onClose} />
            <Button
              label="Send Notice"
              variant="primary"
              size="md"
              style={{ ...styles.footerButton, ...styles.primaryButton }}
              onPress={() => onSend({ audience, message })}
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
  dialog: { width: '100%', maxWidth: 620, borderRadius: 24, padding: 0, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 18, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
  eyebrow: { fontSize: 12, lineHeight: 16, fontWeight: '800', color: '#1718C7', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '900', color: '#0F172A' },
  closeButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  content: { padding: 24, gap: 16 },
  inputContainer: { height: 50, borderRadius: 12 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, paddingHorizontal: 24, paddingTop: 18, paddingBottom: 24, borderTopWidth: 1, borderTopColor: '#EEF2F7' },
  footerButton: { minWidth: 150 },
  primaryButton: { backgroundColor: '#1718C7', borderColor: '#1718C7' },
});

export default RecommendationNotifyOverlay;
