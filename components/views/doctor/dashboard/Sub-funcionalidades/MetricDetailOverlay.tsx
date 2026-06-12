import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { OverlayStatCard } from '@/components/overlays/OverlayStatCard';
import { CardBase } from '@/components/patterns/CardBase';
import { DoctorDashboardMetric } from '@/components/views/doctor/dashboard/Sub-funcionalidades/types';
import { useTranslation } from '@/i18n';
import { AppColors } from '@/constants/theme';

interface MetricDetailOverlayProps {
  visible: boolean;
  metric: DoctorDashboardMetric | null;
  onClose: () => void;
}

export function MetricDetailOverlay({ visible, metric, onClose }: MetricDetailOverlayProps) {
  const { t } = useTranslation();

  if (!metric) return null;
  const insightCriteria = t(`doctor.dashboard.metrics.${metric.id}.insightCriteria`);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>{t('doctor.dashboard.overlays.clinicalMetric')}</Text>
              <Text style={styles.title}>{metric.detailTitle}</Text>
              <Text style={styles.subtitle}>{metric.detailSummary}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.78}>
              <Feather name="x" size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.metricsGrid}>
              <OverlayStatCard label={t('doctor.dashboard.overlays.currentValue')} value={metric.value} accentColor={accentColor(metric.status)} style={styles.statCard} />
              <OverlayStatCard label={t('doctor.dashboard.overlays.signal')} value={metric.signalLabel} accentColor={accentColor(metric.status)} style={styles.statCard} />
            </View>

            {metric.insights && metric.insights.length > 0 ? (
              <View style={styles.insightsSection}>
                <View style={styles.insightsHeader}>
                  <View style={styles.insightsHeaderCopy}>
                    <Text style={styles.insightsTitle}>{t('doctor.dashboard.overlays.metricInsights')}</Text>
                    {insightCriteria ? (
                      <Text style={styles.insightsCriteria}>{insightCriteria}</Text>
                    ) : null}
                  </View>
                </View>
                <View style={styles.insightsList}>
                  {metric.insights.map((insight, index) => (
                    <View key={`${insight.title}-${insight.location}-${index}`} style={styles.insightRow}>
                      <View style={[styles.insightRank, { borderColor: `${insight.color}33`, backgroundColor: `${insight.color}12` }]}>
                        <Text style={[styles.insightRankText, { color: insight.color }]}>{index + 1}</Text>
                      </View>
                      <View style={styles.insightCopy}>
                        <Text style={styles.insightTitle}>{insight.title}</Text>
                        <Text style={styles.insightLocation}>{insight.location}</Text>
                      </View>
                      <View style={styles.insightMeta}>
                        <Text style={[styles.insightCases, { color: insight.color }]}>{insight.cases}</Text>
                        <Text style={styles.insightSeverity}>{insight.meta ?? insight.severity}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </ScrollView>
        </CardBase>
      </View>
    </Modal>
  );
}

function accentColor(status?: DoctorDashboardMetric['status']) {
  if (status === 'danger') return AppColors.status.dangerBright;
  if (status === 'warning') return AppColors.status.warningBright;
  if (status === 'positive') return AppColors.status.successBright;
  return AppColors.brand.primary;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: AppColors.modal.backdrop },
  dialog: { width: '100%', maxWidth: 760, maxHeight: '86%', borderRadius: 24, padding: 0, overflow: 'hidden' },
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
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.border.default,
  },
  body: { padding: 24, gap: 20 },
  metricsGrid: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, borderRadius: 16, padding: 16, paddingLeft: 20, borderWidth: 1, overflow: 'hidden' },
  insightsSection: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AppColors.border.default,
    backgroundColor: AppColors.surface.card,
    overflow: 'hidden',
  },
  insightsHeader: {
    minHeight: 62,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border.soft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  insightsHeaderCopy: { flex: 1 },
  insightsTitle: { fontSize: 14, lineHeight: 18, fontWeight: '900', color: AppColors.text.primary },
  insightsCriteria: { marginTop: 4, fontSize: 12, lineHeight: 16, fontWeight: '600', color: AppColors.text.secondary },
  insightsList: { padding: 12, gap: 10 },
  insightRow: {
    minHeight: 72,
    borderRadius: 14,
    backgroundColor: AppColors.surface.subtle,
    borderWidth: 1,
    borderColor: AppColors.border.soft,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  insightRank: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightRankText: { fontSize: 13, lineHeight: 16, fontWeight: '900' },
  insightCopy: { flex: 1, minWidth: 0 },
  insightTitle: { fontSize: 14, lineHeight: 18, fontWeight: '900', color: AppColors.text.primary },
  insightLocation: { marginTop: 4, fontSize: 12, lineHeight: 16, fontWeight: '600', color: AppColors.text.secondary },
  insightMeta: { alignItems: 'flex-end', maxWidth: 150 },
  insightCases: { fontSize: 13, lineHeight: 18, fontWeight: '900' },
  insightSeverity: { marginTop: 4, fontSize: 11, lineHeight: 14, fontWeight: '700', color: AppColors.text.secondary },
});

export default MetricDetailOverlay;
