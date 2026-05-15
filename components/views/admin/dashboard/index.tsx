import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, LayoutChangeEvent, Modal, Pressable, ScrollView, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
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

<<<<<<< Updated upstream
const VISIBLE_ALERTS_LIMIT = 3;

=======
>>>>>>> Stashed changes
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
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AdminDashboardAlert | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<AdminDashboardMetric | null>(null);
  const [selectedZone, setSelectedZone] = useState<AdminDashboardZone | null>(null);
  const [isMoreAlertsOpen, setIsMoreAlertsOpen] = useState(false);
  const [isMapHovered, setIsMapHovered] = useState(false);
  const gridGap = 16;
  const topGap = 12;
  const metricWidth = gridWidth > 0 ? (gridWidth - gridGap * 3) / 4 : undefined;
  const mapWidth = metricWidth ? metricWidth * 2 + gridGap : undefined;
  const topCardWidth = gridWidth > 0 ? (gridWidth - topGap * 3) / 4 : undefined;

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
<<<<<<< Updated upstream
  const visibleAlerts = useMemo(() => alerts.slice(0, VISIBLE_ALERTS_LIMIT), [alerts]);
  const remainingAlerts = useMemo(() => alerts.slice(VISIBLE_ALERTS_LIMIT), [alerts]);
  const mapZones = useMemo(() => positionZones(dashboard?.mapZones ?? []), [dashboard]);
  const mapCenter = useMemo(() => getAdminMapCenter(mapZones), [mapZones]);
  const mapBounds = useMemo(() => getAdminMapBounds(mapCenter), [mapCenter]);
=======
  const visibleAlerts = useMemo(() => (showAllAlerts ? alerts : alerts.slice(0, 3)), [alerts, showAllAlerts]);
  const hiddenAlertsCount = Math.max(0, alerts.length - visibleAlerts.length);
  const mapZones = useMemo(() => positionZones(dashboard?.mapZones ?? []), [dashboard]);
  const mapCenter = useMemo(() => getMapCenter(mapZones), [mapZones]);
  const mapBounds = useMemo(() => getMapBounds(mapZones), [mapZones]);
>>>>>>> Stashed changes
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
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false} scrollEnabled={!isMapHovered}>
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
                {topCards.length === 0 && loadState === 'success' ? (
                  <CardBase style={styles.emptyStateCard}>
                    <Feather name="bar-chart-2" size={24} color="#94A3B8" />
                    <Text style={styles.emptyStateTitle}>No metrics available</Text>
                    <Text style={styles.emptyStateSubtitle}>Operational metrics will appear once the dashboard is populated.</Text>
                  </CardBase>
                ) : (
                  topCards.map((card) => (
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
                  ))
                )}
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
                    mapHeight={470}
                    legendItems={[
                      { label: 'Critical', color: '#EF4444' },
                      { label: 'Warning', color: '#F97316' },
                      { label: 'Stable', color: '#0003B8' },
                    ]}
                    footerTextLeft="© OpenStreetMap contributors"
                    footerTextRight={
                      dashboard?.generatedAt
                        ? `Last Sync: ${new Date(dashboard.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : 'Last Sync: Pending'
                    }
                    mapCenterLatitude={mapCenter?.latitude}
                    mapCenterLongitude={mapCenter?.longitude}
                    mapZoom={10}
<<<<<<< Updated upstream
                    minZoom={7}
                    maxZoom={14}
                    mapBounds={mapBounds}
                    enablePan
                    onMapHoverChange={setIsMapHovered}
=======
                    minZoom={9}
                    maxZoom={14}
                    mapBounds={mapBounds}
                    enablePan
>>>>>>> Stashed changes
                    pins={mapZones.map((zone) => ({
                      id: zone.id,
                      top: zone.top,
                      left: zone.left,
                      latitude: zone.latitude,
                      longitude: zone.longitude,
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
<<<<<<< Updated upstream
                      {alerts.length === 0 ? (
                        <AlertCard
                          title="No active alerts"
                          description="All systems are operating within normal parameters. New alerts will appear here."
                          variant="neutral"
                          style={styles.alertCard}
                        />
                      ) : (
                        <>
                          {visibleAlerts.map((alert) => (
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
                          {remainingAlerts.length > 0 ? (
                            <TouchableOpacity
                              style={styles.moreAlertsButton}
                              activeOpacity={0.82}
                              onPress={() => setIsMoreAlertsOpen(true)}
                            >
                              <Feather name="list" size={17} color="#0003B8" />
                              <Text style={styles.moreAlertsText}>Show more alerts</Text>
                              <View style={styles.moreAlertsBadge}>
                                <Text style={styles.moreAlertsBadgeText}>{remainingAlerts.length}</Text>
                              </View>
                            </TouchableOpacity>
                          ) : null}
                        </>
                      )}
=======
                      {visibleAlerts.map((alert) => (
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
                      {alerts.length > 3 ? (
                        <TouchableOpacity
                          style={styles.moreAlertsButton}
                          activeOpacity={0.82}
                          onPress={() => setShowAllAlerts((current) => !current)}
                        >
                          <Feather name={showAllAlerts ? 'chevron-up' : 'chevron-down'} size={16} color="#0003B8" />
                          <Text style={styles.moreAlertsText}>
                            {showAllAlerts ? 'Show fewer alerts' : `Show ${hiddenAlertsCount} more alerts`}
                          </Text>
                        </TouchableOpacity>
                      ) : null}
>>>>>>> Stashed changes
                    </View>
                  </View>

                  <PriorityActionsCard
                    actions={actionCards}
                    style={[styles.analyticsCard, metricWidth ? { width: metricWidth, flex: undefined } : null]}
                    onOpenReport={() => setIsReportOpen(true)}
                    onLiveFeed={() => router.push('/admin/recommendations')}
                    onActionPress={() => router.push('/admin/recommendations')}
                  />
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
      <ExportReportOverlay visible={isExportOpen} onClose={() => setIsExportOpen(false)} onExport={() => { router.push('/admin/recommendations'); }} />
      <AlertProtocolOverlay visible={isProtocolOpen} onClose={() => setIsProtocolOpen(false)} />
      <AlertDetailOverlay visible={selectedAlert !== null} alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
      <EpidemiologicalReportOverlay
        visible={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        hospitalName={dashboard?.hospitalName}
        municipalityName={dashboard?.municipalityName}
        stateName={dashboard?.stateName}
        generatedAt={dashboard?.generatedAt}
        topCards={dashboard?.topCards}
        alerts={dashboard?.alerts}
        mapZones={dashboard?.mapZones}
        recommendedActions={dashboard?.recommendedActions}
      />
      <MetricDetailOverlay visible={selectedMetric !== null} metric={selectedMetric} onClose={() => setSelectedMetric(null)} />
      <MapZoneDetailOverlay visible={selectedZone !== null} zone={selectedZone} onClose={() => setSelectedZone(null)} />
      <MoreAlertsOverlay
        visible={isMoreAlertsOpen}
        alerts={remainingAlerts}
        onClose={() => setIsMoreAlertsOpen(false)}
        onSelectAlert={(alert) => {
          setIsMoreAlertsOpen(false);
          setSelectedAlert(alert);
        }}
      />
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
  onLiveFeed,
  onActionPress,
}: {
  actions: AdminDashboardSummaryResponse['recommendedActions'];
  style?: StyleProp<ViewStyle>;
  onOpenReport?: () => void;
  onLiveFeed?: () => void;
  onActionPress?: () => void;
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
          onPress={onLiveFeed}
        />
      </View>

      <Text style={styles.caseSectionLabel}>Operational Queue</Text>

      {actions.length === 0 ? (
        <View style={styles.emptyActionsContainer}>
          <Feather name="check-circle" size={24} color="#94A3B8" />
          <Text style={styles.emptyActionsTitle}>No pending actions</Text>
          <Text style={styles.emptyActionsSubtitle}>The operational queue is clear. New recommendations will appear here when generated.</Text>
        </View>
      ) : (
        <View style={styles.caseMetrics}>
          {actions.slice(0, 5).map((action) => (
            <TouchableOpacity key={action.id} activeOpacity={0.78} onPress={onActionPress} style={styles.actionMetricRow}>
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
            </TouchableOpacity>
          ))}
        </View>
      )}

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
      latitude: zone.latitude,
      longitude: zone.longitude,
      top: `${Math.max(12, Math.min(82, top))}%`,
      left: `${Math.max(12, Math.min(82, left))}%`,
      borderColor: zone.status.toUpperCase().includes('CRITICAL') ? '#EF4444' : zone.status.toUpperCase().includes('WARNING') ? '#F97316' : '#0003B8',
      latitude: zone.latitude,
      longitude: zone.longitude,
    };
  });
}

<<<<<<< Updated upstream
function getAdminMapCenter(zones: AdminDashboardZone[]) {
=======
function getMapCenter(zones: AdminDashboardZone[]) {
>>>>>>> Stashed changes
  const geocodedZones = zones.filter(
    (zone) => typeof zone.latitude === 'number' && typeof zone.longitude === 'number',
  );
  if (geocodedZones.length === 0) return null;
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
  return {
    latitude: geocodedZones.reduce((sum, zone) => sum + (zone.latitude as number), 0) / geocodedZones.length,
    longitude: geocodedZones.reduce((sum, zone) => sum + (zone.longitude as number), 0) / geocodedZones.length,
  };
}

<<<<<<< Updated upstream
function getAdminMapBounds(center: { latitude: number; longitude: number } | null) {
  if (!center) return undefined;
  const latitudePadding = 0.8;
  const longitudePadding = 0.8;
  return {
    minLatitude: center.latitude - latitudePadding,
    maxLatitude: center.latitude + latitudePadding,
    minLongitude: center.longitude - longitudePadding,
    maxLongitude: center.longitude + longitudePadding,
=======
function getMapBounds(zones: AdminDashboardZone[]) {
  const geocodedZones = zones.filter(
    (zone) => typeof zone.latitude === 'number' && typeof zone.longitude === 'number',
  );
  if (geocodedZones.length === 0) return undefined;

  const latitudes = geocodedZones.map((zone) => zone.latitude as number);
  const longitudes = geocodedZones.map((zone) => zone.longitude as number);
  const latitudePadding = Math.max(0.18, (Math.max(...latitudes) - Math.min(...latitudes)) * 0.2);
  const longitudePadding = Math.max(0.18, (Math.max(...longitudes) - Math.min(...longitudes)) * 0.2);

  return {
    minLatitude: Math.min(...latitudes) - latitudePadding,
    maxLatitude: Math.max(...latitudes) + latitudePadding,
    minLongitude: Math.min(...longitudes) - longitudePadding,
    maxLongitude: Math.max(...longitudes) + longitudePadding,
>>>>>>> Stashed changes
  };
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

function MoreAlertsOverlay({
  visible,
  alerts,
  onClose,
  onSelectAlert,
}: {
  visible: boolean;
  alerts: AdminDashboardAlert[];
  onClose: () => void;
  onSelectAlert: (alert: AdminDashboardAlert) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.moreAlertsOverlay}>
        <Pressable style={styles.moreAlertsBackdrop} onPress={onClose} />
        <View style={styles.moreAlertsCard}>
          <View style={styles.moreAlertsHeader}>
            <View>
              <Text style={styles.moreAlertsEyebrow}>ALERTS</Text>
              <Text style={styles.moreAlertsTitle}>All Disease Alerts</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.moreAlertsList} showsVerticalScrollIndicator={false}>
            {alerts.map((alert) => (
              <TouchableOpacity key={alert.id} activeOpacity={0.82} onPress={() => onSelectAlert(alert)}>
                <AlertCard
                  title={alert.title}
                  description={alert.description}
                  variant={alert.variant}
                  style={styles.alertCard}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 32,
  },
  container: {
    padding: 28,
    gap: 22,
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
    flexWrap: 'wrap',
  },
  metricCard: {
    flex: 1,
    minHeight: 124,
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
    flexWrap: 'wrap',
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
    paddingHorizontal: 18,
    paddingVertical: 18,
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
    padding: 18,
    gap: 12,
    flexDirection: 'column',
  },
  alertCard: {
    width: '100%',
    minHeight: 0,
  },
  moreAlertsButton: {
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE3F5',
    backgroundColor: '#F8FAFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  moreAlertsText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
    color: '#0003B8',
  },
  analyticsCard: {
    flexShrink: 0,
    minHeight: 470,
  },
  caseCard: {
    flexShrink: 0,
    minHeight: 470,
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
  emptyStateCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
    minHeight: 132,
    borderRadius: 12,
  },
  emptyStateTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  emptyActionsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
    marginBottom: 24,
  },
  emptyActionsTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  emptyActionsSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  moreAlertsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#EEF1FF',
    borderWidth: 1,
    borderColor: '#C9D1FF',
  },
  moreAlertsText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: '#0003B8',
  },
  moreAlertsBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0003B8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  moreAlertsBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  moreAlertsOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  moreAlertsBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.74)',
  },
  moreAlertsCard: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '80%',
    borderRadius: 20,
    backgroundColor: '#FCFDFE',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 6,
  },
  moreAlertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  moreAlertsEyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    color: '#1718C7',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  moreAlertsTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  moreAlertsList: {
    padding: 24,
    gap: 14,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});

export default AdminDashboard;
