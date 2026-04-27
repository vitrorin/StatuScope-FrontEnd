import React from 'react';
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
import { StaffRosterItem } from '@/components/views/admin/resources/Sub-funcionalidades/types';

interface FullRosterOverlayProps {
  visible: boolean;
  roster: StaffRosterItem[];
  onClose: () => void;
}

export function FullRosterOverlay({ visible, roster, onClose }: FullRosterOverlayProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Staffing Overview</Text>
              <Text style={styles.title}>Full Active Roster</Text>
              <Text style={styles.subtitle}>Live roster across departments, shifts, and availability states.</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {roster.map((member) => (
              <CardBase key={member.id} style={styles.rosterCard}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {member.name
                      .split(' ')
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join('')}
                  </Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberMeta}>{member.role} · {member.department}</Text>
                  <Text style={styles.memberMeta}>{member.shift}</Text>
                </View>
                <View style={styles.availabilityPill}>
                  <MaterialCommunityIcons
                    name={member.availability === 'On Shift' ? 'check-decagram-outline' : member.availability === 'On Call' ? 'phone-outline' : 'clock-outline'}
                    size={14}
                    color="#1718C7"
                  />
                  <Text style={styles.availabilityText}>{member.availability}</Text>
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
    maxWidth: 760,
    maxHeight: '85%',
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
  list: {
    padding: 20,
    gap: 12,
  },
  rosterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 16,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF1FF',
  },
  avatarText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
    color: '#1718C7',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  memberMeta: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: '#70839B',
  },
  availabilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  availabilityText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#1718C7',
  },
});

export default FullRosterOverlay;
