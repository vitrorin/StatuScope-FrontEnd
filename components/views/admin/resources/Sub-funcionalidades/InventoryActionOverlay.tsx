import React, { useEffect, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '@/components/foundation/Button';
import { InputField } from '@/components/inputs/InputField';
import { CardBase } from '@/components/patterns/CardBase';
import { InventoryResourceItem } from '@/components/views/admin/resources/Sub-funcionalidades/types';

interface InventoryActionOverlayProps {
  visible: boolean;
  inventoryItem: InventoryResourceItem | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function InventoryActionOverlay({
  visible,
  inventoryItem,
  onClose,
  onConfirm,
}: InventoryActionOverlayProps) {
  const [quantity, setQuantity] = useState('20');
  const [priority, setPriority] = useState('Normal');

  useEffect(() => {
    if (visible) {
      setQuantity('20');
      setPriority(inventoryItem?.tone === 'critical' ? 'Urgent' : 'Normal');
    }
  }, [inventoryItem, visible]);

  if (!inventoryItem) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Inventory Action</Text>
              <Text style={styles.title}>{inventoryItem.actionLabel}</Text>
              <Text style={styles.subtitle}>Prepare the next step for {inventoryItem.title.toLowerCase()}.</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <InputField
              label="Requested Quantity"
              type="number"
              value={quantity}
              onChangeText={(text) => setQuantity(text.replace(/[^0-9]/g, ''))}
              inputContainerStyle={styles.inputContainer}
            />

            <View style={styles.priorityRow}>
              {['Normal', 'High', 'Urgent'].map((level) => {
                const isActive = priority === level;
                return (
                  <TouchableOpacity
                    key={level}
                    style={[styles.priorityChip, isActive && styles.priorityChipActive]}
                    onPress={() => setPriority(level)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.priorityChipText, isActive && styles.priorityChipTextActive]}>{level}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <CardBase style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Summary</Text>
              <Text style={styles.summaryText}>Location: {inventoryItem.location}</Text>
              <Text style={styles.summaryText}>Current level: {inventoryItem.valueText}</Text>
              <Text style={styles.summaryText}>Target level: {inventoryItem.targetLevel}</Text>
            </CardBase>
          </View>

          <View style={styles.footer}>
            <Button label="Cancel" variant="secondary" size="md" style={styles.footerButton} onPress={onClose} />
            <Button
              label="Confirm Action"
              variant="primary"
              size="md"
              style={{ ...styles.footerButton, ...styles.primaryButton }}
              onPress={onConfirm}
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
    backgroundColor: 'rgba(255,255,255,0.74)',
  },
  dialog: {
    width: '100%',
    maxWidth: 560,
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
    fontSize: 22,
    lineHeight: 28,
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
    gap: 16,
  },
  inputContainer: {
    height: 50,
    borderRadius: 12,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  priorityChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#F6F8FC',
    borderWidth: 1,
    borderColor: '#E8EDF5',
  },
  priorityChipActive: {
    backgroundColor: '#EEF1FF',
    borderColor: '#C9D1FF',
  },
  priorityChipText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: '#70839B',
  },
  priorityChipTextActive: {
    color: '#1718C7',
  },
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#F8FAFF',
    borderColor: '#E0E7FF',
  },
  summaryTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: '#1718C7',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#526174',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
  },
  footerButton: {
    minWidth: 150,
  },
  primaryButton: {
    backgroundColor: '#1718C7',
    borderColor: '#1718C7',
  },
});

export default InventoryActionOverlay;
