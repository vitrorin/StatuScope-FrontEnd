import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { OverlayStatCard } from '@/components/overlays/OverlayStatCard';
import { CardBase } from '@/components/patterns/CardBase';
import { useTranslation } from '@/i18n';
import { AppColors } from '@/constants/theme';

export interface AnalyticsDiseaseDetail {
  id: string;
  name: string;
  cases: string;
  weeklyGrowth: string;
  riskLevel: string;
  affectedZones: string;
  trend: string;
}

interface DiseaseDetailOverlayProps {
  visible: boolean;
  disease: AnalyticsDiseaseDetail | null;
  onClose: () => void;
}

export function DiseaseDetailOverlay({ visible, disease, onClose }: DiseaseDetailOverlayProps) {
  const { t } = useTranslation();
  if (!disease) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>{t('common.analytics.overlays.diseaseDetail')}</Text>
              <Text style={styles.title}>{disease.name}</Text>
              <Text style={styles.subtitle}>{disease.trend}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.metricsRow}>
            <OverlayStatCard showAccentBar={false} style={styles.metricCard} labelStyle={styles.metricLabel} valueStyle={styles.metricValue} label={t('common.analytics.overlays.currentCases')} value={disease.cases} />
            <OverlayStatCard showAccentBar={false} style={styles.metricCard} labelStyle={styles.metricLabel} valueStyle={styles.metricValue} label={t('common.analytics.overlays.weeklyGrowth')} value={disease.weeklyGrowth} />
            <OverlayStatCard showAccentBar={false} style={styles.metricCard} labelStyle={styles.metricLabel} valueStyle={styles.metricValue} label={t('common.analytics.overlays.riskLevel')} value={disease.riskLevel} />
            <OverlayStatCard showAccentBar={false} style={styles.metricCard} labelStyle={styles.metricLabel} valueStyle={styles.metricValue} label={t('common.analytics.overlays.affectedZones')} value={disease.affectedZones} />
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
    maxWidth: 620,
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
  metricsRow: {
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
});

export default DiseaseDetailOverlay;
