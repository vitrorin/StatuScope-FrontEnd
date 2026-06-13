import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CardBase } from '@/components/patterns/CardBase';
import { useTranslation } from '@/i18n';
import { isSpanish } from '@/components/views/admin/localization';
import { AppColors } from '@/constants/theme';

interface EpidemiologicalReportOverlayProps {
  visible: boolean;
  onClose: () => void;
}

export function EpidemiologicalReportOverlay({ visible, onClose }: EpidemiologicalReportOverlayProps) {
  const { language } = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>{isSpanish(language) ? 'Vista previa del reporte' : 'Report Preview'}</Text>
              <Text style={styles.title}>{isSpanish(language) ? 'Resumen epidemiologico' : 'Epidemiological Summary'}</Text>
              <Text style={styles.subtitle}>
                {isSpanish(language)
                  ? 'Resumen regional de carga respiratoria y hospitalaria para los ultimos 7 dias.'
                  : 'Regional respiratory and hospital load overview for the last 7 days.'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.sections}>
            <CardBase style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{isSpanish(language) ? 'Senal principal' : 'Top Signal'}</Text>
              <Text style={styles.sectionText}>
                {isSpanish(language)
                  ? 'La enfermedad tipo influenza sigue siendo la principal fuente de presion en los distritos monitoreados.'
                  : 'Influenza-like illness continues to be the leading pressure source across monitored districts.'}
              </Text>
            </CardBase>
            <CardBase style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{isSpanish(language) ? 'Impacto hospitalario' : 'Hospital Impact'}</Text>
              <Text style={styles.sectionText}>
                {isSpanish(language)
                  ? 'La capacidad de UCI y respuesta de emergencia requiere monitoreo cercano durante las proximas 24 horas.'
                  : 'ICU and emergency response capacity require close monitoring over the next 24 hours.'}
              </Text>
            </CardBase>
            <CardBase style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{isSpanish(language) ? 'Recomendacion operativa' : 'Operational Recommendation'}</Text>
              <Text style={styles.sectionText}>
                {isSpanish(language)
                  ? 'Prioriza el personal respiratorio y mantén la capacidad de desborde en las areas de mayor presion.'
                  : 'Prioritize respiratory staffing and maintain overflow readiness in high-pressure wards.'}
              </Text>
            </CardBase>
          </View>
        </CardBase>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: AppColors.modal.backdrop },
  dialog: { width: '100%', maxWidth: 700, borderRadius: 24, padding: 0, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 18, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: AppColors.border.soft },
  eyebrow: { fontSize: 12, lineHeight: 16, fontWeight: '800', color: AppColors.brand.action, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '900', color: AppColors.text.primary },
  subtitle: { marginTop: 8, fontSize: 14, lineHeight: 22, color: AppColors.text.soft },
  closeButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: AppColors.border.default },
  sections: { padding: 24, gap: 14 },
  sectionCard: { borderRadius: 18, padding: 16 },
  sectionTitle: { fontSize: 14, lineHeight: 18, fontWeight: '800', color: AppColors.brand.action, marginBottom: 8 },
  sectionText: { fontSize: 14, lineHeight: 22, color: AppColors.text.body },
});

export default EpidemiologicalReportOverlay;
