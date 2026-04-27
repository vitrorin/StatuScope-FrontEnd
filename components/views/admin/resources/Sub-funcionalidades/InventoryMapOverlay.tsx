import React from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
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
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Inventory Map</Text>
              <Text style={styles.title}>Hospital Resource Nodes</Text>
              <Text style={styles.subtitle}>Visual inventory distribution by storage zone and critical stock levels.</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.mapArea}>
              <View style={[styles.node, styles.nodeA]}>
                <Text style={styles.nodeLabel}>Storage A</Text>
              </View>
              <View style={[styles.node, styles.nodeB]}>
                <Text style={styles.nodeLabel}>Pharmacy</Text>
              </View>
              <View style={[styles.node, styles.nodeC]}>
                <Text style={styles.nodeLabel}>Central Med</Text>
              </View>
              <View style={styles.connectorHorizontal} />
              <View style={styles.connectorVertical} />
            </View>

            <View style={styles.legend}>
              {inventory.map((item) => (
                <CardBase key={item.id} style={styles.legendCard}>
                  <View style={styles.legendTitleRow}>
                    <MaterialCommunityIcons
                      name={item.tone === 'critical' ? 'alert-circle-outline' : 'map-marker-radius-outline'}
                      size={16}
                      color={item.tone === 'critical' ? '#F04B4B' : '#1718C7'}
                    />
                    <Text style={styles.legendTitle}>{item.title}</Text>
                  </View>
                  <Text style={styles.legendMeta}>{item.location}</Text>
                  <Text style={styles.legendMeta}>Target: {item.targetLevel}</Text>
                  <Text style={[styles.legendValue, item.tone === 'critical' && styles.legendValueCritical]}>
                    {item.valueText}
                  </Text>
                </CardBase>
              ))}
            </View>
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
    backgroundColor: 'rgba(255,255,255,0.74)',
  },
  dialog: {
    width: '100%',
    maxWidth: 920,
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
    flexDirection: 'row',
    gap: 18,
    padding: 24,
  },
  mapArea: {
    flex: 1.1,
    minHeight: 360,
    borderRadius: 20,
    backgroundColor: '#F7F9FD',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
    overflow: 'hidden',
  },
  node: {
    position: 'absolute',
    minWidth: 118,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE3EE',
    alignItems: 'center',
  },
  nodeA: {
    left: 56,
    top: 72,
  },
  nodeB: {
    right: 60,
    top: 128,
  },
  nodeC: {
    left: 168,
    bottom: 82,
  },
  nodeLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  connectorHorizontal: {
    position: 'absolute',
    left: 164,
    right: 176,
    top: 150,
    height: 2,
    backgroundColor: '#CBD5E1',
  },
  connectorVertical: {
    position: 'absolute',
    left: 226,
    top: 152,
    bottom: 136,
    width: 2,
    backgroundColor: '#CBD5E1',
  },
  legend: {
    flex: 0.9,
    gap: 12,
  },
  legendCard: {
    borderRadius: 16,
    padding: 14,
  },
  legendTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  legendTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  legendMeta: {
    fontSize: 12,
    lineHeight: 18,
    color: '#70839B',
  },
  legendValue: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: '#1718C7',
  },
  legendValueCritical: {
    color: '#F04B4B',
  },
});

export default InventoryMapOverlay;
