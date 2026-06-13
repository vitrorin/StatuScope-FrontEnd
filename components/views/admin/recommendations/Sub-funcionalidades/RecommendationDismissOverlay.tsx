import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/foundation/Button';
import { CardBase } from '@/components/patterns/CardBase';
import { RecommendationFeedItem } from '@/components/views/admin/recommendations/Sub-funcionalidades/types';
import { useTranslation } from '@/i18n';
import { isSpanish } from '@/components/views/admin/localization';
import { AppColors } from '@/constants/theme';

interface RecommendationDismissOverlayProps {
  visible: boolean;
  item: RecommendationFeedItem | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function RecommendationDismissOverlay({ visible, item, onClose, onConfirm }: RecommendationDismissOverlayProps) {
  const { language } = useTranslation();
  const spanish = isSpanish(language);
  if (!item) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <Text style={styles.title}>{spanish ? 'Descartar recomendacion?' : 'Dismiss Recommendation?'}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.body}>
            {spanish ? 'Esto movera ' : 'This will move '}
            <Text style={styles.bodyStrong}>{item.title}</Text>
            {spanish
              ? ' fuera de la cola operativa activa y la marcara como descartada.'
              : ' out of the active operational queue and mark it as dismissed.'}
          </Text>
          <View style={styles.footer}>
            <Button label={spanish ? 'Cancelar' : 'Cancel'} variant="secondary" size="md" style={styles.footerButton} onPress={onClose} />
            <Button label={spanish ? 'Descartar' : 'Dismiss'} variant="danger" size="md" style={styles.footerButton} onPress={onConfirm} />
          </View>
        </CardBase>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: AppColors.modal.backdrop },
  dialog: { width: '100%', maxWidth: 520, borderRadius: 24, padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 },
  title: { flex: 1, fontSize: 22, lineHeight: 28, fontWeight: '900', color: AppColors.text.primary },
  closeButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: AppColors.border.default },
  body: { fontSize: 14, lineHeight: 22, color: AppColors.text.body },
  bodyStrong: { fontWeight: '800', color: AppColors.text.primary },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 22 },
  footerButton: { minWidth: 140 },
});

export default RecommendationDismissOverlay;
