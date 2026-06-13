import React, { useEffect, useMemo, useState } from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
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
import { InfoTile } from '@/components/overlays/InfoTile';
import { CardBase } from '@/components/patterns/CardBase';
import { HospitalInventoryMovementResponse } from '@/lib/adminOperational';
import { InventoryResourceItem } from '@/components/views/admin/resources/Sub-funcionalidades/types';
import { useTranslation } from '@/i18n';
import { isSpanish } from '@/components/views/admin/localization';
import { AppColors } from '@/constants/theme';

interface SupplyRequestDraft {
  quantity: string;
  destination: string;
  suggestedSupplier: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requestedNeededBy: string;
}

interface SupplyRequestOverlayProps {
  visible: boolean;
  inventoryItem: InventoryResourceItem | null;
  movements: HospitalInventoryMovementResponse[];
  loadingMovements?: boolean;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (draft: SupplyRequestDraft) => void;
}

export function SupplyRequestOverlay({
  visible,
  inventoryItem,
  movements,
  loadingMovements = false,
  saving = false,
  onClose,
  onSubmit,
}: SupplyRequestOverlayProps) {
  const { language } = useTranslation();
  const es = isSpanish(language);
  const suggestedQuantity = useMemo(() => {
    if (!inventoryItem) return '0';
    const current = parseInteger(inventoryItem.currentQuantity);
    const target = parseInteger(inventoryItem.targetQuantity);
    return String(Math.max(target - current, 1));
  }, [inventoryItem]);
  const [draft, setDraft] = useState<SupplyRequestDraft>({
    quantity: suggestedQuantity,
    destination: '',
    suggestedSupplier: '',
    priority: 'HIGH',
    requestedNeededBy: '',
  });

  useEffect(() => {
    if (!visible || !inventoryItem) return;
    setDraft({
      quantity: suggestedQuantity,
      destination: inventoryItem.location,
      suggestedSupplier: '',
      priority: inventoryItem.tone === 'critical' ? 'CRITICAL' : 'HIGH',
      requestedNeededBy: '',
    });
  }, [inventoryItem, suggestedQuantity, visible]);

  const updateField = (key: keyof SupplyRequestDraft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  if (!inventoryItem) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>{es ? 'Solicitud de insumos' : 'Supply Request'}</Text>
              <Text style={styles.title}>{inventoryItem.title}</Text>
              <Text style={styles.subtitle}>
                {es
                  ? 'Crea una solicitud real y registra evidencia en el historial de inventario.'
                  : 'Create a real request and record evidence in the inventory history.'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.summaryGrid}>
              <InfoTile style={styles.infoTile} label={es ? 'Existencia actual' : 'Current stock'} value={inventoryItem.valueText} />
              <InfoTile style={styles.infoTile} label={es ? 'Objetivo' : 'Target'} value={inventoryItem.targetLevel} />
              <InfoTile style={styles.infoTile} label={es ? 'Ubicación' : 'Location'} value={inventoryItem.location || (es ? 'Sin ubicación' : 'Unassigned')} />
            </View>

            <View style={styles.row}>
              <View style={styles.field}>
                <InputField
                  label={es ? 'Cantidad solicitada' : 'Requested Quantity'}
                  type="number"
                  value={draft.quantity}
                  onChangeText={(text) => updateField('quantity', text.replace(/[^0-9]/g, ''))}
                  inputContainerStyle={styles.inputContainer}
                />
              </View>
              <View style={styles.field}>
                <InputField
                  label={es ? 'Destino' : 'Destination'}
                  value={draft.destination}
                  onChangeText={(text) => updateField('destination', text)}
                  inputContainerStyle={styles.inputContainer}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.field}>
                <InputField
                  label={es ? 'Proveedor sugerido' : 'Suggested Supplier'}
                  value={draft.suggestedSupplier}
                  onChangeText={(text) => updateField('suggestedSupplier', text)}
                  inputContainerStyle={styles.inputContainer}
                />
              </View>
              <View style={styles.field}>
                <InputField
                  label={es ? 'Fecha límite opcional' : 'Optional Deadline'}
                  value={draft.requestedNeededBy}
                  placeholder="YYYY-MM-DDTHH:mm:ss"
                  onChangeText={(text) => updateField('requestedNeededBy', text)}
                  inputContainerStyle={styles.inputContainer}
                />
              </View>
            </View>

            <View style={styles.priorityBlock}>
              <Text style={styles.sectionTitle}>{es ? 'Prioridad' : 'Priority'}</Text>
              <View style={styles.priorityRow}>
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((priority) => {
                  const active = draft.priority === priority;
                  return (
                    <TouchableOpacity
                      key={priority}
                      style={[styles.priorityChip, active && styles.priorityChipActive]}
                      activeOpacity={0.75}
                      onPress={() => setDraft((current) => ({ ...current, priority }))}
                    >
                      <Text style={[styles.priorityText, active && styles.priorityTextActive]}>
                        {localizePriority(priority, es)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.historyBlock}>
              <Text style={styles.sectionTitle}>{es ? 'Historial reciente' : 'Recent History'}</Text>
              {loadingMovements ? (
                <Text style={styles.historyMuted}>{es ? 'Cargando movimientos...' : 'Loading movements...'}</Text>
              ) : movements.length === 0 ? (
                <Text style={styles.historyMuted}>{es ? 'Sin movimientos registrados.' : 'No movements recorded.'}</Text>
              ) : movements.slice(0, 4).map((movement) => (
                <View key={movement.id} style={styles.historyRow}>
                  <MaterialCommunityIcons name="history" size={16} color={AppColors.text.secondary} />
                  <View style={styles.historyCopy}>
                    <Text style={styles.historyTitle}>
                      {movement.movementType} {movement.quantityDelta > 0 ? '+' : ''}{movement.quantityDelta} {movement.unit ?? inventoryItem.unit}
                    </Text>
                    <Text style={styles.historyMeta}>{movement.notes ?? formatDate(movement.createdAt)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button label={es ? 'Cancelar' : 'Cancel'} variant="secondary" size="md" style={styles.footerButton} onPress={onClose} />
            <Button
              label={saving ? (es ? 'Creando...' : 'Creating...') : (es ? 'Crear solicitud' : 'Create Request')}
              variant="primary"
              size="md"
              style={styles.footerButton}
              onPress={() => onSubmit(draft)}
            />
          </View>
        </CardBase>
      </View>
    </Modal>
  );
}

function localizePriority(priority: SupplyRequestDraft['priority'], es: boolean) {
  if (!es) return priority[0] + priority.slice(1).toLowerCase();
  const map = { LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta', CRITICAL: 'Crítica' };
  return map[priority];
}

function parseInteger(value: string) {
  const parsed = Number.parseInt(value || '0', 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
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
    backgroundColor: AppColors.modal.backdropStrong,
  },
  dialog: {
    width: '100%',
    maxWidth: 860,
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
  headerCopy: {
    flex: 1,
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
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    color: AppColors.text.primary,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: AppColors.text.secondary,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.border.default,
    backgroundColor: AppColors.surface.card,
  },
  content: {
    padding: 24,
    gap: 18,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  infoTile: {
    flex: 1,
    borderWidth: 1,
    borderColor: AppColors.modal.border,
    borderRadius: 14,
    padding: 14,
    backgroundColor: AppColors.surface.subtle,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
  },
  field: {
    flex: 1,
  },
  inputContainer: {
    minHeight: 46,
  },
  priorityBlock: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
    color: AppColors.text.primary,
  },
  priorityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityChip: {
    borderWidth: 1,
    borderColor: AppColors.modal.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: AppColors.surface.card,
  },
  priorityChipActive: {
    borderColor: AppColors.brand.action,
    backgroundColor: AppColors.surface.brandSoft,
  },
  priorityText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: AppColors.text.secondary,
  },
  priorityTextActive: {
    color: AppColors.brand.primary,
  },
  historyBlock: {
    gap: 10,
  },
  historyMuted: {
    fontSize: 13,
    lineHeight: 20,
    color: AppColors.text.secondary,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderColor: AppColors.border.default,
    borderRadius: 12,
    padding: 12,
    backgroundColor: AppColors.surface.card,
  },
  historyCopy: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: AppColors.text.primary,
  },
  historyMeta: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 18,
    color: AppColors.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: AppColors.border.soft,
  },
  footerButton: {
    minWidth: 150,
  },
});

export default SupplyRequestOverlay;
