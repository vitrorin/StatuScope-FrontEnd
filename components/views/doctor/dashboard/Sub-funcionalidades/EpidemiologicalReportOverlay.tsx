import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CardBase } from '@/components/patterns/CardBase';

interface EpidemiologicalReportOverlayProps {
  visible: boolean;
  onClose: () => void;
}

export function EpidemiologicalReportOverlay({ visible, onClose }: EpidemiologicalReportOverlayProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Report Preview</Text>
              <Text style={styles.title}>Disease Breakdown Summary</Text>
              <Text style={styles.subtitle}>Regional burden and clinical trend overview for the active diseases currently tracked.</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.sections}>
            <CardBase style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Top Signal</Text>
              <Text style={styles.sectionText}>Influenza remains the most dominant pressure source and continues leading the weekly case volume.</Text>
            </CardBase>
            <CardBase style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Area Watch</Text>
              <Text style={styles.sectionText}>Pediatric-adjacent zones and COVID-like illness clusters should stay under active observation this cycle.</Text>
            </CardBase>
            <CardBase style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Clinical Recommendation</Text>
              <Text style={styles.sectionText}>Sustain respiratory triage readiness and keep high-risk fever presentations under rapid escalation review.</Text>
            </CardBase>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 18, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
  eyebrow: { fontSize: 12, lineHeight: 16, fontWeight: '800', color: '#1718C7', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '900', color: '#0F172A' },
  subtitle: { marginTop: 8, fontSize: 14, lineHeight: 22, color: '#70839B' },
  closeButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  sections: { padding: 24, gap: 14 },
  sectionCard: { borderRadius: 18, padding: 16 },
  sectionTitle: { fontSize: 14, lineHeight: 18, fontWeight: '800', color: '#1718C7', marginBottom: 8 },
  sectionText: { fontSize: 14, lineHeight: 22, color: '#526174' },
});

export default EpidemiologicalReportOverlay;
