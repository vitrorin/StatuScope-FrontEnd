import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { OverlayStatCard } from '@/components/overlays/OverlayStatCard';
import { CardBase } from '@/components/patterns/CardBase';
import { AdminDashboardMetric } from '@/components/views/admin/dashboard/Sub-funcionalidades/types';
import { useTranslation } from '@/i18n';
import { AppColors } from '@/constants/theme';

interface MetricDetailOverlayProps {
  visible: boolean;
  metric: AdminDashboardMetric | null;
  onClose: () => void;
}

export function MetricDetailOverlay({ visible, metric, onClose }: MetricDetailOverlayProps) {
  const { t } = useTranslation();

  if (!metric) return null;
  const accent = accentColor(metric.tone);
  const isRanked = metric.insightsVariant === 'ranked';
  const isClinicalMetric = metric.id === 'outbreaks';
  const insightsTitle = isRanked
    ? t('doctor.dashboard.overlays.metricInsights')
    : t('admin.dashboard.kpiDetails.insightsTitle');
  const insightCriteria = metric.insightCriteria ?? metric.subtitle ?? t('admin.dashboard.kpiDetails.defaultCriteria');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>
                {isClinicalMetric ? t('doctor.dashboard.overlays.clinicalMetric') : t('admin.dashboard.kpiDetails.operationalMetric')}
              </Text>
              <Text style={styles.title}>{metric.detailTitle}</Text>
              <Text style={styles.subtitle}>{metric.detailSummary}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.78}>
              <Feather name="x" size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.metricsGrid}>
              <OverlayStatCard label={t('admin.dashboard.kpiDetails.currentSituation')} value={metric.value} accentColor={accent} valueNumberOfLines={2} style={styles.statCard} />
              <OverlayStatCard
                label={t('admin.dashboard.kpiDetails.indicator')}
                value={metric.signalLabel}
                accentColor={accent}
                valueNumberOfLines={2}
                style={styles.statCard}
              />
            </View>

            {metric.insights && metric.insights.length > 0 ? (
              <View style={styles.insightsSection}>
                <View style={styles.insightsHeader}>
                  <View style={styles.insightsHeaderCopy}>
                    <Text style={styles.insightsTitle}>{insightsTitle}</Text>
                    <Text style={styles.insightsCriteria}>{insightCriteria}</Text>
                  </View>
                </View>
                <View style={styles.insightsList}>
                  {metric.insights.map((insight, index) => (
                    <View key={`${insight.title}-${insight.location}-${index}`} style={styles.insightRow}>
                      <View style={[styles.insightMarker, { borderColor: `${insight.color}33`, backgroundColor: `${insight.color}12` }]}>
                        {isRanked ? (
                          <Text style={[styles.insightRankText, { color: insight.color }]}>{index + 1}</Text>
                        ) : (
                          <Feather name="activity" size={15} color={insight.color} />
                        )}
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
            ) : (
              <View style={styles.insightsSection}>
                <View style={styles.insightsHeader}>
                  <Text style={styles.insightsTitle}>{t('admin.dashboard.kpiDetails.recommendedAction')}</Text>
                </View>
                <View style={styles.emptyInsight}>
                  <Text style={styles.emptyInsightText}>{metric.recommendedAction}</Text>
                </View>
              </View>
            )}

            {metric.relatedAlerts && metric.relatedAlerts.length > 0 ? (
              <View style={styles.insightsSection}>
                <View style={styles.insightsHeader}>
                  <Text style={styles.insightsTitle}>{t('admin.dashboard.kpiDetails.relatedHospitalAlerts')}</Text>
                </View>
                <View style={styles.insightsList}>
                  {metric.relatedAlerts.map((alert, index) => (
                    <View key={`${alert.title}-${alert.location}-${index}`} style={styles.insightRow}>
                      <View style={[styles.insightMarker, { borderColor: `${alert.color}33`, backgroundColor: `${alert.color}12` }]}>
                        <Feather name="bell" size={15} color={alert.color} />
                      </View>
                      <View style={styles.insightCopy}>
                        <Text style={styles.insightTitle}>{alert.title}</Text>
                        <Text style={styles.insightLocation}>{alert.location}</Text>
                      </View>
                      <View style={styles.insightMeta}>
                        <Text style={[styles.insightCases, { color: alert.color }]}>{alert.cases}</Text>
                        <Text style={styles.insightSeverity}>{alert.meta ?? alert.severity}</Text>
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

function accentColor(tone?: AdminDashboardMetric['tone']) {
  if (tone === 'critical') return AppColors.status.dangerBright;
  if (tone === 'warning') return AppColors.status.warning;
  if (tone === 'positive') return AppColors.status.successBright;
  if (tone === 'info') return AppColors.status.infoBright;
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
  statCard: { flex: 1, minHeight: 82, borderRadius: 16, padding: 16, paddingLeft: 20, borderWidth: 1, overflow: 'hidden' },
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
  insightMarker: {
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
  emptyInsight: { padding: 18 },
  emptyInsightText: { fontSize: 14, lineHeight: 22, color: AppColors.text.body },
});

export default MetricDetailOverlay;
