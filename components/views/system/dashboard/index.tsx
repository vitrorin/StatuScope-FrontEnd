import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { systemNavigationLinks, getSystemSidebarItems } from '@/components/dashboard/systemNavigation';
import { Button } from '@/components/foundation/Button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/i18n';
import { initialsFromName } from '@/lib/format';
import { getSystemDashboardSummary, SystemDashboardSummaryResponse, SystemMetricResponse } from '@/lib/systemAdmin';
import { isSpanish } from '@/components/views/admin/localization';

const metricIcons: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  hospital: 'hospital-building',
  users: 'account-multiple-outline',
  check: 'check-circle-outline',
  cpu: 'brain',
};

export function SystemDashboard() {
  const router = useRouter();
  const { logout, profile } = useAuth();
  const { language } = useTranslation();
  const es = isSpanish(language);
  const [summary, setSummary] = useState<SystemDashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sidebarItems = useMemo(() => getSystemSidebarItems(language), [language]);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSummary(await getSystemDashboardSummary());
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : es ? 'No se pudo cargar el panel del sistema.' : 'Unable to load system dashboard.');
    } finally {
      setLoading(false);
    }
  }, [es]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const exportReport = () => {
    if (!summary || typeof window === 'undefined' || typeof document === 'undefined') return;
    const lines = [
      'StatuScope System Report',
      `Generated at: ${summary.generatedAt}`,
      '',
      ...summary.metrics.map((metric) => `${metric.title}: ${metric.value} (${metric.detail})`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'statusscope-system-report.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout
      active="dashboard"
      sectionLabel={es ? 'Panel del sistema' : 'System Dashboard'}
      userName={profile?.fullName ?? (es ? 'Administrador del sistema' : 'System Administrator')}
      userId={profile?.email ?? undefined}
      avatarText={initialsFromName(profile?.fullName)}
      links={systemNavigationLinks}
      sidebarItems={sidebarItems}
      onLogout={async () => { await logout(); router.replace('/login'); }}
    >
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View>
            <Text style={styles.eyebrow}>{es ? 'Vista global' : 'System Overview'}</Text>
            <Text style={styles.title}>{es ? 'Estado general de StatuScope' : 'System Overview'}</Text>
            <Text style={styles.subtitle}>
              {es ? 'Estado en tiempo real de hospitales, usuarios y servicios de la plataforma.' : 'Real-time status of StatuScope infrastructure, users, and hospital network.'}
            </Text>
          </View>
          <View style={styles.heroActions}>
            <Button
              label={es ? 'Exportar reporte' : 'Export Report'}
              variant="secondary"
              size="sm"
              leadingIcon={<Feather name="download" size={15} color="#334155" />}
              onPress={exportReport}
              disabled={!summary}
            />
            <Button
              label={es ? 'Actualizar métricas' : 'Refresh Metrics'}
              variant="primary"
              size="sm"
              leadingIcon={<Feather name="refresh-cw" size={15} color="#FFFFFF" />}
              onPress={() => { void loadSummary(); }}
            />
          </View>
        </View>

        {loading ? <DashboardSkeleton /> : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>{es ? 'Panel no disponible' : 'Dashboard unavailable'}</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Button label={es ? 'Reintentar' : 'Retry'} variant="secondary" size="sm" onPress={() => { void loadSummary(); }} />
          </View>
        ) : summary ? (
          <>
            <View style={styles.metricsGrid}>
              {summary.metrics.map((metric) => (
                <MetricCard key={metric.id} metric={metric} es={es} />
              ))}
            </View>

            <View style={styles.mainGrid}>
              <View style={[styles.panel, styles.activityPanel]}>
                <View style={styles.panelHeader}>
                  <Text style={styles.panelTitle}>{es ? 'Tendencia de actividad de usuarios' : 'User Activity Trend'}</Text>
                  <View style={styles.rangePill}><Text style={styles.rangeText}>{es ? 'Últimos 7 días' : 'Last 7 Days'}</Text></View>
                </View>
                <View style={styles.chart}>
                  {summary.userActivity.map((point) => {
                    const max = Math.max(1, ...summary.userActivity.map((item) => item.value));
                    return (
                      <View key={point.label} style={styles.barSlot}>
                        <View style={[styles.bar, { height: 32 + (point.value / max) * 118 }]} />
                        <Text style={styles.barLabel}>{point.label}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              <View style={[styles.panel, styles.regionalPanel]}>
                <Text style={styles.panelTitle}>{es ? 'Distribución regional' : 'Regional Distribution'}</Text>
                <View style={styles.regionList}>
                  {summary.regionalDistribution.map((region) => (
                    <View key={region.label} style={styles.regionItem}>
                      <View style={styles.regionHeader}>
                        <Text style={styles.regionLabel}>{region.label}</Text>
                        <Text style={styles.regionPercent}>{region.percent}%</Text>
                      </View>
                      <View style={styles.track}><View style={[styles.fill, { width: `${Math.max(4, region.percent)}%` }]} /></View>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.panel}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>{es ? 'Eventos recientes de seguridad' : 'Recent Security Events'}</Text>
                <Text style={styles.linkText}>{es ? 'Registro global' : 'Global Log'}</Text>
              </View>
              <View style={styles.eventList}>
                {summary.recentEvents.map((event) => (
                  <View key={event.id} style={styles.eventRow}>
                    <View style={[styles.eventIcon, event.type === 'warning' && styles.eventWarning]}>
                      <Feather name={event.type === 'login' ? 'log-in' : event.type === 'hospital' ? 'briefcase' : 'alert-triangle'} size={14} color={event.type === 'warning' ? '#D97706' : '#1D4ED8'} />
                    </View>
                    <View style={styles.eventCopy}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventDetail}>{event.detail}</Text>
                    </View>
                    <Text style={styles.eventTime}>{formatDate(event.occurredAt)}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>
    </DashboardLayout>
  );
}

function MetricCard({ metric, es }: { metric: SystemMetricResponse; es: boolean }) {
  const tone = metric.status === 'warning' ? '#F59E0B' : metric.status === 'critical' ? '#EF4444' : '#10B981';
  const iconName = metricIcons[metric.iconKey] ?? 'chart-box-outline';
  const title = translateMetricTitle(metric.title, es);
  const value = translateMetricValue(metric.value, es);
  const detail = translateMetricDetail(metric.detail, es);

  return (
    <View style={styles.metricCard}>
      <View style={styles.metricTop}>
        <Text style={styles.metricTitle}>{title}</Text>
        <View style={[styles.metricIcon, { backgroundColor: `${tone}18` }]}>
          <MaterialCommunityIcons name={iconName} size={18} color={tone} />
        </View>
      </View>
      <Text style={[styles.metricValue, metric.id === 'system' || metric.id === 'ai' ? { color: tone } : null]}>{value}</Text>
      <Text style={styles.metricDetail}>{detail}</Text>
    </View>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <View style={styles.metricsGrid}>
        {Array.from({ length: 4 }).map((_, index) => <View key={index} style={[styles.metricCard, styles.skeletonCard]} />)}
      </View>
      <View style={styles.mainGrid}>
        <View style={[styles.panel, styles.activityPanel, styles.skeletonTall]} />
        <View style={[styles.panel, styles.regionalPanel, styles.skeletonTall]} />
      </View>
      <View style={[styles.panel, styles.skeletonEvents]} />
    </>
  );
}

function translateMetricTitle(value: string, es: boolean) {
  if (!es) return value;
  return ({
    'Total Registered Hospitals': 'Hospitales registrados',
    'Active Users': 'Usuarios activos',
    'System Status': 'Estado del sistema',
    'AI Services Status': 'Estado de servicios IA',
  } as Record<string, string>)[value] ?? value;
}

function translateMetricValue(value: string, es: boolean) {
  if (!es) return value;
  return value === 'Operational' ? 'Operativo' : value === 'Running' ? 'Activo' : value === 'Needs config' ? 'Requiere configuración' : value;
}

function translateMetricDetail(value: string, es: boolean) {
  if (!es) return value;
  return value
    .replace('active partners', 'hospitales activos')
    .replace('total platform users', 'usuarios totales')
    .replace('Database and API available', 'Base de datos y API disponibles')
    .replace('LLM provider configured', 'Proveedor LLM configurado')
    .replace('Missing provider key', 'Falta configurar proveedor');
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
}

const styles = StyleSheet.create({
  contentContainer: { padding: 32, gap: 24 },
  hero: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  eyebrow: { fontSize: 13, fontWeight: '800', color: '#0003B8', textTransform: 'uppercase' },
  title: { marginTop: 8, fontSize: 30, lineHeight: 38, fontWeight: '800', color: '#111827' },
  subtitle: { marginTop: 6, fontSize: 16, lineHeight: 24, color: '#64748B', maxWidth: 760 },
  heroActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  metricsGrid: { flexDirection: 'row', gap: 20 },
  metricCard: {
    flex: 1,
    minHeight: 132,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 22,
  },
  metricTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricTitle: { fontSize: 14, lineHeight: 20, color: '#64748B', fontWeight: '600' },
  metricIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  metricValue: { marginTop: 18, fontSize: 30, lineHeight: 36, color: '#111827', fontWeight: '800' },
  metricDetail: { marginTop: 4, color: '#64748B', fontSize: 12, lineHeight: 18 },
  mainGrid: { flexDirection: 'row', gap: 24 },
  panel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
  },
  activityPanel: { flex: 2 },
  regionalPanel: { flex: 1 },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  panelTitle: { fontSize: 17, lineHeight: 24, fontWeight: '800', color: '#111827' },
  rangePill: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  rangeText: { fontSize: 12, fontWeight: '700', color: '#334155' },
  chart: { height: 250, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: 28 },
  barSlot: { flex: 1, alignItems: 'center', gap: 10 },
  bar: { width: 34, borderRadius: 999, backgroundColor: '#1D4ED8' },
  barLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8' },
  regionList: { marginTop: 24, gap: 18 },
  regionItem: { gap: 8 },
  regionHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  regionLabel: { fontSize: 13, fontWeight: '700', color: '#475569' },
  regionPercent: { fontSize: 13, fontWeight: '800', color: '#111827' },
  track: { height: 7, borderRadius: 999, backgroundColor: '#EEF2F7', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999, backgroundColor: '#1D4ED8' },
  linkText: { fontSize: 13, fontWeight: '800', color: '#0003B8' },
  eventList: { marginTop: 14 },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  eventIcon: { width: 34, height: 34, borderRadius: 999, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center' },
  eventWarning: { backgroundColor: '#FEF3C7' },
  eventCopy: { flex: 1 },
  eventTitle: { color: '#111827', fontWeight: '800', fontSize: 14 },
  eventDetail: { marginTop: 2, color: '#64748B', fontSize: 12 },
  eventTime: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  errorCard: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: 24, borderWidth: 1, borderColor: '#FECACA', gap: 8 },
  errorTitle: { fontSize: 18, fontWeight: '800', color: '#991B1B' },
  errorText: { color: '#64748B' },
  skeletonCard: { backgroundColor: '#F8FAFC' },
  skeletonTall: { height: 300, backgroundColor: '#F8FAFC' },
  skeletonEvents: { height: 220, backgroundColor: '#F8FAFC' },
});

export default SystemDashboard;
