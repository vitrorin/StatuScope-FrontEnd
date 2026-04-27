import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/foundation/Button';
import { CardBase } from '@/components/patterns/CardBase';

interface AlertProtocolOverlayProps {
  visible: boolean;
  onClose: () => void;
}

const steps = [
  'Review current risk clusters and validate the affected departments.',
  'Notify the hospital operations lead and emergency coordination desk.',
  'Prepare surge capacity and isolate high-priority response resources.',
  'Track hospital readiness every 30 minutes until the alert is downgraded.',
];

export function AlertProtocolOverlay({ visible, onClose }: AlertProtocolOverlayProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Alert Protocol</Text>
              <Text style={styles.title}>Emergency Response Protocol</Text>
              <Text style={styles.subtitle}>Operational sequence to follow when disease pressure or capacity risk accelerates.</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.stepsList}>
            {steps.map((step, index) => (
              <View key={step} style={styles.stepRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            <Button label="Close" variant="secondary" size="md" style={styles.footerButton} onPress={onClose} />
          </View>
        </CardBase>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.74)' },
  dialog: { width: '100%', maxWidth: 680, borderRadius: 24, padding: 0, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 18, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
  eyebrow: { fontSize: 12, lineHeight: 16, fontWeight: '800', color: '#1718C7', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '900', color: '#0F172A' },
  subtitle: { marginTop: 8, fontSize: 14, lineHeight: 22, color: '#70839B' },
  closeButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  stepsList: { padding: 24, gap: 14 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepBadge: { width: 28, height: 28, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF1FF' },
  stepBadgeText: { fontSize: 13, lineHeight: 16, fontWeight: '800', color: '#1718C7' },
  stepText: { flex: 1, fontSize: 14, lineHeight: 22, color: '#526174' },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 24, paddingTop: 18, paddingBottom: 24, borderTopWidth: 1, borderTopColor: '#EEF2F7' },
  footerButton: { minWidth: 120 },
});

export default AlertProtocolOverlay;
