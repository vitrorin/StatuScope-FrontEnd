import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { OverlayStatCard } from '@/components/overlays/OverlayStatCard';
import { CardBase } from '@/components/patterns/CardBase';
import { DoctorDashboardZone } from '@/components/views/doctor/dashboard/Sub-funcionalidades/types';
import { useTranslation } from '@/i18n';
import { AppColors } from '@/constants/theme';

interface MapZoneDetailOverlayProps {
  visible: boolean;
  zone: DoctorDashboardZone | null;
  onClose: () => void;
}

export function MapZoneDetailOverlay({ visible, zone, onClose }: MapZoneDetailOverlayProps) {
  const { t } = useTranslation();

  if (!zone) return null;
  const eyebrow = zone.id === 'hospital-node'
    ? t('doctor.dashboard.overlays.hospitalDetail')
    : t('doctor.dashboard.overlays.zoneDetail');
  const locationText = [zone.municipalityName, zone.stateName].filter(Boolean).join(', ');
  const metrics = [
    { label: t('doctor.dashboard.overlays.primaryDisease'), value: zone.disease },
    { label: t('doctor.dashboard.overlays.riskLevel'), value: zone.risk },
    { label: t('doctor.dashboard.overlays.cases'), value: zone.cases },
    zone.radius ? { label: t('doctor.dashboard.overlays.radius'), value: zone.radius } : null,
    { label: t('doctor.dashboard.overlays.priority'), value: zone.priority },
  ].filter((metric): metric is { label: string; value: string } => metric !== null);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>{eyebrow}</Text>
              <Text style={styles.title}>{zone.name}</Text>
              <Text style={styles.subtitle}>{zone.note}</Text>
              {locationText ? (
                <View style={[styles.locationPill, { borderColor: `${zone.borderColor}30`, backgroundColor: `${zone.borderColor}0D` }]}>
                  <Feather name="map-pin" size={13} color={zone.borderColor} />
                  <Text style={styles.locationText}>{locationText}</Text>
                </View>
              ) : null}
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.78}>
              <Feather name="x" size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.metricsGrid}>
            {metrics.map((metric) => (
              <OverlayStatCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                accentColor={zone.borderColor}
                valueNumberOfLines={2}
                style={styles.statCard}
              />
            ))}
          </View>
        </CardBase>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: AppColors.modal.backdrop },
  dialog: { width: '100%', maxWidth: 680, borderRadius: 24, padding: 0, overflow: 'hidden' },
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
  headerCopy: { flex: 1 },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: AppColors.brand.action,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '900', color: AppColors.text.primary },
  subtitle: { marginTop: 8, fontSize: 14, lineHeight: 22, color: AppColors.text.soft },
  locationPill: {
    alignSelf: 'flex-start',
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: { fontSize: 13, lineHeight: 17, fontWeight: '900', color: AppColors.text.primary },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.border.default,
  },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 24 },
  statCard: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: '48%',
    width: '48%',
    minHeight: 106,
    borderRadius: 14,
    padding: 16,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: AppColors.surface.card,
  },
});

export default MapZoneDetailOverlay;
