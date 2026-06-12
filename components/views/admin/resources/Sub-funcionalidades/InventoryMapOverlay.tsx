import React, { useMemo } from 'react';
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
import { EmptyState } from '@/components/feedback/EmptyState';
import { CardBase } from '@/components/patterns/CardBase';
import { InventoryResourceItem } from '@/components/views/admin/resources/Sub-funcionalidades/types';
import { useTranslation } from '@/i18n';
import { isSpanish } from '@/components/views/admin/localization';
import { AppColors } from '@/constants/theme';

interface InventoryMapOverlayProps {
  visible: boolean;
  inventory: InventoryResourceItem[];
  onClose: () => void;
}

export function InventoryMapOverlay({ visible, inventory, onClose }: InventoryMapOverlayProps) {
  const { language } = useTranslation();

  const locations = useMemo(() => {
    const grouped = new Map<string, InventoryResourceItem[]>();
    for (const item of inventory) {
      const key = item.location || (isSpanish(language) ? 'Sin ubicación asignada' : 'Unassigned Location');
      const bucket = grouped.get(key) ?? [];
      bucket.push(item);
      grouped.set(key, bucket);
    }
    return Array.from(grouped.entries());
  }, [inventory, language]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>{isSpanish(language) ? 'Ubicaciones de inventario' : 'Inventory Locations'}</Text>
              <Text style={styles.title}>{isSpanish(language) ? 'Ubicaciones de inventario' : 'Inventory Locations'}</Text>
              <Text style={styles.subtitle}>{isSpanish(language) ? 'Agrupados directamente desde las ubicaciones de artículos respaldadas por la base de datos.' : 'Grouped directly from database-backed item locations instead of a static diagram.'}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {locations.length === 0 ? (
              <EmptyState
                style={styles.emptyCard}
                title={isSpanish(language) ? 'No hay ubicaciones de inventario disponibles' : 'No inventory locations available'}
                message={isSpanish(language) ? 'Agrega un artículo de inventario con ubicación para verlo agrupado aquí.' : 'Add an inventory item with a location to see it grouped here.'}
              />
            ) : null}

            {locations.map(([location, items]) => (
              <CardBase key={location} style={styles.locationCard}>
                <View style={styles.locationHeader}>
                  <View style={styles.locationTitleRow}>
                    <MaterialCommunityIcons name="map-marker-radius-outline" size={16} color={AppColors.brand.action} />
                    <Text style={styles.locationTitle}>{location}</Text>
                  </View>
                  <Text style={styles.locationCount}>{isSpanish(language) ? `${items.length} artículo(s)` : `${items.length} item(s)`}</Text>
                </View>

                <View style={styles.itemList}>
                  {items.map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.title}</Text>
                        <Text style={styles.itemMeta}>{item.category} | {item.itemCode}</Text>
                      </View>
                      <View style={styles.itemValueWrap}>
                        <Text style={[styles.itemValue, item.tone === 'critical' && styles.itemValueCritical]}>
                          {item.valueText}
                        </Text>
                        <Text style={styles.itemMeta}>{isSpanish(language) ? `Objetivo ${item.targetLevel}` : `Target ${item.targetLevel}`}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </CardBase>
            ))}
          </ScrollView>
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
    maxWidth: 920,
    maxHeight: '88%',
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
    fontSize: 24,
    lineHeight: 30,
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
    gap: 14,
  },
  emptyCard: {
    borderRadius: 16,
    padding: 18,
    backgroundColor: AppColors.surface.raised,
    borderColor: AppColors.border.brandSoft,
  },
  locationCard: {
    borderRadius: 18,
    padding: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: AppColors.text.primary,
  },
  locationCount: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: AppColors.text.soft,
  },
  itemList: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: AppColors.border.soft,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: AppColors.text.primary,
  },
  itemMeta: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: AppColors.text.soft,
  },
  itemValueWrap: {
    alignItems: 'flex-end',
  },
  itemValue: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: AppColors.brand.action,
  },
  itemValueCritical: {
    color: AppColors.status.dangerAccent,
  },
});

export default InventoryMapOverlay;
