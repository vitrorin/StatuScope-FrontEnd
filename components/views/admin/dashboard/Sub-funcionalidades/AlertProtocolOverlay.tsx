import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/foundation/Button';
import { CardBase } from '@/components/patterns/CardBase';
import { useTranslation } from '@/i18n';
import { isSpanish } from '@/components/views/admin/localization';
import { AppColors } from '@/constants/theme';

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
  const { language } = useTranslation();
  const localizedSteps = isSpanish(language)
    ? [
        'Revisa los clusters de riesgo actuales y valida los departamentos afectados.',
        'Notifica al responsable de operaciones hospitalarias y a la mesa de coordinacion de emergencias.',
        'Prepara la capacidad de desborde y aísla los recursos de respuesta de mayor prioridad.',
        'Da seguimiento a la preparacion del hospital cada 30 minutos hasta que la alerta baje de nivel.',
      ]
    : steps;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>{isSpanish(language) ? 'Protocolo de alerta' : 'Alert Protocol'}</Text>
              <Text style={styles.title}>{isSpanish(language) ? 'Protocolo de respuesta de emergencia' : 'Emergency Response Protocol'}</Text>
              <Text style={styles.subtitle}>
                {isSpanish(language)
                  ? 'Secuencia operativa a seguir cuando se acelera la presion por enfermedad o el riesgo de capacidad.'
                  : 'Operational sequence to follow when disease pressure or capacity risk accelerates.'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.stepsList}>
            {localizedSteps.map((step, index) => (
              <View key={step} style={styles.stepRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            <Button label={isSpanish(language) ? 'Cerrar' : 'Close'} variant="secondary" size="md" style={styles.footerButton} onPress={onClose} />
          </View>
        </CardBase>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: AppColors.modal.backdrop },
  dialog: { width: '100%', maxWidth: 680, borderRadius: 24, padding: 0, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 18, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: AppColors.border.soft },
  eyebrow: { fontSize: 12, lineHeight: 16, fontWeight: '800', color: AppColors.brand.action, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '900', color: AppColors.text.primary },
  subtitle: { marginTop: 8, fontSize: 14, lineHeight: 22, color: AppColors.text.soft },
  closeButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: AppColors.border.default },
  stepsList: { padding: 24, gap: 14 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepBadge: { width: 28, height: 28, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.surface.brandSoft },
  stepBadgeText: { fontSize: 13, lineHeight: 16, fontWeight: '800', color: AppColors.brand.action },
  stepText: { flex: 1, fontSize: 14, lineHeight: 22, color: AppColors.text.body },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 24, paddingTop: 18, paddingBottom: 24, borderTopWidth: 1, borderTopColor: AppColors.border.soft },
  footerButton: { minWidth: 120 },
});

export default AlertProtocolOverlay;
