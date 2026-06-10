import React, { useEffect, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '@/components/foundation/Button';
import { InputField } from '@/components/inputs/InputField';
import { CardBase } from '@/components/patterns/CardBase';
import { InventoryResourceItem } from '@/components/views/admin/resources/Sub-funcionalidades/types';
import { useTranslation } from '@/i18n';
import { isSpanish } from '@/components/views/admin/localization';
import { AppColors } from '@/constants/theme';

interface InventoryActionOverlayProps {
  visible: boolean;
  inventoryItem: InventoryResourceItem | null;
  mode: 'create' | 'edit';
  saving?: boolean;
  deleting?: boolean;
  onClose: () => void;
  onSave: (item: InventoryResourceItem) => void;
  onDelete?: (item: InventoryResourceItem) => void;
}

const EMPTY_ITEM: InventoryResourceItem = {
  id: '',
  itemCode: '',
  title: '',
  category: '',
  currentQuantity: '0',
  capacityQuantity: '0',
  unit: '',
  criticalThreshold: '0',
  targetQuantity: '0',
  status: 'ADEQUATE',
  valueText: '',
  progress: 0,
  tone: 'normal',
  actionLabel: 'Manage Supply',
  actionType: 'manage',
  location: '',
  targetLevel: '',
};

export function InventoryActionOverlay({
  visible,
  inventoryItem,
  mode,
  saving = false,
  deleting = false,
  onClose,
  onSave,
  onDelete,
}: InventoryActionOverlayProps) {
  const { language } = useTranslation();
  const [draft, setDraft] = useState<InventoryResourceItem>(inventoryItem ?? EMPTY_ITEM);

  useEffect(() => {
    if (visible) {
      setDraft(inventoryItem ?? EMPTY_ITEM);
    }
  }, [inventoryItem, visible]);

  const updateField = (key: keyof InventoryResourceItem, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const isCreate = mode === 'create';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>{isSpanish(language) ? 'Artículo de inventario' : 'Inventory Item'}</Text>
              <Text style={styles.title}>{isCreate ? (isSpanish(language) ? 'Agregar artículo de inventario' : 'Add Inventory Item') : draft.title || (isSpanish(language) ? 'Artículo de inventario' : 'Inventory Item')}</Text>
              <Text style={styles.subtitle}>{isSpanish(language) ? 'Gestiona el registro de inventario para existencias, capacidad, umbrales y ubicación.' : 'Manage the real inventory record for stock, capacity, thresholds, and location.'}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.row}>
              <View style={styles.field}>
                <InputField
                  label={isSpanish(language) ? 'Nombre del artículo' : 'Item Name'}
                  value={draft.title}
                  onChangeText={(text) => updateField('title', text)}
                  inputContainerStyle={styles.inputContainer}
                />
              </View>
              <View style={styles.field}>
                <InputField
                  label={isSpanish(language) ? 'Código del artículo' : 'Item Code'}
                  value={draft.itemCode}
                  onChangeText={(text) => updateField('itemCode', text.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
                  inputContainerStyle={styles.inputContainer}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.field}>
                <InputField
                  label={isSpanish(language) ? 'Categoría' : 'Category'}
                  value={draft.category}
                  onChangeText={(text) => updateField('category', text)}
                  inputContainerStyle={styles.inputContainer}
                />
              </View>
              <View style={styles.field}>
                <InputField
                  label={isSpanish(language) ? 'Ubicación' : 'Location'}
                  value={draft.location}
                  onChangeText={(text) => updateField('location', text)}
                  inputContainerStyle={styles.inputContainer}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.field}>
                <InputField
                  label={isSpanish(language) ? 'Cantidad actual' : 'Current Quantity'}
                  type="number"
                  value={draft.currentQuantity}
                  onChangeText={(text) => updateField('currentQuantity', text.replace(/[^0-9]/g, ''))}
                  inputContainerStyle={styles.inputContainer}
                />
              </View>
              <View style={styles.field}>
                <InputField
                  label={isSpanish(language) ? 'Capacidad' : 'Capacity'}
                  type="number"
                  value={draft.capacityQuantity}
                  onChangeText={(text) => updateField('capacityQuantity', text.replace(/[^0-9]/g, ''))}
                  inputContainerStyle={styles.inputContainer}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.field}>
                <InputField
                  label={isSpanish(language) ? 'Umbral crítico' : 'Critical Threshold'}
                  type="number"
                  value={draft.criticalThreshold}
                  onChangeText={(text) => updateField('criticalThreshold', text.replace(/[^0-9]/g, ''))}
                  inputContainerStyle={styles.inputContainer}
                />
              </View>
              <View style={styles.field}>
                <InputField
                  label={isSpanish(language) ? 'Cantidad objetivo' : 'Target Quantity'}
                  type="number"
                  value={draft.targetQuantity}
                  onChangeText={(text) => updateField('targetQuantity', text.replace(/[^0-9]/g, ''))}
                  inputContainerStyle={styles.inputContainer}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.field}>
                <InputField
                  label={isSpanish(language) ? 'Unidad' : 'Unit'}
                  value={draft.unit}
                  onChangeText={(text) => updateField('unit', text)}
                  inputContainerStyle={styles.inputContainer}
                />
              </View>
              <View style={styles.field}>
                <InputField
                  label={isSpanish(language) ? 'Estado' : 'Status'}
                  value={draft.status}
                  onChangeText={(text) => updateField('status', text.toUpperCase().replace(/[^A-Z_]/g, '_'))}
                  inputContainerStyle={styles.inputContainer}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {!isCreate && onDelete ? (
              <Button
                label={deleting ? (isSpanish(language) ? 'Eliminando...' : 'Deleting...') : (isSpanish(language) ? 'Eliminar' : 'Delete')}
                variant="danger"
                size="md"
                style={styles.deleteButton}
                disabled={saving || deleting}
                onPress={() => onDelete(draft)}
              />
            ) : null}
            <Button label={isSpanish(language) ? 'Cancelar' : 'Cancel'} variant="secondary" size="md" style={styles.footerButton} onPress={onClose} />
            <Button
              label={saving ? (isSpanish(language) ? 'Guardando...' : 'Saving...') : isCreate ? (isSpanish(language) ? 'Crear artículo' : 'Create Item') : (isSpanish(language) ? 'Guardar artículo' : 'Save Item')}
              variant="primary"
              size="md"
              style={[styles.footerButton, styles.primaryButton]}
              disabled={saving || deleting || !draft.title.trim() || !draft.itemCode.trim()}
              onPress={() => onSave(draft)}
            />
          </View>
        </CardBase>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: AppColors.modal.backdrop,
  },
  dialog: {
    width: '100%',
    maxWidth: 760,
    maxHeight: '90%',
    borderRadius: 24,
    padding: 0,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 18,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border.soft,
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: AppColors.brand.action,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    color: AppColors.text.primary,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: AppColors.text.soft,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.border.default,
  },
  content: {
    padding: 24,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  field: {
    flex: 1,
  },
  inputContainer: {
    height: 50,
    borderRadius: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: AppColors.border.soft,
  },
  deleteButton: {
    marginRight: 'auto',
    minWidth: 120,
  },
  footerButton: {
    minWidth: 150,
  },
  primaryButton: {
    backgroundColor: AppColors.brand.action,
    borderColor: AppColors.brand.action,
  },
});

export default InventoryActionOverlay;
