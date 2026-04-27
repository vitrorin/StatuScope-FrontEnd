import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/foundation/Button';
import { CardBase } from '@/components/patterns/CardBase';
import { RecommendationFeedItem } from '@/components/views/admin/recommendations/Sub-funcionalidades/types';

interface RecommendationDismissOverlayProps {
  visible: boolean;
  item: RecommendationFeedItem | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function RecommendationDismissOverlay({ visible, item, onClose, onConfirm }: RecommendationDismissOverlayProps) {
  if (!item) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <Text style={styles.title}>Dismiss Recommendation?</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>
          <Text style={styles.body}>
            This will move <Text style={styles.bodyStrong}>{item.title}</Text> out of the active operational queue and mark it as dismissed.
          </Text>
          <View style={styles.footer}>
            <Button label="Cancel" variant="secondary" size="md" style={styles.footerButton} onPress={onClose} />
            <Button label="Dismiss" variant="danger" size="md" style={styles.footerButton} onPress={onConfirm} />
          </View>
        </CardBase>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.74)' },
  dialog: { width: '100%', maxWidth: 520, borderRadius: 24, padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 },
  title: { flex: 1, fontSize: 22, lineHeight: 28, fontWeight: '900', color: '#0F172A' },
  closeButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  body: { fontSize: 14, lineHeight: 22, color: '#526174' },
  bodyStrong: { fontWeight: '800', color: '#0F172A' },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 22 },
  footerButton: { minWidth: 140 },
});

export default RecommendationDismissOverlay;
