import React, { useEffect, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/foundation/Button';
import { InputField } from '@/components/inputs/InputField';
import { CardBase } from '@/components/patterns/CardBase';
import { RecommendationFeedItem } from '@/components/views/admin/recommendations/Sub-funcionalidades/types';
import { useTranslation } from '@/i18n';
import { isSpanish } from '@/components/views/admin/localization';
import { AppColors } from '@/constants/theme';

interface RecommendationSupplyOverlayProps {
  visible: boolean;
  item: RecommendationFeedItem | null;
  onClose: () => void;
  onSubmit: (payload: { supplyType: string; quantity: string; destination: string; supplier: string }) => void;
}

export function RecommendationSupplyOverlay({ visible, item, onClose, onSubmit }: RecommendationSupplyOverlayProps) {
  const { language } = useTranslation();
  const spanish = isSpanish(language);
  const [supplyType, setSupplyType] = useState('Supplementary oxygen');
  const [quantity, setQuantity] = useState('20');
  const [destination, setDestination] = useState('Ward 4');
  const [supplier, setSupplier] = useState('Regional Medical Supply');

  useEffect(() => {
    if (visible) {
      setSupplyType(item?.affectedResources[0] ?? (spanish ? 'Inventario de emergencia' : 'Emergency stock'));
      setQuantity(item?.severity === 'high' ? '30' : '20');
      setDestination(item?.affectedDepartments[0] ?? (spanish ? 'Operaciones' : 'Operations'));
      setSupplier(spanish ? 'Proveedor medico regional' : 'Regional Medical Supply');
    }
  }, [item, spanish, visible]);

  if (!item) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>{spanish ? 'Accion de insumos' : 'Supply Action'}</Text>
              <Text style={styles.title}>{spanish ? 'Preparar recursos' : 'Provision Resources'}</Text>
              <Text style={styles.subtitle}>
                {spanish
                  ? 'Prepara una respuesta de insumos alineada con esta recomendacion.'
                  : 'Prepare a supply response aligned with this recommendation.'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <View style={styles.row}>
              <View style={styles.field}>
                <InputField label={spanish ? 'Tipo de insumo' : 'Supply Type'} value={supplyType} onChangeText={setSupplyType} inputContainerStyle={styles.inputContainer} />
              </View>
              <View style={styles.field}>
                <InputField label={spanish ? 'Cantidad' : 'Quantity'} value={quantity} type="number" onChangeText={(text) => setQuantity(text.replace(/[^0-9]/g, ''))} inputContainerStyle={styles.inputContainer} />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.field}>
                <InputField label={spanish ? 'Destino' : 'Destination'} value={destination} onChangeText={setDestination} inputContainerStyle={styles.inputContainer} />
              </View>
              <View style={styles.field}>
                <InputField label={spanish ? 'Proveedor sugerido' : 'Suggested Supplier'} value={supplier} onChangeText={setSupplier} inputContainerStyle={styles.inputContainer} />
              </View>
            </View>
          </View>
          <View style={styles.footer}>
            <Button label={spanish ? 'Cancelar' : 'Cancel'} variant="secondary" size="md" style={styles.footerButton} onPress={onClose} />
            <Button
              label={spanish ? 'Enviar solicitud' : 'Submit Supply Request'}
              variant="primary"
              size="md"
              style={[styles.footerButton, styles.primaryButton]}
              onPress={() => onSubmit({ supplyType, quantity, destination, supplier })}
            />
          </View>
        </CardBase>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: AppColors.modal.backdrop },
  dialog: { width: '100%', maxWidth: 720, borderRadius: 24, padding: 0, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 18, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: AppColors.border.soft },
  eyebrow: { fontSize: 12, lineHeight: 16, fontWeight: '800', color: AppColors.brand.action, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '900', color: AppColors.text.primary },
  subtitle: { marginTop: 8, fontSize: 14, lineHeight: 22, color: AppColors.text.soft },
  closeButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: AppColors.border.default },
  content: { padding: 24, gap: 16 },
  row: { flexDirection: 'row', gap: 16 },
  field: { flex: 1 },
  inputContainer: { height: 50, borderRadius: 12 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, paddingHorizontal: 24, paddingTop: 18, paddingBottom: 24, borderTopWidth: 1, borderTopColor: AppColors.border.soft },
  footerButton: { minWidth: 150 },
  primaryButton: { backgroundColor: AppColors.brand.action, borderColor: AppColors.brand.action },
});

export default RecommendationSupplyOverlay;
