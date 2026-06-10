import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CardBase } from '@/components/patterns/CardBase';
import { DoctorDashboardAlert } from '@/components/views/doctor/dashboard/Sub-funcionalidades/types';
import { useTranslation } from '@/i18n';
import { AppColors } from '@/constants/theme';

interface AlertDetailOverlayProps {
  visible: boolean;
  alert: DoctorDashboardAlert | null;
  onClose: () => void;
}

export function AlertDetailOverlay({ visible, alert, onClose }: AlertDetailOverlayProps) {
  const { t } = useTranslation();

  if (!alert) return null;
  const accent = accentColor(alert.variant);
  const statusLabel = alert.confirmationStatus ?? alert.priority;
  const diseaseName = diseaseFromTitle(alert.title);
  const activeCasesText = alert.caseLabel
    ?? (alert.caseCount != null
      ? t(alert.caseCount === 1 ? 'common.units.case' : 'common.units.activeCases', { count: alert.caseCount.toLocaleString() })
      : alert.description.split('.')[0]);
  const clinicalRows = [
    { label: t('doctor.dashboard.alerts.activeCasesLabel'), value: activeCasesText, icon: 'activity' as const, color: accent },
    { label: t('doctor.dashboard.overlays.municipality'), value: alert.municipalityName ?? alert.area, icon: 'map-pin' as const, color: '#3D7FFF' },
    { label: t('doctor.dashboard.overlays.state'), value: alert.stateName ?? alert.area, icon: 'map' as const, color: AppColors.brand.purple },
    { label: t('doctor.dashboard.overlays.status'), value: statusLabel, icon: 'check-circle' as const, color: statusAccent(alert.variant) },
    { label: t('doctor.dashboard.overlays.priority'), value: alert.priority, icon: 'flag' as const, color: priorityAccent(alert.variant) },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>{t('doctor.dashboard.overlays.alertDetail')}</Text>
              <Text style={styles.title}>{alert.title}</Text>
              <Text style={styles.subtitle}>{alert.description}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.78}>
              <Feather name="x" size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <View style={styles.metricsGrid}>
              <MetricStat
                label={t('doctor.dashboard.overlays.currentValue')}
                value={diseaseName}
                accentColor={accent}
              />
              <MetricStat
                label={t('doctor.dashboard.overlays.signal')}
                value={statusLabel}
                accentColor={accent}
              />
            </View>

            <View style={styles.insightsSection}>
              <View style={styles.insightsHeader}>
                <Text style={styles.insightsTitle}>{t('doctor.dashboard.overlays.metricInsights')}</Text>
              </View>
              <View style={styles.insightsList}>
                {clinicalRows.map((row, index) => (
                  <View key={`${row.label}-${index}`} style={[styles.insightRow, { borderColor: `${row.color}1F` }]}>
                    <View style={[styles.insightRank, { borderColor: `${row.color}33`, backgroundColor: `${row.color}12` }]}>
                      <Feather name={row.icon} size={16} color={row.color} />
                    </View>
                    <View style={styles.insightCopy}>
                      <Text style={styles.insightTitle}>{row.label}</Text>
                      <Text style={styles.insightLocation}>{row.value}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </CardBase>
      </View>
    </Modal>
  );
}

function MetricStat({ label, value, accentColor }: { label: string; value: string; accentColor: string }) {
  return (
    <CardBase style={[styles.statCard, { borderColor: `${accentColor}24` }]}>
      <View style={[styles.statAccent, { backgroundColor: accentColor }]} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={2}>{value}</Text>
    </CardBase>
  );
}

function accentColor(variant: DoctorDashboardAlert['variant']) {
  if (variant === 'critical') return AppColors.status.infoDark;
  if (variant === 'warning') return AppColors.roleTone.doctor.accent;
  if (variant === 'success') return AppColors.auth.radarBlue;
  if (variant === 'neutral') return AppColors.text.secondary;
  return AppColors.brand.primary;
}

function statusAccent(variant: DoctorDashboardAlert['variant']) {
  if (variant === 'critical') return AppColors.status.infoDark;
  if (variant === 'warning') return AppColors.roleTone.doctor.accent;
  return AppColors.auth.radarBlue;
}

function priorityAccent(variant: DoctorDashboardAlert['variant']) {
  if (variant === 'critical') return AppColors.status.infoDeep;
  if (variant === 'warning') return AppColors.roleTone.doctor.accent;
  return AppColors.auth.radarBlue;
}

function diseaseFromTitle(title: string) {
  return title
    .replace(/^Actividad de\s+/i, '')
    .replace(/\s+activity$/i, '')
    .trim();
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: AppColors.modal.backdrop },
  dialog: { width: '100%', maxWidth: 680, borderRadius: 24, padding: 0, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 18, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: AppColors.border.soft },
  headerCopy: { flex: 1 },
  eyebrow: { fontSize: 12, lineHeight: 16, fontWeight: '800', color: AppColors.brand.action, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '900', color: AppColors.text.primary },
  subtitle: { marginTop: 8, fontSize: 14, lineHeight: 22, color: AppColors.text.soft },
  closeButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: AppColors.border.default },
  body: { padding: 24, gap: 20 },
  metricsGrid: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    minHeight: 82,
    borderRadius: 16,
    padding: 16,
    paddingLeft: 20,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: AppColors.surface.card,
  },
  statAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  statLabel: { fontSize: 12, lineHeight: 16, fontWeight: '800', color: AppColors.text.muted, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8 },
  statValue: { fontSize: 18, lineHeight: 24, fontWeight: '900', color: AppColors.text.primary },
  insightsSection: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AppColors.border.default,
    backgroundColor: AppColors.surface.card,
    overflow: 'hidden',
  },
  insightsHeader: {
    minHeight: 56,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border.soft,
    justifyContent: 'center',
  },
  insightsTitle: { fontSize: 14, lineHeight: 18, fontWeight: '900', color: AppColors.text.primary },
  insightsList: { padding: 12, gap: 10 },
  insightRow: {
    minHeight: 64,
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
  insightCopy: { flex: 1, minWidth: 0 },
  insightTitle: { fontSize: 12, lineHeight: 16, fontWeight: '800', color: AppColors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  insightLocation: { marginTop: 5, fontSize: 15, lineHeight: 20, fontWeight: '900', color: AppColors.text.primary },
});

export default AlertDetailOverlay;
