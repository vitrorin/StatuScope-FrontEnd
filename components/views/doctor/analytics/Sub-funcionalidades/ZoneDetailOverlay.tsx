import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { OverlayStatCard } from '@/components/overlays/OverlayStatCard';
import { CardBase } from '@/components/patterns/CardBase';
import { useTranslation } from '@/i18n';
import { AppColors } from '@/constants/theme';

export interface AnalyticsZoneDetail {
  id: string;
  name: string;
  risk: string;
  disease: string;
  radius: string;
  priority: string;
  trend: string;
  note: string;
}

interface ZoneDetailOverlayProps {
  visible: boolean;
  zone: AnalyticsZoneDetail | null;
  onClose: () => void;
}

export function ZoneDetailOverlay({ visible, zone, onClose }: ZoneDetailOverlayProps) {
  const { t } = useTranslation();
  if (!zone) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>{t('common.analytics.overlays.zoneDetail')}</Text>
              <Text style={styles.title}>{zone.name}</Text>
              <Text style={styles.subtitle}>{zone.note}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.metricsGrid}>
            <OverlayStatCard showAccentBar={false} style={styles.metricCard} labelStyle={styles.metricLabel} valueStyle={styles.metricValue} label={t('common.analytics.overlays.riskLevel')} value={zone.risk} />
            <OverlayStatCard showAccentBar={false} style={styles.metricCard} labelStyle={styles.metricLabel} valueStyle={styles.metricValue} label={t('common.analytics.overlays.primaryDisease')} value={zone.disease} />
            <OverlayStatCard showAccentBar={false} style={styles.metricCard} labelStyle={styles.metricLabel} valueStyle={styles.metricValue} label={t('common.analytics.overlays.radius')} value={zone.radius} />
            <OverlayStatCard showAccentBar={false} style={styles.metricCard} labelStyle={styles.metricLabel} valueStyle={styles.metricValue} label={t('common.analytics.overlays.priority')} value={zone.priority} />
          </View>

          <CardBase style={styles.noteCard}>
            <Text style={styles.noteTitle}>{t('common.analytics.overlays.observedTrend')}</Text>
            <Text style={styles.noteText}>{zone.trend}</Text>
          </CardBase>
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
    maxWidth: 640,
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 24,
  },
  metricCard: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: '48%',
    width: '48%',
    borderRadius: 16,
    padding: 14,
  },
  metricLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: AppColors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    color: AppColors.text.primary,
  },
  noteCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 18,
    padding: 16,
  },
  noteTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    color: AppColors.brand.action,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 22,
    color: AppColors.text.body,
  },
});

export default ZoneDetailOverlay;
