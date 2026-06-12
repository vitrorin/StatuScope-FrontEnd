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
import { EmptyState } from '@/components/feedback/EmptyState';
import { CardBase } from '@/components/patterns/CardBase';
import { StaffRosterItem } from '@/components/views/admin/resources/Sub-funcionalidades/types';
import { useTranslation } from '@/i18n';
import { isSpanish } from '@/components/views/admin/localization';
import { AppColors } from '@/constants/theme';

interface FullRosterOverlayProps {
  visible: boolean;
  roster: StaffRosterItem[];
  onClose: () => void;
}

export function FullRosterOverlay({ visible, roster, onClose }: FullRosterOverlayProps) {
  const { language } = useTranslation();

  const availabilityLabel = (availability: StaffRosterItem['availability']): string => {
    const map: Record<string, string> = {
      'On Shift': isSpanish(language) ? 'En turno' : 'On Shift',
      'On Call': isSpanish(language) ? 'En guardia' : 'On Call',
      'Standby': isSpanish(language) ? 'En reserva' : 'Standby',
      'Unavailable': isSpanish(language) ? 'No disponible' : 'Unavailable',
    };
    return map[availability] ?? availability;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>{isSpanish(language) ? 'Vista de personal' : 'Staffing Overview'}</Text>
              <Text style={styles.title}>{isSpanish(language) ? 'Roster activo completo' : 'Full Active Roster'}</Text>
              <Text style={styles.subtitle}>{isSpanish(language) ? 'Roster en vivo por departamentos, turnos y estados de disponibilidad.' : 'Live roster across departments, shifts, and availability states.'}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {roster.length === 0 ? (
              <EmptyState
                style={styles.emptyCard}
                title={isSpanish(language) ? 'No hay contactos operativos disponibles' : 'No live operational contacts available'}
                message={
                  isSpanish(language)
                    ? 'Este roster ahora solo muestra registros de contactos reales devueltos por el backend.'
                    : 'This roster now only shows real contact records returned by the backend.'
                }
              />
            ) : null}

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
                  <Text style={styles.memberMeta}>{member.role} | {member.department}</Text>
                  <Text style={styles.memberMeta}>{member.shift}</Text>
                  {member.contactChannel && member.contactValue ? (
                    <Text style={styles.memberMeta}>{member.contactChannel}: {member.contactValue}</Text>
                  ) : null}
                </View>
                <View style={styles.availabilityPill}>
                  <MaterialCommunityIcons
                    name={
                      member.availability === 'On Shift'
                        ? 'check-decagram-outline'
                        : member.availability === 'On Call'
                          ? 'phone-outline'
                          : member.availability === 'Standby'
                            ? 'clock-outline'
                            : 'close-circle-outline'
                    }
                    size={14}
                    color={AppColors.brand.action}
                  />
                  <Text style={styles.availabilityText}>{availabilityLabel(member.availability)}</Text>
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
  list: {
    padding: 20,
    gap: 12,
  },
  emptyCard: {
    borderRadius: 16,
    padding: 18,
    backgroundColor: AppColors.surface.raised,
    borderColor: AppColors.border.brandSoft,
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
    backgroundColor: AppColors.surface.brandSoft,
  },
  avatarText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
    color: AppColors.brand.action,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: AppColors.text.primary,
  },
  memberMeta: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: AppColors.text.soft,
  },
  availabilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: AppColors.surface.raised,
    borderWidth: 1,
    borderColor: AppColors.border.brandSoft,
  },
  availabilityText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: AppColors.brand.action,
  },
});

export default FullRosterOverlay;
