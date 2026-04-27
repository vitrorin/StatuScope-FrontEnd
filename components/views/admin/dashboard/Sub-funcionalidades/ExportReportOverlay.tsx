import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/foundation/Button';
import { CardBase } from '@/components/patterns/CardBase';

interface ExportReportOverlayProps {
  visible: boolean;
  onClose: () => void;
}

const reportTypes = ['Executive Summary', 'Hospital Overview', 'Epidemiological Snapshot'];

export function ExportReportOverlay({ visible, onClose }: ExportReportOverlayProps) {
  const [selectedReport, setSelectedReport] = useState(reportTypes[0]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Export Report</Text>
              <Text style={styles.title}>Hospital Dashboard Export</Text>
              <Text style={styles.subtitle}>Choose the type of report to generate from the current dashboard state.</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.options}>
            {reportTypes.map((report) => {
              const active = selectedReport === report;
              return (
                <TouchableOpacity
                  key={report}
                  style={[styles.option, active && styles.optionActive]}
                  onPress={() => setSelectedReport(report)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>{report}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.footer}>
            <Button label="Close" variant="secondary" size="md" style={styles.footerButton} onPress={onClose} />
            <Button label="Generate Export" variant="primary" size="md" style={styles.primaryButton} onPress={onClose} />
          </View>
        </CardBase>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.74)' },
  dialog: { width: '100%', maxWidth: 600, borderRadius: 24, padding: 0, overflow: 'hidden' },
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
  options: { padding: 24, gap: 12 },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F6F8FC',
    borderWidth: 1,
    borderColor: '#E8EDF5',
  },
  optionActive: {
    backgroundColor: '#EEF1FF',
    borderColor: '#C9D1FF',
  },
  optionText: { fontSize: 14, lineHeight: 20, fontWeight: '700', color: '#526174' },
  optionTextActive: { color: '#1718C7' },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, paddingHorizontal: 24, paddingTop: 18, paddingBottom: 24, borderTopWidth: 1, borderTopColor: '#EEF2F7' },
  footerButton: { minWidth: 120 },
  primaryButton: { minWidth: 160, backgroundColor: '#1718C7', borderColor: '#1718C7' },
});

export default ExportReportOverlay;
