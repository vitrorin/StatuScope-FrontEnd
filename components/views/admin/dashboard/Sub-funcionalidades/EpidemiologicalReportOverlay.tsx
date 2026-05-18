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
              <Text style={styles.title}>Epidemiological Summary</Text>
              <Text style={styles.subtitle}>Regional respiratory and hospital load overview for the last 7 days.</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.sections}>
            <CardBase style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Top Signal</Text>
              <Text style={styles.sectionText}>Influenza-like illness continues to be the leading pressure source across monitored districts.</Text>
            </CardBase>
            <CardBase style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Hospital Impact</Text>
              <Text style={styles.sectionText}>ICU and emergency response capacity require close monitoring over the next 24 hours.</Text>
            </CardBase>
            <CardBase style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Operational Recommendation</Text>
              <Text style={styles.sectionText}>Prioritize respiratory staffing and maintain overflow readiness in high-pressure wards.</Text>
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
