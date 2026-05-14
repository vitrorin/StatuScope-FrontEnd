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
import { CardBase } from '@/components/patterns/CardBase';
import { InventoryResourceItem } from '@/components/views/admin/resources/Sub-funcionalidades/types';

interface InventoryMapOverlayProps {
  visible: boolean;
  inventory: InventoryResourceItem[];
  onClose: () => void;
}

export function InventoryMapOverlay({ visible, inventory, onClose }: InventoryMapOverlayProps) {
  const locations = useMemo(() => {
    const grouped = new Map<string, InventoryResourceItem[]>();
    for (const item of inventory) {
      const key = item.location || 'Unassigned Location';
      const bucket = grouped.get(key) ?? [];
      bucket.push(item);
      grouped.set(key, bucket);
    }
    return Array.from(grouped.entries());
  }, [inventory]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Inventory Locations</Text>
              <Text style={styles.title}>Real Storage Map</Text>
              <Text style={styles.subtitle}>Grouped directly from database-backed item locations instead of a static diagram.</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {locations.length === 0 ? (
              <CardBase style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No inventory locations available</Text>
                <Text style={styles.emptyText}>Add an inventory item with a location to see it grouped here.</Text>
              </CardBase>
            ) : null}

            {locations.map(([location, items]) => (
              <CardBase key={location} style={styles.locationCard}>
                <View style={styles.locationHeader}>
                  <View style={styles.locationTitleRow}>
                    <MaterialCommunityIcons name="map-marker-radius-outline" size={16} color="#1718C7" />
                    <Text style={styles.locationTitle}>{location}</Text>
                  </View>
                  <Text style={styles.locationCount}>{items.length} item(s)</Text>
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
                        <Text style={styles.itemMeta}>Target {item.targetLevel}</Text>
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
    backgroundColor: 'rgba(255,255,255,0.74)',
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
    borderBottomColor: '#EEF2F7',
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: '#1718C7',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: '#70839B',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  content: {
    padding: 24,
    gap: 14,
  },
  emptyCard: {
    borderRadius: 16,
    padding: 18,
    backgroundColor: '#F8FAFF',
    borderColor: '#E0E7FF',
  },
  emptyTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: '#70839B',
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
    color: '#0F172A',
  },
  locationCount: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#70839B',
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
    borderTopColor: '#EEF2F7',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemMeta: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: '#70839B',
  },
  itemValueWrap: {
    alignItems: 'flex-end',
  },
  itemValue: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: '#1718C7',
  },
  itemValueCritical: {
    color: '#F04B4B',
  },
});

export default InventoryMapOverlay;
