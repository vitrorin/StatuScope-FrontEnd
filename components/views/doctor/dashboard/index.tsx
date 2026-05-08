import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RadarMapCard } from '@/components/dashboard/RadarMapCard';
import { AlertCard } from '@/components/feedback/AlertCard';
import { DiseaseBreakdownCard } from '@/components/dashboard/DiseaseBreakdownCard';
import { AlertDetailOverlay } from '@/components/views/doctor/dashboard/Sub-funcionalidades/AlertDetailOverlay';
import { EpidemiologicalReportOverlay } from '@/components/views/doctor/dashboard/Sub-funcionalidades/EpidemiologicalReportOverlay';
import { MapZoneDetailOverlay } from '@/components/views/doctor/dashboard/Sub-funcionalidades/MapZoneDetailOverlay';
import { MetricDetailOverlay } from '@/components/views/doctor/dashboard/Sub-funcionalidades/MetricDetailOverlay';
import {
  DoctorDashboardAlert,
  DoctorDashboardMetric,
  DoctorDashboardZone,
} from '@/components/views/doctor/dashboard/Sub-funcionalidades/types';
import { initialsFromName } from '@/lib/format';
import {
  DoctorDashboardAlertResponse,
  DoctorDashboardBreakdownResponse,
  DoctorDashboardDiseaseResponse,
  DoctorDashboardMapResponse,
  DoctorDashboardMetricResponse,
  getDoctorDashboardAlerts,
  getDoctorDashboardLocalBreakdown,
  getDoctorDashboardMap,
  getDoctorDashboardMetrics,
  getDoctorDashboardStateBreakdown,
} from '@/lib/doctorDashboard';
import { useTranslation } from '@/i18n';
import { translateDiseaseName } from '@/lib/diseaseLocalization';
import { translateDashboardBadge, translateDashboardValue } from '@/lib/dashboardLocalization';

const MAP_IMAGE_URI = 'https://www.figma.com/api/mcp/asset/5bd3e67c-b2d1-4685-9db8-9c8033f3f9f3';

const navigationLinks = {
  dashboard: '/dashboard/doctor',
  diagnosis: '/diagnosis',
  analytics: '/analytics',
} as const;

type SectionStatus = 'idle' | 'loading' | 'success' | 'error';

interface SectionState<T> {
  status: SectionStatus;
  data: T | null;
  error: string | null;
}

function initialSectionState<T>(): SectionState<T> {
  return { status: 'idle', data: null, error: null };
}

function formatSyncTime(value: string | undefined, t: (key: string, params?: Record<string, string | number>) => string): string {
  if (!value) return t('doctor.dashboard.map.lastSyncPending');
  return t('doctor.dashboard.map.lastSync', {
    time: new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

function positionZones(zones: DoctorDashboardMapResponse['zones']): DoctorDashboardZone[] {
  if (zones.length === 0) return [];

  const zonesWithCoordinates = zones.filter(
    (zone) => typeof zone.latitude === 'number' && typeof zone.longitude === 'number',
  );
  if (zonesWithCoordinates.length === 0) {
    return zones.map((zone, index) => ({
      ...zone,
      top: `${32 + index * 8}%`,
      left: `${44 + index * 6}%`,
      borderColor: zone.borderColor || (index === 0 ? '#0003B8' : '#F97316'),
    }));
  }

  const latitudes = zonesWithCoordinates.map((zone) => zone.latitude as number);
  const longitudes = zonesWithCoordinates.map((zone) => zone.longitude as number);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLon = Math.min(...longitudes);
  const maxLon = Math.max(...longitudes);
  const latRange = Math.max(maxLat - minLat, 0.01);
  const lonRange = Math.max(maxLon - minLon, 0.01);

  return zones.map((zone, index) => {
    const latitude = typeof zone.latitude === 'number' ? zone.latitude : minLat + latRange / 2;
    const longitude = typeof zone.longitude === 'number' ? zone.longitude : minLon + lonRange / 2;
    const top = 18 + ((maxLat - latitude) / latRange) * 64;
    const left = 18 + ((longitude - minLon) / lonRange) * 64;

    return {
      ...zone,
      top: `${Math.max(12, Math.min(82, top))}%`,
      left: `${Math.max(12, Math.min(82, left))}%`,
      borderColor: zone.borderColor || (index === 0 ? '#0003B8' : '#F97316'),
    };
  });
}

function statusLabel(value: string | undefined, t: (key: string) => string): string {
  if (value === 'CONFIRMED') return t('common.statuses.confirmed');
  if (value === 'SUSPECTED') return t('common.statuses.suspected');
  return value ?? '';
}

function describeAlert(
  alert: DoctorDashboardAlert,
  t: (key: string, params?: Record<string, string | number>) => string,
): DoctorDashboardAlert {
  const match = alert.description.match(/^([\d,]+) active cases? in (.+)\. Status: (.+)\.$/);
  const rawDiseaseName = alert.title.replace(/ activity$/, '');
  const diseaseName = translateDiseaseName(t, rawDiseaseName);
  if (!match) {
    return {
      ...alert,
      title: t('doctor.dashboard.alerts.activityTitle', { disease: diseaseName }),
      priority: translateDashboardValue(t, alert.priority),
    };
  }

  const [, count, area, status] = match;
  return {
    ...alert,
    title: t('doctor.dashboard.alerts.activityTitle', {
      disease: diseaseName,
    }),
    description: t('doctor.dashboard.alerts.activityDescription', {
      cases: t('common.units.activeCases', { count }),
      area,
      status: statusLabel(status, t),
    }),
    priority: translateDashboardValue(t, alert.priority),
  };
}

function toMetric(
  metric: DoctorDashboardMetricResponse,
  t: (key: string, params?: Record<string, string | number>) => string,
): DoctorDashboardMetric {
  const title = t(`doctor.dashboard.metrics.${metric.id}.title`);
  const value = metric.id === 'highest-case-disease'
    ? translateDiseaseName(t, metric.value)
    : translateDashboardValue(t, metric.value);

  return {
    title,
    value,
    badge: translateDashboardBadge(t, metric.badge ?? undefined),
    status: metric.status ?? 'neutral',
    subtitle: t(`doctor.dashboard.metrics.${metric.id}.subtitle`) || (metric.subtitle ?? undefined),
    detailTitle: title,
    detailSummary: t(`doctor.dashboard.metrics.${metric.id}.detailSummary`),
    signalLabel: t(`doctor.dashboard.metrics.${metric.id}.signalLabel`),
    recommendedAction: t(`doctor.dashboard.metrics.${metric.id}.recommendedAction`),
    iconKey: metric.iconKey ?? undefined,
  };
}

function buildDiseaseRows(
  diseases: DoctorDashboardDiseaseResponse[],
  t: (key: string, params?: Record<string, string | number>) => string,
) {
  return diseases.map((disease) => ({
    id: disease.diseaseName,
    label: translateDiseaseName(t, disease.diseaseName).toUpperCase(),
    valueText: t(disease.caseCount === 1 ? 'common.units.case' : 'common.units.cases', {
      count: formatNumber(disease.caseCount),
    }),
    progress: disease.progress,
    barColor: '#1718C7',
    barHeight: 12,
  }));
}

function SkeletonLine({ width, height = 12, style }: { width: number | string; height?: number; style?: object }) {
  return <View style={[styles.skeletonLine, { width, height }, style]} />;
}

function RetryOverlay({
  label,
  onRetry,
}: {
  label: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.retryOverlay}>
      <TouchableOpacity style={styles.retryButton} activeOpacity={0.82} onPress={onRetry}>
        <Feather name="refresh-cw" size={18} color="#0003B8" />
        <Text style={styles.retryText}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
}

function MetricSkeleton({ width }: { width?: number }) {
  return (
    <View style={[styles.metricSkeleton, width ? { width } : styles.metricTouchable]}>
      <View style={styles.skeletonHeader}>
        <SkeletonLine width="42%" />
        <SkeletonLine width={48} height={22} />
      </View>
      <SkeletonLine width="62%" height={34} />
      <SkeletonLine width="78%" height={12} style={styles.skeletonSpaced} />
    </View>
  );
}

function MapSkeleton({ width }: { width?: number }) {
  return (
    <View style={[styles.mapSkeleton, width ? { width, flex: undefined } : null]}>
      <View style={styles.skeletonMapOverlay}>
        <SkeletonLine width={130} height={18} />
        <SkeletonLine width={70} height={22} />
      </View>
      <View style={styles.skeletonPinLarge} />
      <View style={styles.skeletonPinSmall} />
      <View style={styles.skeletonMapFooter}>
        <SkeletonLine width={160} />
        <SkeletonLine width={130} />
      </View>
    </View>
  );
}

function AlertsSkeleton({ width }: { width?: number }) {
  return (
    <View style={[styles.alertsPanel, width ? { width } : null]}>
      <View style={styles.alertsHeader}>
        <SkeletonLine width={230} height={20} />
      </View>
      <View style={styles.alertsList}>
        {[0, 1, 2].map((item) => (
          <View key={item} style={styles.alertSkeletonItem}>
            <SkeletonLine width="48%" height={16} />
            <SkeletonLine width="84%" />
            <SkeletonLine width="64%" />
          </View>
        ))}
      </View>
    </View>
  );
}

function BreakdownSkeleton() {
  return (
    <View style={[styles.breakdownCard, styles.breakdownSkeleton]}>
      <SkeletonLine width={230} height={20} />
      <View style={styles.breakdownSkeletonRows}>
        {[0, 1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.breakdownSkeletonRow}>
            <View style={styles.breakdownSkeletonLabels}>
              <SkeletonLine width="34%" height={13} />
              <SkeletonLine width={92} height={13} />
            </View>
            <SkeletonLine width="100%" height={12} />
          </View>
        ))}
      </View>
      <View style={styles.breakdownSkeletonSummary}>
        <SkeletonLine width="100%" />
        <SkeletonLine width="82%" />
      </View>
      <SkeletonLine width="100%" height={52} />
    </View>
  );
}

export function DoctorDashboard() {
  const router = useRouter();
  const { logout, profile } = useAuth();
  const { t } = useTranslation();
  const [metricsState, setMetricsState] = useState<SectionState<{
    metrics: DoctorDashboardMetricResponse[];
    hospitalName?: string | null;
  }>>(initialSectionState);
  const [mapState, setMapState] = useState<SectionState<DoctorDashboardMapResponse>>(initialSectionState);
  const [alertsState, setAlertsState] = useState<SectionState<{ alerts: DoctorDashboardAlertResponse[] }>>(initialSectionState);
  const [localBreakdownState, setLocalBreakdownState] = useState<SectionState<DoctorDashboardBreakdownResponse>>(initialSectionState);
  const [stateBreakdownState, setStateBreakdownState] = useState<SectionState<DoctorDashboardBreakdownResponse>>(initialSectionState);
  const [gridWidth, setGridWidth] = useState(0);
  const [selectedMetric, setSelectedMetric] = useState<DoctorDashboardMetric | null>(null);
  const [selectedZone, setSelectedZone] = useState<DoctorDashboardZone | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<DoctorDashboardAlert | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const gridGap = 16;
  const metricWidth = gridWidth > 0 ? (gridWidth - gridGap * 3) / 4 : undefined;
  const mapWidth = metricWidth ? metricWidth * 2 + gridGap : undefined;

  const loadMetrics = useCallback(async () => {
    setMetricsState((current) => ({ ...current, status: 'loading', error: null }));
    try {
      const data = await getDoctorDashboardMetrics();
      setMetricsState({ status: 'success', data, error: null });
    } catch (error) {
      setMetricsState((current) => ({
        status: 'error',
        data: current.data,
        error: error instanceof Error ? error.message : 'Unable to load dashboard metrics.',
      }));
    }
  }, []);

  const loadMap = useCallback(async () => {
    setMapState((current) => ({ ...current, status: 'loading', error: null }));
    try {
      const data = await getDoctorDashboardMap();
      setMapState({ status: 'success', data, error: null });
    } catch (error) {
      setMapState((current) => ({
        status: 'error',
        data: current.data,
        error: error instanceof Error ? error.message : 'Unable to load map data.',
      }));
    }
  }, []);

  const loadAlerts = useCallback(async () => {
    setAlertsState((current) => ({ ...current, status: 'loading', error: null }));
    try {
      const data = await getDoctorDashboardAlerts();
      setAlertsState({ status: 'success', data, error: null });
    } catch (error) {
      setAlertsState((current) => ({
        status: 'error',
        data: current.data,
        error: error instanceof Error ? error.message : 'Unable to load alerts.',
      }));
    }
  }, []);

  const loadLocalBreakdown = useCallback(async () => {
    setLocalBreakdownState((current) => ({ ...current, status: 'loading', error: null }));
    try {
      const data = await getDoctorDashboardLocalBreakdown();
      setLocalBreakdownState({ status: 'success', data, error: null });
    } catch (error) {
      setLocalBreakdownState((current) => ({
        status: 'error',
        data: current.data,
        error: error instanceof Error ? error.message : 'Unable to load local breakdown.',
      }));
    }
  }, []);

  const loadStateBreakdown = useCallback(async () => {
    setStateBreakdownState((current) => ({ ...current, status: 'loading', error: null }));
    try {
      const data = await getDoctorDashboardStateBreakdown();
      setStateBreakdownState({ status: 'success', data, error: null });
    } catch (error) {
      setStateBreakdownState((current) => ({
        status: 'error',
        data: current.data,
        error: error instanceof Error ? error.message : 'Unable to load state breakdown.',
      }));
    }
  }, []);

  useEffect(() => {
    void loadMetrics();
    void loadMap();
    void loadAlerts();
    void loadLocalBreakdown();
    void loadStateBreakdown();
  }, [loadAlerts, loadLocalBreakdown, loadMap, loadMetrics, loadStateBreakdown]);

  const topMetrics = useMemo(
    () => metricsState.data?.metrics.map((metric) => toMetric(metric, t)) ?? [],
    [metricsState.data?.metrics, t],
  );
  const alerts = useMemo(
    () => (alertsState.data?.alerts ?? []).map((alert) => describeAlert(alert, t)),
    [alertsState.data?.alerts, t],
  );
  const mapZones = useMemo(
    () => positionZones(mapState.data?.zones ?? []).map((zone) => ({
      ...zone,
      risk: translateDashboardValue(t, zone.risk),
      disease: translateDiseaseName(t, zone.disease),
      cases: translateDashboardValue(t, zone.cases),
      radius: translateDashboardValue(t, zone.radius),
      priority: translateDashboardValue(t, zone.priority),
    })),
    [mapState.data?.zones, t],
  );
  const totalCases = useMemo(
    () => localBreakdownState.data?.diseaseBreakdown.reduce((total, disease) => total + disease.caseCount, 0) ?? 0,
    [localBreakdownState.data?.diseaseBreakdown],
  );
  const totalStateCases = useMemo(
    () => stateBreakdownState.data?.diseaseBreakdown.reduce((total, disease) => total + disease.caseCount, 0) ?? 0,
    [stateBreakdownState.data?.diseaseBreakdown],
  );
  const hospitalName = metricsState.data?.hospitalName ?? profile?.hospitalName ?? profile?.email;
  const stateName = localBreakdownState.data?.stateName
    ?? stateBreakdownState.data?.stateName
    ?? t('doctor.dashboard.diseaseBreakdown.hospitalRegion');

  return (
    <DashboardLayout
      active="dashboard"
      sectionLabel={t('doctor.dashboard.sectionLabel')}
      searchPlaceholder={t('doctor.dashboard.searchPlaceholder')}
      userName={profile?.fullName ?? 'Doctor'}
      userId={hospitalName}
      avatarText={initialsFromName(profile?.fullName)}
      links={navigationLinks}
      onLogout={async () => { await logout(); router.replace('/login'); }}
    >
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
        <View
          style={styles.metricsRow}
          onLayout={(event: LayoutChangeEvent) => {
            const nextWidth = event.nativeEvent.layout.width;
            if (Math.abs(nextWidth - gridWidth) > 1) {
              setGridWidth(nextWidth);
            }
          }}
        >
          {metricsState.status === 'loading' || metricsState.status === 'idle' ? (
            [0, 1, 2, 3].map((item) => (
              <MetricSkeleton key={item} width={metricWidth} />
            ))
          ) : metricsState.status === 'error' ? (
            [0, 1, 2, 3].map((item) => (
              <View
                key={item}
                style={[styles.retryHost, metricWidth ? { width: metricWidth } : styles.metricTouchable]}
              >
                <MetricSkeleton />
                <RetryOverlay label={t('doctor.dashboard.retry')} onRetry={loadMetrics} />
              </View>
            ))
          ) : topMetrics.map((metric) => (
            <TouchableOpacity
              key={metric.title}
              activeOpacity={0.84}
              onPress={() => setSelectedMetric(metric)}
              style={metricWidth ? { width: metricWidth } : styles.metricTouchable}
            >
              <StatCard
                title={metric.title}
                value={metric.value}
                badge={metric.badge}
                status={metric.status}
                subtitle={metric.subtitle}
                style={[styles.metricCard, metricWidth ? { width: undefined, flex: undefined } : null]}
                icon={
                  metric.iconKey === 'trend' ? (
                    <Feather name="trending-up" size={14} color="#94A3B8" />
                  ) : undefined
                }
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.mainGrid}>
          {mapState.status === 'loading' || mapState.status === 'idle' ? (
            <MapSkeleton width={mapWidth} />
          ) : mapState.status === 'error' ? (
            <View style={[styles.retryHost, mapWidth ? { width: mapWidth } : styles.mapCard]}>
              <MapSkeleton />
              <RetryOverlay label={t('doctor.dashboard.retry')} onRetry={loadMap} />
            </View>
          ) : (
            <RadarMapCard
              title={t('doctor.dashboard.map.title')}
              showOverlayPanel
              overlayTitle={t('doctor.dashboard.map.overlayTitle').toUpperCase()}
              overlayBadgeLabel={t('doctor.dashboard.map.secure').toUpperCase()}
              overlayItems={(mapState.data?.diseaseBreakdown ?? []).slice(0, 3).map((disease, index) => ({
                label: translateDiseaseName(t, disease.diseaseName),
                value: formatNumber(disease.caseCount),
                color: index === 0 ? '#EF4444' : index === 1 ? '#F97316' : '#0003B8',
              }))}
              showControls
              legendItems={[
                { label: t('doctor.dashboard.map.highRisk'), color: '#EF4444' },
                { label: t('doctor.dashboard.map.emerging'), color: '#FB923C' },
                { label: t('doctor.dashboard.map.hospitalNode'), color: '#0003B8' },
              ]}
              footerTextRight={formatSyncTime(mapState.data?.generatedAt, t)}
              mapImageUri={MAP_IMAGE_URI}
              pins={mapZones.map((zone) => ({
                id: zone.id,
                top: zone.top,
                left: zone.left,
                borderColor: zone.borderColor,
                fillColor: '#FFFFFF',
                icon:
                  zone.borderColor === '#0003B8' ? (
                    <MaterialCommunityIcons name="hospital-box-outline" size={12} color="#0003B8" />
                  ) : zone.borderColor === '#F97316' ? (
                    <MaterialCommunityIcons name="virus-outline" size={14} color="#F97316" />
                  ) : (
                    <MaterialCommunityIcons name="alert" size={16} color="#EF4444" />
                  ),
                onPress: () => setSelectedZone(zone),
              }))}
              style={[styles.mapCard, mapWidth ? { width: mapWidth, flex: undefined } : null]}
            />
          )}

          {alertsState.status === 'loading' || alertsState.status === 'idle' ? (
            <AlertsSkeleton width={mapWidth} />
          ) : alertsState.status === 'error' ? (
            <View style={[styles.retryHost, mapWidth ? { width: mapWidth } : null]}>
              <AlertsSkeleton />
              <RetryOverlay label={t('doctor.dashboard.retry')} onRetry={loadAlerts} />
            </View>
          ) : (
            <View
              style={[styles.alertsPanel, mapWidth ? { width: mapWidth } : null]}
            >
              <View style={styles.alertsHeader}>
                <Text style={styles.alertsTitle}>{t('doctor.dashboard.alerts.title')}</Text>
              </View>
              <View style={styles.alertsList}>
                {alerts.length === 0 ? (
                  <AlertCard
                    title={t('doctor.dashboard.alerts.emptyTitle')}
                    description={t('doctor.dashboard.alerts.emptyDescription')}
                    variant="neutral"
                    style={styles.alertCard}
                  />
                ) : alerts.map((alert) => (
                  <TouchableOpacity
                    key={alert.id}
                    activeOpacity={0.8}
                    onPress={() => setSelectedAlert(alert)}
                  >
                    <AlertCard
                      title={alert.title}
                      description={alert.description}
                      variant={alert.variant}
                      style={styles.alertCard}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

        </View>

        <View style={styles.breakdownGrid}>
          {localBreakdownState.status === 'loading' || localBreakdownState.status === 'idle' ? (
            <BreakdownSkeleton />
          ) : localBreakdownState.status === 'error' ? (
            <View style={[styles.retryHost, styles.breakdownRetryHost]}>
              <BreakdownSkeleton />
              <RetryOverlay label={t('doctor.dashboard.retry')} onRetry={loadLocalBreakdown} />
            </View>
          ) : (
            <DiseaseBreakdownCard
              title={t('doctor.dashboard.diseaseBreakdown.localTitle')}
              rows={buildDiseaseRows(localBreakdownState.data?.diseaseBreakdown ?? [], t)}
              summaryItems={[
                { label: t('doctor.dashboard.diseaseBreakdown.totalActiveCases'), value: formatNumber(totalCases) },
                { label: t('doctor.dashboard.diseaseBreakdown.outbreakContext'), value: stateName },
              ]}
              buttonLabel={t('doctor.dashboard.diseaseBreakdown.exportReport')}
              onButtonPress={() => setIsReportOpen(true)}
              style={styles.breakdownCard}
            />
          )}

          {stateBreakdownState.status === 'loading' || stateBreakdownState.status === 'idle' ? (
            <BreakdownSkeleton />
          ) : stateBreakdownState.status === 'error' ? (
            <View style={[styles.retryHost, styles.breakdownRetryHost]}>
              <BreakdownSkeleton />
              <RetryOverlay label={t('doctor.dashboard.retry')} onRetry={loadStateBreakdown} />
            </View>
          ) : (
            <DiseaseBreakdownCard
              title={t('doctor.dashboard.diseaseBreakdown.stateTitle')}
              rows={buildDiseaseRows(stateBreakdownState.data?.diseaseBreakdown ?? [], t)}
              summaryItems={[
                { label: t('doctor.dashboard.diseaseBreakdown.totalStateCases'), value: formatNumber(totalStateCases) },
                { label: t('doctor.dashboard.diseaseBreakdown.stateContext'), value: stateName },
              ]}
              buttonLabel={t('doctor.dashboard.diseaseBreakdown.exportReport')}
              onButtonPress={() => setIsReportOpen(true)}
              style={styles.breakdownCard}
            />
          )}
        </View>
        </View>
      </ScrollView>
      <MetricDetailOverlay visible={selectedMetric !== null} metric={selectedMetric} onClose={() => setSelectedMetric(null)} />
      <MapZoneDetailOverlay visible={selectedZone !== null} zone={selectedZone} onClose={() => setSelectedZone(null)} />
      <AlertDetailOverlay visible={selectedAlert !== null} alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
      <EpidemiologicalReportOverlay visible={isReportOpen} onClose={() => setIsReportOpen(false)} />
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 32,
  },
  container: {
    padding: 32,
    gap: 32,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: 0,
  },
  metricTouchable: {
    flex: 1,
  },
  retryHost: {
    position: 'relative',
    overflow: 'hidden',
  },
  retryOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.72)',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 3, 184, 0.14)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  retryText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: '#0003B8',
  },
  skeletonLine: {
    borderRadius: 999,
    backgroundColor: '#E8EEF6',
  },
  skeletonSpaced: {
    marginTop: 14,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 26,
    gap: 12,
  },
  metricSkeleton: {
    flex: 1,
    minHeight: 152,
    padding: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FEFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 26,
    elevation: 3,
  },
  mapSkeleton: {
    flex: 1,
    height: 560,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 3, 184, 0.05)',
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  skeletonMapOverlay: {
    position: 'absolute',
    top: 24,
    left: 24,
    width: 214,
    padding: 16,
    gap: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
  },
  skeletonPinLarge: {
    position: 'absolute',
    top: '42%',
    left: '52%',
    width: 220,
    height: 160,
    borderRadius: 999,
    backgroundColor: 'rgba(226, 232, 240, 0.85)',
  },
  skeletonPinSmall: {
    position: 'absolute',
    top: '28%',
    left: '60%',
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  skeletonMapFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 58,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  alertSkeletonItem: {
    minHeight: 96,
    gap: 12,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 4,
    borderLeftColor: '#E2E8F0',
  },
  breakdownSkeleton: {
    backgroundColor: '#FFFFFF',
  },
  breakdownSkeletonRows: {
    marginTop: 28,
    marginBottom: 24,
    gap: 22,
  },
  breakdownSkeletonRow: {
    gap: 10,
  },
  breakdownSkeletonLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  breakdownSkeletonSummary: {
    paddingTop: 22,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 18,
    gap: 14,
  },
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: 'rgba(0, 3, 184, 0.12)',
  },
  loadingText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#000F6B',
  },
  errorBanner: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#991B1B',
  },
  errorText: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 20,
    color: '#B91C1C',
  },
  mainGrid: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  mapCard: {
    flexShrink: 0,
    alignSelf: 'stretch',
  },
  alertsPanel: {
    flexShrink: 0,
    backgroundColor: '#FCFDFE',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 26,
    elevation: 3,
    alignSelf: 'stretch',
  },
  alertsHeader: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  alertsTitle: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
  alertsList: {
    padding: 24,
    gap: 16,
    flexDirection: 'column',
  },
  alertCard: {
    width: '100%',
    minHeight: 0,
  },
  breakdownGrid: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'stretch',
  },
  breakdownCard: {
    flex: 1,
    width: undefined,
    minHeight: 540,
  },
  breakdownRetryHost: {
    flex: 1,
    minHeight: 540,
  },
});

export default DoctorDashboard;
