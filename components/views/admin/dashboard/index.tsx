import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, LayoutChangeEvent, ScrollView, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { RadarMapCard } from '@/components/dashboard/RadarMapCard';
import { adminNavigationLinks, adminSidebarItems } from '@/components/dashboard/adminNavigation';
import { AlertCard } from '@/components/feedback/AlertCard';
import { Button } from '@/components/foundation/Button';
import { ProgressBar } from '@/components/foundation/ProgressBar';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CardBase } from '@/components/patterns/CardBase';
import { AlertDetailOverlay } from '@/components/views/admin/dashboard/Sub-funcionalidades/AlertDetailOverlay';
import { AlertProtocolOverlay } from '@/components/views/admin/dashboard/Sub-funcionalidades/AlertProtocolOverlay';
import { EpidemiologicalReportOverlay } from '@/components/views/admin/dashboard/Sub-funcionalidades/EpidemiologicalReportOverlay';
import { ExportReportOverlay } from '@/components/views/admin/dashboard/Sub-funcionalidades/ExportReportOverlay';
import { MapZoneDetailOverlay } from '@/components/views/admin/dashboard/Sub-funcionalidades/MapZoneDetailOverlay';
import { MetricDetailOverlay } from '@/components/views/admin/dashboard/Sub-funcionalidades/MetricDetailOverlay';
import {
  AdminDashboardAlert,
  AdminDashboardMetric,
  AdminDashboardZone,
} from '@/components/views/admin/dashboard/Sub-funcionalidades/types';
import {
  AdminDashboardSummaryResponse,
  getAdminDashboardSummary,
} from '@/lib/adminOperational';
import { initialsFromName } from '@/lib/format';

const MAP_IMAGE_URI = 'https://www.figma.com/api/mcp/asset/5bd3e67c-b2d1-4685-9db8-9c8033f3f9f3';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

export function AdminDashboard() {
  const router = useRouter();
  const { logout, profile } = useAuth();
  const [gridWidth, setGridWidth] = useState(0);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [dashboard, setDashboard] = useState<AdminDashboardSummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AdminDashboardAlert | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<AdminDashboardMetric | null>(null);
  const [selectedZone, setSelectedZone] = useState<AdminDashboardZone | null>(null);
  const gridGap = 16;
  const topGap = 12;
  const metricWidth = gridWidth > 0 ? (gridWidth - gridGap * 3) / 4 : undefined;
  const mapWidth = metricWidth ? metricWidth * 2 + gridGap : undefined;
  const topCardWidth = gridWidth > 0 ? (gridWidth - topGap * 5) / 6 : undefined;

  const loadDashboard = useCallback(async () => {
    setLoadState((current) => (current === 'success' ? 'success' : 'loading'));
    setError(null);
    try {
      const data = await getAdminDashboardSummary();
      setDashboard(data);
      setLoadState('success');
    } catch (nextError) {
      setLoadState('error');
      setError(nextError instanceof Error ? nextError.message : 'Unable to load the admin dashboard.');
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const topCards = useMemo(() => {
    if (!dashboard) return [];
    return dashboard.topCards.map((card) => mapMetric(card, dashboard));
  }, [dashboard]);
  const alerts = useMemo(() => (dashboard?.alerts ?? []).map(mapAlert), [dashboard]);
  const mapZones = useMemo(() => positionZones(dashboard?.mapZones ?? []), [dashboard]);
  const actionCards = useMemo(() => dashboard?.recommendedActions ?? [], [dashboard]);

  return (
    <DashboardLayout
      active="dashboard"
      sectionLabel="Dashboard"
      searchPlaceholder="Search hospital metrics..."
      userName={profile?.fullName ?? 'Hospital Admin'}
      userId={profile?.email ?? undefined}
      avatarText={initialsFromName(profile?.fullName)}
      links={adminNavigationLinks}
      sidebarItems={adminSidebarItems}
      onLogout={async () => { await logout(); router.replace('/login'); }}
    >
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroTitle}>
                {dashboard?.hospitalName ? `${dashboard.hospitalName} Radar Overview` : 'Hospital Radar Overview'}
              </Text>
              <Text style={styles.heroSubtitle}>
                {dashboard?.municipalityName && dashboard?.stateName
                  ? `Live operations for ${dashboard.municipalityName}, ${dashboard.stateName}.`
                  : 'Real-time epidemiological monitoring and facility status tracking.'}
              </Text>
            </View>

            <View style={styles.heroActions}>
              <Button
                label="Export Report"
                size="sm"
                variant="secondary"
                leadingIcon={<Feather name="download" size={12} color="#334155" />}
                style={styles.secondaryAction}
                onPress={() => setIsExportOpen(true)}
              />
              <Button
                label="Alert Protocol"
                size="sm"
                variant="primary"
                leadingIcon={<Feather name="star" size={12} color="#FFFFFF" />}
                style={styles.primaryAction}
                onPress={() => setIsProtocolOpen(true)}
              />
            </View>
          </View>

          {error ? (
            <CardBase style={styles.errorCard}>
              <Text style={styles.errorTitle}>Dashboard unavailable</Text>
              <Text style={styles.errorText}>{error}</Text>
            </CardBase>
          ) : null}

          {loadState === 'loading' && !dashboard ? (
            <CardBase style={styles.loadingCard}>
              <ActivityIndicator color="#0003B8" />
              <Text style={styles.loadingText}>Loading operational dashboard...</Text>
            </CardBase>
          ) : (
            <>
              <View style={styles.topCardsRow}>
                {topCards.map((card) => (
                  <OverviewMetricCard
                    key={card.title}
                    {...card}
                    onPress={() => setSelectedMetric(card)}
                    style={
                      topCardWidth
                        ? { width: topCardWidth, minHeight: 132, flex: undefined }
                        : undefined
                    }
                  />
                ))}
              </View>

              <View
                style={styles.dashboardSection}
                onLayout={(event: LayoutChangeEvent) => {
                  const nextWidth = event.nativeEvent.layout.width;
                  if (Math.abs(nextWidth - gridWidth) > 1) {
                    setGridWidth(nextWidth);
                  }
                }}
              >
                <View style={styles.mainGrid}>
                  <RadarMapCard
                    title="Live Heatmap"
                    showOverlayPanel
                    overlayTitle="LIVE HEATMAP"
                    overlayBadgeLabel="SECURE"
                    overlayItems={buildMapOverlayItems(mapZones)}
                    showControls
                    legendItems={[
                      { label: 'Critical', color: '#EF4444' },
                      { label: 'Warning', color: '#F97316' },
                      { label: 'Stable', color: '#0003B8' },
                    ]}
                    footerTextRight={
                      dashboard?.generatedAt
                        ? `Last Sync: ${new Date(dashboard.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : 'Last Sync: Pending'
                    }
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

                  <View style={[styles.alertsPanel, metricWidth ? { width: metricWidth } : null]}>
                    <View style={styles.alertsHeader}>
                      <Text style={styles.alertsTitle}>Contextual Disease Alerts</Text>
                    </View>
                    <View style={styles.alertsList}>
                      {alerts.map((alert) => (
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

                  <PriorityActionsCard
                    actions={actionCards}
                    style={[styles.analyticsCard, metricWidth ? { width: metricWidth, flex: undefined } : null]}
                    onOpenReport={() => setIsReportOpen(true)}
                  />
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
      <ExportReportOverlay visible={isExportOpen} onClose={() => setIsExportOpen(false)} />
      <AlertProtocolOverlay visible={isProtocolOpen} onClose={() => setIsProtocolOpen(false)} />
      <AlertDetailOverlay visible={selectedAlert !== null} alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
      <EpidemiologicalReportOverlay visible={isReportOpen} onClose={() => setIsReportOpen(false)} />
      <MetricDetailOverlay visible={selectedMetric !== null} metric={selectedMetric} onClose={() => setSelectedMetric(null)} />
      <MapZoneDetailOverlay visible={selectedZone !== null} zone={selectedZone} onClose={() => setSelectedZone(null)} />
    </DashboardLayout>
  );
}

interface OverviewMetricCardProps extends AdminDashboardMetric {
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

function OverviewMetricCard({
  title,
  value,
  badge,
  badgeColor = '#94A3B8',
  subtitle,
  progressValue,
  progressColor = '#22C55E',
  segmented = false,
  tone = 'default',
  style,
  onPress,
}: OverviewMetricCardProps) {
  const isCritical = tone === 'critical';

  return (
    <TouchableOpacity activeOpacity={0.84} onPress={onPress} disabled={!onPress}>
      <CardBase style={[styles.metricCard, isCritical && styles.metricCardCritical, style]}>
        <View style={styles.metricHeader}>
          <Text style={[styles.metricTitle, isCritical && styles.metricTitleCritical]}>{title}</Text>
          {badge ? <Text style={[styles.metricBadge, { color: badgeColor }]}>{badge}</Text> : null}
          {isCritical ? (
            <Feather name="alert-triangle" size={14} color="#EF4444" style={styles.metricIcon} />
          ) : null}
        </View>

        <Text style={[styles.metricValue, isCritical && styles.metricValueCritical]}>{value}</Text>

        {subtitle ? (
          <Text style={[styles.metricSubtitle, isCritical && styles.metricSubtitleCritical]}>
            {subtitle}
          </Text>
        ) : null}

        {segmented ? (
          <View style={styles.segmentedBar}>
            <View style={[styles.segmentedFill, { backgroundColor: '#0003B8' }]} />
            <View style={[styles.segmentedFill, { backgroundColor: '#0003B8' }]} />
            <View style={[styles.segmentedFill, { backgroundColor: '#CBD5E1' }]} />
          </View>
        ) : progressValue !== undefined ? (
          <ProgressBar
            value={progressValue}
            color={progressColor}
            trackColor={isCritical ? '#FEE2E2' : '#E2E8F0'}
            style={styles.metricProgress}
          />
        ) : null}
      </CardBase>
    </TouchableOpacity>
  );
}

function PriorityActionsCard({
  actions,
  style,
  onOpenReport,
}: {
  actions: AdminDashboardSummaryResponse['recommendedActions'];
  style?: StyleProp<ViewStyle>;
  onOpenReport?: () => void;
}) {
  return (
    <CardBase style={[styles.caseCard, style]}>
      <View style={styles.caseHeader}>
        <Text style={styles.caseTitle}>Priority Actions</Text>
        <Button
          label="Live Feed"
          size="sm"
          variant="surface"
          style={styles.caseFilter}
          labelStyle={styles.caseFilterLabel}
        />
      </View>

      <Text style={styles.caseSectionLabel}>Operational Queue</Text>

      <View style={styles.caseMetrics}>
        {actions.slice(0, 5).map((action) => (
          <View key={action.id} style={styles.actionMetricRow}>
            <View style={styles.actionMetricTopRow}>
              <Text style={styles.caseMetricName}>{action.title}</Text>
              <Text style={styles.caseMetricValue}>{action.status.replace(/_/g, ' ')}</Text>
            </View>
            <View style={styles.caseMetricTrack}>
              <View
                style={[
                  styles.caseMetricFill,
                  {
                    width: `${severityToProgress(action.severity)}%`,
                    backgroundColor: severityToColor(action.severity),
                  },
                ]}
              />
            </View>
            <Text style={styles.actionMetricMeta}>
              {action.type.replace(/_/g, ' ')} | {action.severity.toLowerCase()} priority
            </Text>
          </View>
        ))}
      </View>

      <Button
        label="View Full Epidemiological Report"
        variant="secondary"
        size="sm"
        style={styles.caseAction}
        labelStyle={styles.caseActionLabel}
        onPress={onOpenReport}
      />
    </CardBase>
  );
}

function mapMetric(
  metric: AdminDashboardSummaryResponse['topCards'][number],
  summary: AdminDashboardSummaryResponse,
): AdminDashboardMetric {
  const title = metric.title;
  const status = (metric.status ?? '').toUpperCase();
  const recommendedAction =
    summary.recommendedActions.find((action) => action.type === metric.id?.toUpperCase())?.title
    ?? `Review ${title.toLowerCase()} and keep the operational team aligned.`;

  return {
    title,
    value: metric.value,
    badge: metric.badge ?? undefined,
    badgeColor: status.includes('CRITICAL') ? '#EF4444' : status.includes('WARNING') ? '#F59E0B' : '#22C55E',
    subtitle: metric.subtitle ?? undefined,
    progressValue: deriveProgress(metric.value, metric.status),
    progressColor: status.includes('CRITICAL') ? '#EF4444' : status.includes('WARNING') ? '#F59E0B' : '#22C55E',
    segmented: title.toUpperCase().includes('OXYGEN'),
    tone: status.includes('CRITICAL') ? 'critical' : 'default',
    detailTitle: title,
    detailSummary: metric.subtitle ?? `Live operational signal for ${title.toLowerCase()}.`,
    signalLabel: metric.status ?? 'Stable',
    recommendedAction,
  };
}

function mapAlert(alert: AdminDashboardSummaryResponse['alerts'][number]): AdminDashboardAlert {
  return {
    id: alert.id,
    title: `${alert.disease} alert`,
    description: `${alert.message} (${alert.caseCount} active cases).`,
    variant: alert.severity === 'HIGH' ? 'critical' : alert.severity === 'MEDIUM' ? 'warning' : 'info',
    department: alert.location,
    priority: alert.severity,
    recommendedAction: `Review containment measures for ${alert.location} and adjust staffing if case pressure rises.`,
  };
}

function positionZones(zones: AdminDashboardSummaryResponse['mapZones']): AdminDashboardZone[] {
  if (zones.length === 0) return [];
  const latitudes = zones.map((zone) => zone.latitude);
  const longitudes = zones.map((zone) => zone.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLon = Math.min(...longitudes);
  const maxLon = Math.max(...longitudes);
  const latRange = Math.max(maxLat - minLat, 0.01);
  const lonRange = Math.max(maxLon - minLon, 0.01);

  return zones.map((zone) => {
    const top = 18 + ((maxLat - zone.latitude) / latRange) * 64;
    const left = 18 + ((zone.longitude - minLon) / lonRange) * 64;
    const risk = zone.status.replace(/_/g, ' ');
    return {
      id: zone.municipalityId,
      name: zone.municipalityName,
      risk,
      disease: zone.outbreakCount === 1 ? '1 outbreak signal' : `${zone.outbreakCount} outbreak signals`,
      cases: `${zone.outbreakCount} active cluster${zone.outbreakCount === 1 ? '' : 's'}`,
      radius: 'Regional monitoring',
      priority: zone.status.toUpperCase().includes('CRITICAL') ? 'Immediate' : zone.status.toUpperCase().includes('WARNING') ? 'High' : 'Monitor',
      note: `${zone.municipalityName} is being tracked as part of the hospital alert perimeter.`,
      recommendedAction: `Coordinate intake planning against the ${zone.outbreakCount} outbreak signal(s) in ${zone.municipalityName}.`,
      top: `${Math.max(12, Math.min(82, top))}%`,
      left: `${Math.max(12, Math.min(82, left))}%`,
      borderColor: zone.status.toUpperCase().includes('CRITICAL') ? '#EF4444' : zone.status.toUpperCase().includes('WARNING') ? '#F97316' : '#0003B8',
    };
  });
}

function buildMapOverlayItems(zones: AdminDashboardZone[]) {
  const critical = zones.filter((zone) => zone.borderColor === '#EF4444').length;
  const warning = zones.filter((zone) => zone.borderColor === '#F97316').length;
  return [
    { label: 'Critical zones', value: String(critical), color: '#EF4444' },
    { label: 'Warning zones', value: String(warning), color: '#F97316' },
    { label: 'Tracked municipalities', value: String(zones.length), color: '#0003B8' },
  ];
}

function deriveProgress(value: string, status?: string | null) {
  const ratioMatch = value.match(/(\d+)\s*\/\s*(\d+)/);
  if (ratioMatch) {
    const current = Number.parseInt(ratioMatch[1], 10);
    const total = Number.parseInt(ratioMatch[2], 10);
    if (total > 0) return Math.round((current / total) * 100);
  }
  const percentMatch = value.match(/(\d+)%/);
  if (percentMatch) return Number.parseInt(percentMatch[1], 10);
  if ((status ?? '').toUpperCase().includes('CRITICAL')) return 92;
  if ((status ?? '').toUpperCase().includes('WARNING')) return 68;
  return 48;
}

function severityToColor(value: string) {
  if (value === 'HIGH') return '#EF4444';
  if (value === 'MEDIUM') return '#F59E0B';
  return '#1215C9';
}

function severityToProgress(value: string) {
  if (value === 'HIGH') return 92;
  if (value === 'MEDIUM') return 64;
  return 38;
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 32,
  },
  container: {
    padding: 32,
    gap: 24,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 20,
  },
  heroTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  heroSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: '#64748B',
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryAction: {
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  primaryAction: {
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: '#0003B8',
    borderColor: '#0003B8',
  },
  errorCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  errorTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: '#991B1B',
  },
  errorText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: '#B91C1C',
  },
  loadingCard: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#526174',
  },
  topCardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minHeight: 132,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  metricCardCritical: {
    backgroundColor: '#FFF7F7',
    borderColor: '#FECACA',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 8,
  },
  metricTitle: {
    flex: 1,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 0.9,
    color: '#7A8CA5',
  },
  metricTitleCritical: {
    color: '#EF4444',
  },
  metricBadge: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '800',
  },
  metricIcon: {
    marginTop: 1,
  },
  metricValue: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.8,
  },
  metricValueCritical: {
    color: '#DC2626',
  },
  metricSubtitle: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 15,
    color: '#94A3B8',
  },
  metricSubtitleCritical: {
    color: '#EF4444',
  },
  metricProgress: {
    marginTop: 10,
  },
  segmentedBar: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  segmentedFill: {
    flex: 1,
    height: 5,
    borderRadius: 999,
  },
  dashboardSection: {
    gap: 16,
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
  analyticsCard: {
    flexShrink: 0,
    minHeight: 540,
  },
  caseCard: {
    flexShrink: 0,
    minHeight: 540,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  caseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 8,
  },
  caseTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  caseFilter: {
    minHeight: 28,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  caseFilterLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#475569',
  },
  caseSectionLabel: {
    marginBottom: 12,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: '#7387A5',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  caseMetrics: {
    gap: 14,
    marginBottom: 24,
  },
  actionMetricRow: {
    gap: 7,
  },
  actionMetricTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionMetricMeta: {
    fontSize: 12,
    lineHeight: 16,
    color: '#70839B',
  },
  caseMetricName: {
    flex: 1,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
    color: '#243347',
  },
  caseMetricValue: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
    color: '#243347',
  },
  caseMetricTrack: {
    height: 5,
    borderRadius: 999,
    backgroundColor: '#E8EDF5',
    overflow: 'hidden',
  },
  caseMetricFill: {
    height: '100%',
    borderRadius: 999,
  },
  caseAction: {
    marginTop: 'auto',
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  caseActionLabel: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: '#243347',
  },
});

export default AdminDashboard;
