import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, Modal, Pressable, ScrollView, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle, useWindowDimensions } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { RadarMapCard, RadarMapPolygon } from '@/components/dashboard/RadarMapCard';
import { adminNavigationLinks, getAdminSidebarItems } from '@/components/dashboard/adminNavigation';
import { AlertCard } from '@/components/feedback/AlertCard';
import { RetryState } from '@/components/feedback/RetryState';
import { SkeletonLine } from '@/components/feedback/SkeletonLine';
import { AlertListOverlay } from '@/components/overlays/AlertListOverlay';
import { Button } from '@/components/foundation/Button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CardBase } from '@/components/patterns/CardBase';
import { AlertDetailOverlay } from '@/components/views/admin/dashboard/Sub-funcionalidades/AlertDetailOverlay';
import { ExportReportOverlay } from '@/components/views/admin/dashboard/Sub-funcionalidades/ExportReportOverlay';
import { MapZoneDetailOverlay } from '@/components/views/admin/dashboard/Sub-funcionalidades/MapZoneDetailOverlay';
import { MetricDetailOverlay } from '@/components/views/admin/dashboard/Sub-funcionalidades/MetricDetailOverlay';
import {
  AdminDashboardAlert,
  AdminDashboardMetric,
  AdminDashboardMetricInsight,
  AdminDashboardZone,
} from '@/components/views/admin/dashboard/Sub-funcionalidades/types';
import {
  AdminDashboardSummaryResponse,
  getAdminDashboardSummary,
  listAdminRecommendations,
  OperationalRecommendationResponse,
} from '@/lib/adminOperational';
import {
  DoctorDashboardMapResponse,
  DoctorDashboardAlertResponse,
  DoctorDashboardMetricResponse,
  DoctorDashboardStateMapItem,
  getAdminEpidemiologyAlerts,
  getAdminEpidemiologyMap,
  getAdminEpidemiologyMetrics,
  getAdminEpidemiologyStateMap,
  getAdminEpidemiologyStateOutbreakMap,
} from '@/lib/doctorDashboard';
import { initialsFromName } from '@/lib/format';
import { useTranslation } from '@/i18n';
import { getHospitalAdminLabel, isSpanish } from '@/components/views/admin/localization';
import { translateDashboardBadge, translateDashboardValue } from '@/lib/dashboardLocalization';
import { translateDiseaseName } from '@/lib/diseaseLocalization';
import { diseaseSeverityColor, severityFillColor, zoneSeverityColor } from '@/lib/dashboardMapColors';
import { MexicoStateBoundary, mexicoStateBoundaries } from '@/assets/maps/mexicoStateBoundaries';
import { AppColors, withAlpha } from '@/constants/theme';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

interface SectionState<T> {
  status: LoadState;
  data: T | null;
  error: string | null;
}

function initialSectionState<T>(): SectionState<T> {
  return { status: 'idle', data: null, error: null };
}

export function AdminDashboard() {
  const router = useRouter();
  const { logout, profile } = useAuth();
  const { language, t } = useTranslation();
  const { width: viewportWidth } = useWindowDimensions();
  const [gridWidth, setGridWidth] = useState(0);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [dashboard, setDashboard] = useState<AdminDashboardSummaryResponse | null>(null);
  const [operationalRecommendations, setOperationalRecommendations] = useState<OperationalRecommendationResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isMoreAlertsOpen, setIsMoreAlertsOpen] = useState(false);
  const [isStateExplorerOpen, setIsStateExplorerOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AdminDashboardAlert | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<AdminDashboardMetric | null>(null);
  const [selectedZone, setSelectedZone] = useState<AdminDashboardZone | null>(null);
  const [selectedZoneSource, setSelectedZoneSource] = useState<'main' | 'state' | null>(null);
  const [selectedAction, setSelectedAction] = useState<AdminDashboardSummaryResponse['recommendedActions'][number] | null>(null);
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false);
  const [selectedState, setSelectedState] = useState<DoctorDashboardStateMapItem | null>(null);
  const [mapState, setMapState] = useState<SectionState<DoctorDashboardMapResponse>>(initialSectionState);
  const [alertsState, setAlertsState] = useState<SectionState<{ alerts: DoctorDashboardAlertResponse[] }>>(initialSectionState);
  const [stateMapState, setStateMapState] = useState<SectionState<{ states: DoctorDashboardStateMapItem[] }>>(initialSectionState);
  const [stateOutbreakMapState, setStateOutbreakMapState] = useState<SectionState<DoctorDashboardMapResponse>>(initialSectionState);
  const [doctorMetricsState, setDoctorMetricsState] = useState<SectionState<{ metrics: DoctorDashboardMetricResponse[] }>>(initialSectionState);
  const [isMapHovered, setIsMapHovered] = useState(false);
  const selectedRadiusKm = 75;
  const gridGap = 16;
  const topGap = 12;
  const isCompact = viewportWidth < 1320;
  const isNarrow = viewportWidth < 860;
  const topCardColumns = isNarrow ? 1 : isCompact ? 2 : 4;
  const topCardWidth = gridWidth > 0
    ? (gridWidth - topGap * Math.max(0, topCardColumns - 1)) / topCardColumns
    : undefined;
  const mapWidth = !isCompact && topCardWidth ? topCardWidth * 2 + topGap : undefined;
  const sidePanelWidth = !isCompact && gridWidth > 0 && mapWidth ? (gridWidth - mapWidth - gridGap * 2) / 2 : undefined;

  const loadDashboard = useCallback(async () => {
    setLoadState((current) => (current === 'success' ? 'success' : 'loading'));
    setError(null);
    try {
      const [data, recommendationFeed] = await Promise.all([
        getAdminDashboardSummary(),
        listAdminRecommendations(),
      ]);
      setDashboard(data);
      setOperationalRecommendations(recommendationFeed);
      setLoadState('success');
    } catch (nextError) {
      setLoadState('error');
      setError(nextError instanceof Error ? nextError.message : isSpanish(language) ? 'No se pudo cargar el panel administrativo.' : 'Unable to load the admin dashboard.');
    }
  }, [language]);

  const loadMap = useCallback(async () => {
    setMapState((current) => ({ ...current, status: 'loading', error: null }));
    try {
      const data = await getAdminEpidemiologyMap(selectedRadiusKm);
      setMapState({ status: 'success', data, error: null });
    } catch (nextError) {
      setMapState((current) => ({
        status: 'error',
        data: current.data,
        error: nextError instanceof Error ? nextError.message : 'Unable to load map.',
      }));
    }
  }, [selectedRadiusKm]);

  const loadAlerts = useCallback(async () => {
    setAlertsState((current) => ({ ...current, status: 'loading', error: null }));
    try {
      const data = await getAdminEpidemiologyAlerts(selectedRadiusKm);
      setAlertsState({ status: 'success', data, error: null });
    } catch (nextError) {
      setAlertsState((current) => ({
        status: 'error',
        data: current.data,
        error: nextError instanceof Error ? nextError.message : 'Unable to load alerts.',
      }));
    }
  }, [selectedRadiusKm]);

  const loadDoctorMetrics = useCallback(async () => {
    setDoctorMetricsState((current) => ({ ...current, status: 'loading', error: null }));
    try {
      const data = await getAdminEpidemiologyMetrics(selectedRadiusKm);
      setDoctorMetricsState({ status: 'success', data, error: null });
    } catch (nextError) {
      setDoctorMetricsState((current) => ({
        status: 'error',
        data: current.data,
        error: nextError instanceof Error ? nextError.message : 'Unable to load clinical metrics.',
      }));
    }
  }, [selectedRadiusKm]);

  const loadStateMap = useCallback(async () => {
    setStateMapState((current) => ({ ...current, status: 'loading', error: null }));
    try {
      const data = await getAdminEpidemiologyStateMap();
      setStateMapState({ status: 'success', data, error: null });
    } catch (nextError) {
      setStateMapState((current) => ({
        status: 'error',
        data: current.data,
        error: nextError instanceof Error ? nextError.message : 'Unable to load states.',
      }));
    }
  }, []);

  const loadStateOutbreakMap = useCallback(async (state: DoctorDashboardStateMapItem) => {
    setSelectedState(state);
    setStateOutbreakMapState({ status: 'loading', data: null, error: null });
    try {
      const data = await getAdminEpidemiologyStateOutbreakMap(state.stateId);
      setStateOutbreakMapState({ status: 'success', data, error: null });
    } catch (nextError) {
      setStateOutbreakMapState((current) => ({
        status: 'error',
        data: current.data,
        error: nextError instanceof Error ? nextError.message : 'Unable to load state outbreaks.',
      }));
    }
  }, []);

  const openStateExplorer = useCallback(() => {
    setIsStateExplorerOpen(true);
    setSelectedState(null);
    setStateOutbreakMapState(initialSectionState());
    void loadStateMap();
  }, [loadStateMap]);

  useEffect(() => {
    void loadDashboard();
    void loadMap();
    void loadAlerts();
    void loadDoctorMetrics();
  }, [loadAlerts, loadDashboard, loadDoctorMetrics, loadMap]);

  const topCards = useMemo(() => {
    if (!dashboard) return [];
    const localRiskMetric = doctorMetricsState.data?.metrics.find((metric) => metric.id === 'local-risk-level') ?? null;
    return dashboard.topCards.map((card) => mapMetric(card, dashboard, language, t, alertsState.data?.alerts ?? [], localRiskMetric));
  }, [alertsState.data?.alerts, dashboard, doctorMetricsState.data?.metrics, language, t]);
  const alerts = useMemo(
    () => (alertsState.data?.alerts ?? []).map((alert) => describeAlert(alert, t)),
    [alertsState.data?.alerts, t],
  );
  const visibleAlerts = useMemo(() => alerts.slice(0, 4), [alerts]);
  const remainingAlerts = useMemo(() => alerts.slice(4), [alerts]);
  const mapZones = useMemo(
    () => positionZones(mapState.data?.zones ?? [], t),
    [mapState.data?.zones, t],
  );
  const mapCenter = useMemo(() => getMapCenter(mapZones), [mapZones]);
  const localMapBounds = useMemo(
    () => getRadiusBounds(mapCenter, mapState.data?.radiusKm),
    [mapCenter, mapState.data?.radiusKm],
  );
  const stateOutbreakZones = useMemo(
    () => positionZones(stateOutbreakMapState.data?.zones ?? [], t, selectedState?.stateName),
    [selectedState?.stateName, stateOutbreakMapState.data?.zones, t],
  );
  const selectedStateCenter = useMemo(
    () => selectedState ? { latitude: selectedState.latitude, longitude: selectedState.longitude } : getMapCenter(stateOutbreakZones),
    [selectedState, stateOutbreakZones],
  );
  const selectedStateBoundary = useMemo(() => getStateBoundary(selectedState?.stateName), [selectedState?.stateName]);
  const selectedStateBounds = useMemo(
    () => getBoundaryBounds(selectedStateBoundary) ?? getZoneBounds(stateOutbreakZones),
    [selectedStateBoundary, stateOutbreakZones],
  );
  const archivedActionIds = useMemo(
    () => new Set(operationalRecommendations.filter(isArchivedOperationalRecommendation).map((item) => item.id)),
    [operationalRecommendations],
  );
  const archivedActionKeys = useMemo(
    () => new Set(operationalRecommendations.filter(isArchivedOperationalRecommendation).map(operationalRecommendationKey)),
    [operationalRecommendations],
  );
  const actionCards = useMemo(
    () => [...(dashboard?.recommendedActions ?? [])]
      .filter((action) => !isArchivedRecommendedAction(action.status))
      .filter((action) => !archivedActionIds.has(action.id))
      .filter((action) => !archivedActionKeys.has(recommendedActionKey(action)))
      .sort(compareRecommendedActions),
    [archivedActionIds, archivedActionKeys, dashboard],
  );
  const visibleActions = useMemo(() => actionCards.slice(0, 3), [actionCards]);
  const remainingActions = useMemo(() => actionCards.slice(3), [actionCards]);
  const sidebarItems = useMemo(() => getAdminSidebarItems(language), [language]);
  const isDashboardLoading = loadState === 'loading' || loadState === 'idle';
  const metricSkeletons = useMemo(
    () => ['beds', 'staff', 'icu', 'outbreaks'].map((id) => ({ id })),
    [],
  );

  return (
    <DashboardLayout
      active="dashboard"
      sectionLabel={isSpanish(language) ? 'Panel' : 'Dashboard'}
      userName={profile?.fullName ?? getHospitalAdminLabel(language)}
      userId={profile?.email ?? undefined}
      avatarText={initialsFromName(profile?.fullName)}
      links={adminNavigationLinks}
      sidebarItems={sidebarItems}
      onLogout={async () => { await logout(); router.replace('/login'); }}
    >
      <ScrollView testID="admin-dashboard-screen" contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false} scrollEnabled={!isMapHovered}>
        <View style={styles.container}>
          <View style={styles.heroStrip}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>{isSpanish(language) ? 'Operaciones hospitalarias' : 'Hospital Operations'}</Text>
              <Text style={styles.heroTitle}>
                {dashboard?.hospitalName
                  ? isSpanish(language)
                    ? `Resumen radar de ${dashboard.hospitalName}`
                    : `${dashboard.hospitalName} Radar Overview`
                  : isSpanish(language)
                    ? 'Resumen radar del hospital'
                    : 'Hospital Radar Overview'}
              </Text>
              <Text style={styles.heroDescription}>
                {dashboard?.municipalityName && dashboard?.stateName
                  ? isSpanish(language)
                    ? `Operaciones en vivo para ${dashboard.municipalityName}, ${dashboard.stateName}.`
                    : `Live operations for ${dashboard.municipalityName}, ${dashboard.stateName}.`
                  : isSpanish(language)
                    ? 'Monitoreo epidemiologico en tiempo real y seguimiento del estado de la instalacion.'
                    : 'Real-time epidemiological monitoring and facility status tracking.'}
              </Text>
            </View>

            <View style={[styles.heroActions, isNarrow && styles.heroActionsNarrow]}>
              <Button
                label={isSpanish(language) ? 'Exportar reporte' : 'Export Report'}
                size="sm"
                variant="secondary"
                leadingIcon={<Feather name="download" size={12} color={AppColors.text.body} />}
                style={styles.secondaryAction}
                onPress={() => setIsExportOpen(true)}
              />
            </View>
          </View>

          {error ? (
            <CardBase style={styles.errorCard}>
              <Text style={styles.errorTitle}>{isSpanish(language) ? 'Panel no disponible' : 'Dashboard unavailable'}</Text>
              <Text style={styles.errorText}>{error}</Text>
            </CardBase>
          ) : null}

          <View
            style={styles.dashboardSection}
            onLayout={(event: LayoutChangeEvent) => {
              const nextWidth = event.nativeEvent.layout.width;
              if (Math.abs(nextWidth - gridWidth) > 1) {
                setGridWidth(nextWidth);
              }
            }}
          >
                <View style={[styles.topCardsRow, isCompact && styles.topCardsRowCompact]}>
                  {isDashboardLoading && topCards.length === 0 ? metricSkeletons.map((card) => (
                    <OverviewMetricCard
                      key={card.id}
                      id={card.id}
                      title=""
                      value=""
                      detailTitle=""
                      detailSummary=""
                      signalLabel=""
                      recommendedAction=""
                      isLoading
                      style={
                        topCardWidth
                          ? { width: topCardWidth, minHeight: 176, flex: undefined }
                          : undefined
                      }
                    />
                  )) : topCards.map((card) => (
                    <OverviewMetricCard
                      key={card.title}
                      {...card}
                      onPress={() => setSelectedMetric(card)}
                      style={
                        topCardWidth
                          ? { width: topCardWidth, minHeight: 176, flex: undefined }
                          : undefined
                      }
                    />
                  ))}
                </View>

                <View style={[styles.mainGrid, isCompact && styles.mainGridCompact]}>
                  {mapState.status === 'loading' || mapState.status === 'idle' ? (
                    <MapSkeleton width={mapWidth} />
                  ) : mapState.status === 'error' ? (
                    <View style={[styles.retryHost, mapWidth ? { width: mapWidth } : styles.mapCard]}>
                      <MapSkeleton />
                      <RetryState actionLabel={t('doctor.dashboard.retry')} onRetry={loadMap} compact style={styles.retryOverlay} />
                    </View>
                  ) : (
                    <RadarMapCard
                      title={t('doctor.dashboard.map.title')}
                      showOverlayPanel
                      overlayTitle={t('doctor.dashboard.map.overlayTitle').toUpperCase()}
                      overlayBadgeLabel={t('doctor.dashboard.map.secure').toUpperCase()}
                      overlayItems={(mapState.data?.diseaseBreakdown ?? []).slice(0, 3).map((disease) => ({
                        label: translateDiseaseName(t, disease.diseaseName),
                        value: formatNumber(disease.caseCount),
                        color: diseaseSeverityColor(disease),
                      }))}
                      showControls
                      legendItems={[
                        { label: t('doctor.dashboard.map.highRisk'), color: AppColors.status.dangerBright },
                        { label: t('doctor.dashboard.map.emerging'), color: AppColors.status.warningBright },
                        { label: t('doctor.dashboard.map.lowRisk'), color: AppColors.status.successBright },
                        { label: t('doctor.dashboard.map.hospitalNode'), color: AppColors.brand.primary },
                      ]}
                      footerTextLeft="© OpenStreetMap contributors"
                      footerTextRight={formatSyncTime(mapState.data?.generatedAt, t)}
                      mapHeight={isNarrow ? 360 : 520}
                      mapCenterLatitude={mapCenter?.latitude}
                      mapCenterLongitude={mapCenter?.longitude}
                      mapZoom={10}
                      minZoom={10}
                      maxZoom={14}
                      mapBounds={localMapBounds}
                      enablePan
                      onMapHoverChange={setIsMapHovered}
                      surveillanceRadiusKm={mapState.data?.radiusKm}
                      bottomRightActionLabel={t('doctor.dashboard.map.viewOtherStates')}
                      onBottomRightActionPress={openStateExplorer}
                      pins={mapZones.map((zone) => ({
                        id: zone.id,
                        top: zone.top,
                        left: zone.left,
                        latitude: zone.latitude,
                        longitude: zone.longitude,
                        borderColor: zone.borderColor,
                        fillColor: AppColors.surface.card,
                        icon:
                          zone.borderColor === AppColors.brand.primary ? (
                            <MaterialCommunityIcons name="hospital-box-outline" size={12} color={AppColors.brand.primary} />
                          ) : zone.borderColor === AppColors.status.warningBright ? (
                            <MaterialCommunityIcons name="virus-outline" size={14} color={zone.borderColor} />
                          ) : zone.borderColor === AppColors.status.successBright ? (
                            <MaterialCommunityIcons name="check-circle-outline" size={14} color={zone.borderColor} />
                          ) : (
                            <MaterialCommunityIcons name="alert" size={16} color={zone.borderColor} />
                          ),
                        onPress: () => {
                          setSelectedZone(zone);
                          setSelectedZoneSource('main');
                        },
                      }))}
                      style={[
                        styles.mapCard,
                        isCompact ? styles.mapCardCompact : null,
                        mapWidth ? { width: mapWidth, flex: undefined } : null,
                      ]}
                    />
                  )}

                  <ContextualAlertsPanel
                    alerts={visibleAlerts}
                    language={language}
                    remainingCount={remainingAlerts.length}
                    isLoading={alertsState.status === 'loading' || alertsState.status === 'idle'}
                    style={[
                      styles.sidePanel,
                      isCompact && styles.stackCard,
                      sidePanelWidth ? { width: sidePanelWidth, flex: undefined } : null,
                    ]}
                    onSelectAlert={setSelectedAlert}
                    onOpenMore={() => setIsMoreAlertsOpen(true)}
                  />

                  <PriorityActionsCard
                    actions={visibleActions}
                    remainingCount={remainingActions.length}
                    language={language}
                    isLoading={isDashboardLoading && actionCards.length === 0}
                    onSelectAction={setSelectedAction}
                    onOpenMore={() => setIsMoreActionsOpen(true)}
                    style={[
                      styles.analyticsCard,
                      isCompact && styles.stackCard,
                      sidePanelWidth ? { width: sidePanelWidth, flex: undefined } : null,
                    ]}
                  />
                </View>
              </View>
        </View>
      </ScrollView>
      <ExportReportOverlay
        visible={isExportOpen}
        dashboard={dashboard}
        metrics={topCards}
        alerts={alerts}
        actions={actionCards}
        zones={mapZones}
        onClose={() => setIsExportOpen(false)}
      />
      <AlertDetailOverlay visible={selectedAlert !== null} alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
      <AlertListOverlay
        visible={isMoreAlertsOpen}
        alerts={remainingAlerts}
        eyebrow={language === 'es' ? 'Brotes activos' : 'Active outbreaks'}
        title={language === 'es' ? 'Mas brotes contextuales' : 'More contextual outbreaks'}
        onClose={() => setIsMoreAlertsOpen(false)}
        onSelectAlert={(alert) => {
          setIsMoreAlertsOpen(false);
          setSelectedAlert(alert);
        }}
      />
      <StateOutbreakExplorer
        visible={isStateExplorerOpen}
        states={stateMapState.data?.states ?? []}
        statesStatus={stateMapState.status}
        selectedState={selectedState}
        selectedStateCenter={selectedStateCenter}
        selectedStateBounds={selectedStateBounds}
        stateZones={stateOutbreakZones}
        stateMapStatus={stateOutbreakMapState.status}
        onClose={() => setIsStateExplorerOpen(false)}
        onRetryStates={loadStateMap}
        onSelectState={(state) => { void loadStateOutbreakMap(state); }}
        onBack={() => {
          setSelectedState(null);
          setStateOutbreakMapState(initialSectionState());
        }}
        onZonePress={(zone) => {
          setSelectedZone(zone);
          setSelectedZoneSource('state');
        }}
        onMapHoverChange={setIsMapHovered}
        t={t}
      />
      <MetricDetailOverlay visible={selectedMetric !== null} metric={selectedMetric} onClose={() => setSelectedMetric(null)} />
      <MapZoneDetailOverlay
        visible={selectedZone !== null}
        zone={selectedZone}
        showRadius={selectedZoneSource !== 'state'}
        onClose={() => {
          setSelectedZone(null);
          setSelectedZoneSource(null);
        }}
      />
      <HospitalRecommendationOverlay
        visible={selectedAction !== null}
        action={selectedAction}
        language={language}
        onClose={() => setSelectedAction(null)}
        onGoToTask={(id) => {
          setSelectedAction(null);
          router.push({ pathname: '/admin/recommendations', params: { focus: id } });
        }}
      />
      <MoreRecommendationsOverlay
        visible={isMoreActionsOpen}
        actions={remainingActions}
        language={language}
        onClose={() => setIsMoreActionsOpen(false)}
        onSelectAction={(action) => {
          setIsMoreActionsOpen(false);
          setSelectedAction(action);
        }}
      />
    </DashboardLayout>
  );
}

interface OverviewMetricCardProps extends AdminDashboardMetric {
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  isLoading?: boolean;
}

function OverviewMetricCard({
  id,
  title,
  value,
  valueUnit,
  badge,
  subtitle,
  tone = 'default',
  style,
  onPress,
  isLoading = false,
}: OverviewMetricCardProps) {
  const palette = metricTonePalette(isLoading ? 'default' : tone);

  return (
    <TouchableOpacity activeOpacity={0.84} onPress={onPress} disabled={!onPress || isLoading}>
      <CardBase style={[styles.metricCard, { borderColor: palette.border, backgroundColor: AppColors.surface.card }, style]}>
        <View style={[styles.metricAccent, { backgroundColor: palette.accent }]} />
        <View style={styles.metricHeader}>
          {isLoading ? <SkeletonLine width="48%" height={16} /> : <Text style={styles.metricTitle}>{title}</Text>}
          {isLoading ? (
            <View style={styles.skeletonBadge} />
          ) : badge ? (
            <View style={[styles.metricBadgePill, { backgroundColor: `${palette.accent}12` }]}>
              <Text style={[styles.metricBadge, { color: palette.accent }]}>{badge}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.metricValueRow}>
          <View style={[styles.metricIconBox, { backgroundColor: `${palette.accent}12` }]}>
            {metricCardIcon(id, palette.accent)}
          </View>
          {isLoading ? (
            <View style={styles.skeletonValueBlock}>
              <SkeletonLine width={130} height={34} />
              <SkeletonLine width={84} height={18} />
            </View>
          ) : (
            <View style={styles.metricValueCopy}>
              <Text style={styles.metricValue}>{value}</Text>
              {valueUnit ? <Text style={styles.metricValueUnit}>{valueUnit}</Text> : null}
            </View>
          )}
        </View>

        {isLoading ? (
          <View style={styles.skeletonSubtitleBlock}>
            <SkeletonLine width="92%" />
            <SkeletonLine width="58%" />
          </View>
        ) : subtitle ? (
          <Text style={styles.metricSubtitle}>{subtitle}</Text>
        ) : null}
      </CardBase>
    </TouchableOpacity>
  );
}

function metricCardIcon(metricId: string, color: string) {
  const normalized = metricId.toLowerCase();
  const iconName: React.ComponentProps<typeof Feather>['name'] = normalized === 'beds'
    ? 'activity'
    : normalized === 'staff'
      ? 'users'
      : normalized === 'icu'
        ? 'heart'
        : normalized === 'outbreaks'
          ? 'alert-triangle'
          : 'bar-chart-2';
  return <Feather name={iconName} size={18} color={color} />;
}

function ContextualAlertsPanel({
  alerts,
  language,
  remainingCount,
  isLoading = false,
  style,
  onSelectAlert,
  onOpenMore,
}: {
  alerts: AdminDashboardAlert[];
  language: 'en' | 'es';
  remainingCount: number;
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
  onSelectAlert: (alert: AdminDashboardAlert) => void;
  onOpenMore: () => void;
}) {
  return (
    <View style={[styles.alertsPanel, style]}>
      <View style={styles.alertsHeader}>
        <Text style={styles.alertsTitle}>{language === 'es' ? 'Brotes activos mas relevantes' : 'Most Relevant Active Outbreaks'}</Text>
        <View style={styles.sectionHeaderRule} />
      </View>
      <View style={styles.alertsList}>
        <View style={styles.alertItems}>
          {isLoading ? (
            [0, 1, 2].map((item) => (
              <View key={item} style={styles.alertSkeletonItem}>
                <SkeletonLine width="48%" height={16} />
                <SkeletonLine width="84%" />
                <SkeletonLine width="64%" />
              </View>
            ))
          ) : alerts.length === 0 ? (
            <AlertCard
              title={language === 'es' ? 'Sin alertas activas' : 'No active alerts'}
              description={language === 'es' ? 'No hay senales activas de brotes para el contexto de este hospital.' : 'No active outbreak signals are currently available for this hospital context.'}
              variant="neutral"
              style={styles.alertCard}
            />
          ) : alerts.map((alert) => (
            <TouchableOpacity
              key={alert.id}
              activeOpacity={0.8}
              onPress={() => onSelectAlert(alert)}
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
        {remainingCount > 0 ? (
          <TouchableOpacity
            style={styles.moreAlertsButton}
            activeOpacity={0.82}
            onPress={onOpenMore}
          >
            <Feather name="list" size={17} color={AppColors.brand.primary} />
            <Text style={styles.moreAlertsText}>{language === 'es' ? 'Mostrar mas brotes' : 'Show more outbreaks'}</Text>
            <View style={styles.moreAlertsBadge}>
              <Text style={styles.moreAlertsBadgeText}>{remainingCount}</Text>
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

function PriorityActionsCard({
  actions,
  remainingCount,
  language,
  isLoading = false,
  onSelectAction,
  onOpenMore,
  style,
}: {
  actions: AdminDashboardSummaryResponse['recommendedActions'];
  remainingCount: number;
  language: 'en' | 'es';
  isLoading?: boolean;
  onSelectAction: (action: AdminDashboardSummaryResponse['recommendedActions'][number]) => void;
  onOpenMore: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <CardBase style={[styles.caseCard, style]}>
      <View style={styles.alertsHeader}>
        <Text style={styles.alertsTitle}>{language === 'es' ? 'Recomendaciones Hospitalarias' : 'Hospital Recommendations'}</Text>
        <View style={styles.sectionHeaderRule} />
      </View>

      <View style={styles.caseMetrics}>
        <View style={styles.actionItems}>
          {isLoading ? (
            [0, 1, 2].map((item) => (
              <View key={item} style={styles.actionSkeletonItem}>
                <View style={styles.actionMetricTopRow}>
                  <View style={styles.skeletonActionIcon} />
                  <View style={styles.actionMetricTextGroup}>
                    <SkeletonLine width="72%" height={16} />
                    <SkeletonLine width="38%" height={12} style={styles.skeletonSpacedSmall} />
                  </View>
                </View>
                <View style={styles.actionMetricBadges}>
                  <SkeletonLine width={82} height={24} />
                  <SkeletonLine width={74} height={14} />
                </View>
              </View>
            ))
          ) : actions.map((action) => {
            const categoryTone = recommendedActionCategoryTone(action.type);
            const priorityTone = severityTone(action.severity);
            return (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionMetricCard, { borderColor: categoryTone.border }]}
                activeOpacity={0.86}
                onPress={() => onSelectAction(action)}
              >
                <View style={styles.actionMetricTopRow}>
                  <View style={[styles.actionMetricIcon, { backgroundColor: categoryTone.soft }]}>
                    {actionIcon(action.type, categoryTone.accent)}
                  </View>
                  <View style={styles.actionMetricTextGroup}>
                    <Text style={styles.caseMetricName}>{localizeRecommendedActionTitle(action, language)}</Text>
                    <Text style={styles.actionMetricMeta}>{localizeRecommendedActionType(action.type, language).toUpperCase()}</Text>
                  </View>
                </View>
                <View style={styles.actionMetricBadges}>
                  <View style={styles.actionPriorityBadge}>
                    <Text style={styles.actionPriorityText}>{language === 'es' ? 'Prioridad: ' : 'Priority: '}</Text>
                    <Text style={[styles.actionPriorityValue, { color: priorityTone.accent, backgroundColor: priorityTone.soft }]}>
                      {localizePriorityLabel(action.severity, language)}
                    </Text>
                  </View>
                  <View style={[styles.actionStatusBadge, { backgroundColor: actionStatusTone(action.status).soft }]}>
                    <Text style={[styles.caseMetricValue, { color: actionStatusTone(action.status).accent }]}>
                      {localizeActionStatus(action.status, language)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        {!isLoading && remainingCount > 0 ? (
          <TouchableOpacity style={styles.moreAlertsButton} activeOpacity={0.78} onPress={onOpenMore}>
            <Feather name="list" size={15} color={AppColors.brand.primary} />
            <Text style={styles.showMoreActionsText}>
              {language === 'es' ? 'Mostrar mas recomendaciones' : 'Show more recommendations'}
            </Text>
            <View style={styles.moreAlertsBadge}>
              <Text style={styles.moreAlertsBadgeText}>{remainingCount}</Text>
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
    </CardBase>
  );
}

function MoreRecommendationsOverlay({
  visible,
  actions,
  language,
  onClose,
  onSelectAction,
}: {
  visible: boolean;
  actions: AdminDashboardSummaryResponse['recommendedActions'];
  language: 'en' | 'es';
  onClose: () => void;
  onSelectAction: (action: AdminDashboardSummaryResponse['recommendedActions'][number]) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.moreAlertsOverlay}>
        <Pressable style={styles.moreAlertsBackdrop} onPress={onClose} />
        <View style={styles.moreAlertsCard}>
          <View style={styles.moreAlertsHeader}>
            <View>
              <Text style={styles.moreAlertsEyebrow}>{language === 'es' ? 'Recomendaciones' : 'Recommendations'}</Text>
              <Text style={styles.moreAlertsTitle}>{language === 'es' ? 'Mas recomendaciones hospitalarias' : 'More hospital recommendations'}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.moreAlertsList} showsVerticalScrollIndicator={false}>
            {actions.map((action) => {
              const categoryTone = recommendedActionCategoryTone(action.type);
              const priorityTone = severityTone(action.severity);
              return (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.actionMetricCard, { borderColor: categoryTone.border }]}
                  activeOpacity={0.82}
                  onPress={() => onSelectAction(action)}
                >
                  <View style={styles.actionMetricTopRow}>
                    <View style={[styles.actionMetricIcon, { backgroundColor: categoryTone.soft }]}>
                      {actionIcon(action.type, categoryTone.accent)}
                    </View>
                    <View style={styles.actionMetricTextGroup}>
                      <Text style={styles.caseMetricName}>{localizeRecommendedActionTitle(action, language)}</Text>
                      <Text style={styles.actionMetricMeta}>{localizeRecommendedActionType(action.type, language).toUpperCase()}</Text>
                    </View>
                  </View>
                  <View style={styles.actionMetricBadges}>
                    <View style={styles.actionPriorityBadge}>
                      <Text style={styles.actionPriorityText}>{language === 'es' ? 'Prioridad: ' : 'Priority: '}</Text>
                      <Text style={[styles.actionPriorityValue, { color: priorityTone.accent, backgroundColor: priorityTone.soft }]}>
                        {localizePriorityLabel(action.severity, language)}
                      </Text>
                    </View>
                    <View style={[styles.actionStatusBadge, { backgroundColor: actionStatusTone(action.status).soft }]}>
                      <Text style={[styles.caseMetricValue, { color: actionStatusTone(action.status).accent }]}>
                        {localizeActionStatus(action.status, language)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function HospitalRecommendationOverlay({
  visible,
  action,
  language,
  onClose,
  onGoToTask,
}: {
  visible: boolean;
  action: AdminDashboardSummaryResponse['recommendedActions'][number] | null;
  language: 'en' | 'es';
  onClose: () => void;
  onGoToTask: (id: string) => void;
}) {
  if (!action) return null;
  const title = localizeRecommendedActionTitle(action, language);
  const description = localizedActionDescription(action, language);
  const actions = localizedActionSteps(action, language);
  const priority = localizePriorityLabel(action.severity, language);
  const accent = severityToColor(action.severity);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.recommendationModalOverlay}>
        <Pressable style={styles.recommendationModalBackdrop} onPress={onClose} />
        <View style={styles.recommendationModalCard}>
          <View style={styles.recommendationModalHeader}>
            <View style={[styles.recommendationModalIcon, { backgroundColor: severityToSoftColor(action.severity) }]}>
              {actionIcon(action.type, accent)}
            </View>
            <View style={styles.recommendationModalTitleGroup}>
              <Text style={styles.recommendationModalTitle}>{title}</Text>
            </View>
            <TouchableOpacity style={styles.recommendationModalClose} activeOpacity={0.75} onPress={onClose}>
              <Feather name="x" size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.recommendationModalDescription}>{description}</Text>

          <View style={styles.recommendationModalSignalRow}>
            <View style={styles.recommendationModalSignalCard}>
              <Text style={styles.recommendationModalSignalLabel}>{language === 'es' ? 'Prioridad' : 'Priority'}</Text>
              <Text style={[styles.recommendationModalSignalValue, { color: accent }]}>{priority}</Text>
            </View>
            <View style={styles.recommendationModalSignalCard}>
              <Text style={styles.recommendationModalSignalLabel}>{language === 'es' ? 'Estado' : 'Status'}</Text>
              <Text style={styles.recommendationModalSignalValue}>{localizeActionStatus(action.status, language)}</Text>
            </View>
          </View>

          <View style={styles.recommendationModalActionBlock}>
            <Text style={styles.recommendationModalActionTitle}>
              {language === 'es' ? 'Acciones a realizar' : 'Actions to complete'}
            </Text>
            {actions.map((step, index) => (
              <View key={`${step}-${index}`} style={styles.recommendationModalStep}>
                <View style={[styles.recommendationModalStepNumber, { borderColor: accent }]}>
                  <Text style={[styles.recommendationModalStepNumberText, { color: accent }]}>{index + 1}</Text>
                </View>
                <Text style={styles.recommendationModalStepText}>{step}</Text>
              </View>
            ))}
          </View>

          <Button
            label={language === 'es' ? 'Ir a la tarea' : 'Go to task'}
            variant="primary"
            size="lg"
            onPress={() => onGoToTask(action.id)}
            style={styles.recommendationModalButton}
          />
        </View>
      </View>
    </Modal>
  );
}

function MapSkeleton({ width }: { width?: number }) {
  return <View style={[styles.mapSkeleton, width ? { width, flex: undefined } : null]} />;
}

function StateOutbreakExplorer({
  visible,
  states,
  statesStatus,
  selectedState,
  selectedStateCenter,
  selectedStateBounds,
  stateZones,
  stateMapStatus,
  onClose,
  onRetryStates,
  onSelectState,
  onBack,
  onZonePress,
  onMapHoverChange,
  t,
}: {
  visible: boolean;
  states: DoctorDashboardStateMapItem[];
  statesStatus: LoadState;
  selectedState: DoctorDashboardStateMapItem | null;
  selectedStateCenter: { latitude: number; longitude: number } | null;
  selectedStateBounds?: {
    minLatitude: number;
    maxLatitude: number;
    minLongitude: number;
    maxLongitude: number;
  };
  stateZones: AdminDashboardZone[];
  stateMapStatus: LoadState;
  onClose: () => void;
  onRetryStates: () => void;
  onSelectState: (state: DoctorDashboardStateMapItem) => void;
  onBack: () => void;
  onZonePress: (zone: AdminDashboardZone) => void;
  onMapHoverChange: (isHovering: boolean) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const mexicoCenter = { latitude: 23.6345, longitude: -102.5528 };
  const statesByName = useMemo(() => new Map(
    states.map((state) => [stateLookupKey(state.stateName), state]),
  ), [states]);
  const selectedBoundary = useMemo(() => getStateBoundary(selectedState?.stateName), [selectedState?.stateName]);
  const selectedStateColor = AppColors.brand.primary;
  const selectorPolygons = useMemo<RadarMapPolygon[]>(() => mexicoStateBoundaries.map((boundary) => {
    const state = statesByName.get(stateLookupKey(boundary.name));
    return {
      id: boundary.id,
      geometry: boundary.geometry,
      fillColor: state ? withAlpha(AppColors.brand.primary, 0.05) : withAlpha(AppColors.text.secondary, 0.04),
      strokeColor: state ? withAlpha(AppColors.brand.primary, 0.62) : withAlpha(AppColors.text.secondary, 0.24),
      strokeWidth: state && state.outbreakCount > 0 ? 1.3 : 1,
    };
  }), [statesByName]);
  const selectedPolygons = useMemo<RadarMapPolygon[]>(() => (
    selectedBoundary
      ? [{
        id: selectedBoundary.id,
        geometry: selectedBoundary.geometry,
        fillColor: severityFillColor(selectedStateColor),
        strokeColor: selectedStateColor,
        strokeWidth: 2,
      }]
      : []
  ), [selectedBoundary, selectedStateColor]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.stateExplorerOverlay}>
        <Pressable style={styles.stateExplorerBackdrop} onPress={onClose} />
        <View style={styles.stateExplorerCard}>
          <View style={styles.stateExplorerHeader}>
            <View>
              <Text style={styles.stateExplorerEyebrow}>
                {selectedState ? t('doctor.dashboard.map.stateOutbreaks') : t('doctor.dashboard.map.stateSelector')}
              </Text>
              <Text style={styles.stateExplorerTitle}>
                {selectedState ? shortStateName(selectedState.stateName) : t('doctor.dashboard.map.viewOtherStates')}
              </Text>
            </View>
            <View style={styles.stateExplorerActions}>
              {selectedState ? (
                <TouchableOpacity style={styles.stateExplorerSecondaryButton} onPress={onBack} activeOpacity={0.75}>
                  <Feather name="arrow-left" size={16} color={AppColors.brand.primary} />
                  <Text style={styles.stateExplorerSecondaryText}>{t('doctor.dashboard.map.backToStates')}</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
                <Feather name="x" size={18} color={AppColors.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          {selectedState ? (
            stateMapStatus === 'loading' ? (
              <MapSkeleton />
            ) : stateMapStatus === 'error' ? (
              <View style={styles.stateExplorerError}>
                <RetryState actionLabel={t('doctor.dashboard.retry')} onRetry={() => onSelectState(selectedState)} compact style={styles.retryOverlay} />
              </View>
            ) : (
              <RadarMapCard
                title={shortStateName(selectedState.stateName)}
                showControls
                showFooter
                fitMapToCard
                footerTextLeft="© OpenStreetMap contributors"
                footerTextRight={t('doctor.dashboard.map.stateOutbreakCount', {
                  count: formatNumber(stateZones.length),
                })}
                mapHeight={600}
                mapCenterLatitude={selectedStateCenter?.latitude}
                mapCenterLongitude={selectedStateCenter?.longitude}
                mapZoom={8}
                minZoom={6}
                maxZoom={13}
                mapBounds={selectedStateBounds}
                enablePan
                onMapHoverChange={onMapHoverChange}
                polygons={selectedPolygons}
                pins={stateZones.map((zone) => ({
                  id: zone.id,
                  latitude: zone.latitude,
                  longitude: zone.longitude,
                  borderColor: zone.borderColor,
                  fillColor: AppColors.surface.card,
                  icon: zone.borderColor === AppColors.status.successBright
                    ? <MaterialCommunityIcons name="check-circle-outline" size={14} color={zone.borderColor} />
                    : zone.borderColor === AppColors.status.warningBright
                      ? <MaterialCommunityIcons name="virus-outline" size={14} color={zone.borderColor} />
                      : <MaterialCommunityIcons name="alert" size={16} color={zone.borderColor} />,
                  onPress: () => onZonePress(zone),
                }))}
              />
            )
          ) : statesStatus === 'loading' ? (
            <MapSkeleton />
          ) : statesStatus === 'error' ? (
            <View style={styles.stateExplorerError}>
              <RetryState actionLabel={t('doctor.dashboard.retry')} onRetry={onRetryStates} compact style={styles.retryOverlay} />
            </View>
          ) : (
            <RadarMapCard
              title={t('doctor.dashboard.map.stateSelector')}
              showControls
              showFooter
              fitMapToCard
              footerTextLeft="© OpenStreetMap contributors"
              mapHeight={600}
              mapCenterLatitude={mexicoCenter.latitude}
              mapCenterLongitude={mexicoCenter.longitude}
              mapZoom={6}
              minZoom={5}
              maxZoom={12}
              enablePan
              onMapHoverChange={onMapHoverChange}
              polygons={selectorPolygons}
              pins={states.map((state) => ({
                id: state.stateId,
                latitude: state.latitude,
                longitude: state.longitude,
                borderColor: AppColors.brand.primary,
                fillColor: AppColors.surface.card,
                label: shortStateName(state.stateName),
                icon: <Feather name="map-pin" size={13} color={AppColors.brand.primary} />,
                onPress: () => onSelectState(state),
              }))}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

function mapMetric(
  metric: AdminDashboardSummaryResponse['topCards'][number],
  summary: AdminDashboardSummaryResponse,
  language: 'en' | 'es',
  t: (key: string, params?: Record<string, string | number>) => string,
  outbreakAlerts: DoctorDashboardAlertResponse[],
  localRiskMetric: DoctorDashboardMetricResponse | null,
): AdminDashboardMetric {
  const metricId = (metric.id ?? '').toLowerCase();
  if (metricId === 'outbreaks' && localRiskMetric) {
    return mapLocalRiskMetric(localRiskMetric, summary, language, t);
  }
  const title = localizeAdminMetricTitle(metric.title, t, metricId);
  const status = (metric.status ?? '').toUpperCase();
  const tone = deriveMetricTone(metric.id, status, metric.value);
  const palette = metricTonePalette(tone);
  const matchedAction = summary.recommendedActions.find((action) => action.type === metric.id?.toUpperCase());
  const recommendedAction =
    (matchedAction ? localizeRecommendedActionTitle(matchedAction, language) : null)
    ?? (language === 'es'
      ? `Revisa ${title.toLowerCase()} y manten alineado al equipo operativo.`
      : `Review ${title.toLowerCase()} and keep the operational team aligned.`);

  return {
    id: metric.id,
    title,
    value: metricDisplayValue(metricId, metric.value, t),
    valueUnit: metricValueUnit(metricId, language),
    badge: metricId === 'outbreaks'
      ? t('common.units.kilometers', { count: 75 }).toUpperCase()
      : translateDashboardBadge(t, metric.badge ?? undefined),
    badgeColor: palette.accent,
    subtitle: metric.subtitle ? localizeAdminMetricSubtitle(metric.subtitle, language) : undefined,
    tone,
    detailTitle: title,
    detailSummary: metric.subtitle
      ? localizeAdminMetricSubtitle(metric.subtitle, language)
      : language === 'es'
        ? `Senal operativa en vivo para ${title.toLowerCase()}.`
        : `Live operational signal for ${title.toLowerCase()}.`,
    signalLabel: metricToneLabel(tone, t),
    recommendedAction,
    insightCriteria: metricInsightCriteria(metricId, t),
    insightsVariant: metricId === 'outbreaks' ? 'ranked' : 'list',
    insights: buildMetricInsights(metric, summary, language, t, outbreakAlerts),
    relatedAlerts: buildMetricRelatedAlerts(metricId, summary, language),
  };
}

function mapLocalRiskMetric(
  metric: DoctorDashboardMetricResponse,
  summary: AdminDashboardSummaryResponse,
  language: 'en' | 'es',
  t: (key: string, params?: Record<string, string | number>) => string,
): AdminDashboardMetric {
  const title = t('doctor.dashboard.metrics.local-risk-level.title');
  const tone = doctorStatusToAdminTone(metric.status ?? 'neutral');
  const palette = metricTonePalette(tone);

  return {
    id: 'outbreaks',
    title,
    value: translateDashboardValue(t, metric.value),
    badge: translateDashboardBadge(t, metric.badge ?? undefined),
    badgeColor: palette.accent,
    subtitle: t('doctor.dashboard.metrics.local-risk-level.subtitle'),
    tone,
    detailTitle: title,
    detailSummary: t('doctor.dashboard.metrics.local-risk-level.detailSummary'),
    signalLabel: t('doctor.dashboard.metrics.local-risk-level.signalLabel'),
    recommendedAction: t('doctor.dashboard.metrics.local-risk-level.recommendedAction'),
    insightCriteria: t('doctor.dashboard.metrics.local-risk-level.insightCriteria'),
    insightsVariant: 'ranked',
    insights: metric.insights?.map((insight) => ({
      ...insight,
      title: translateDiseaseName(t, insight.title),
      severity: translateDashboardValue(t, insight.severity),
      cases: translateDashboardValue(t, insight.cases),
      meta: insight.meta ? translateDashboardValue(t, insight.meta) : insight.meta,
    })) ?? buildOutbreakMetricInsights([], summary, language, t),
  };
}

function doctorStatusToAdminTone(status: string): AdminDashboardMetric['tone'] {
  if (status === 'danger') return 'critical';
  if (status === 'warning') return 'warning';
  if (status === 'positive') return 'positive';
  return 'default';
}

function metricValueUnit(metricId: string, language: 'en' | 'es') {
  if (metricId === 'beds' || metricId === 'icu') return language === 'es' ? 'camas' : 'beds';
  if (metricId === 'staff') return language === 'es' ? 'miembros' : 'members';
  return undefined;
}

function metricDisplayValue(
  metricId: string,
  value: string,
  t: (key: string, params?: Record<string, string | number>) => string,
) {
  const ratio = parseRatio(value);
  if ((metricId === 'beds' || metricId === 'icu') && ratio.current != null) {
    return new Intl.NumberFormat().format(ratio.current);
  }
  return translateDashboardValue(t, value);
}

function metricInsightCriteria(
  metricId: string,
  t: (key: string, params?: Record<string, string | number>) => string,
) {
  if (metricId === 'beds') return t('admin.dashboard.kpiDetails.bedsCriteria');
  if (metricId === 'staff') return t('admin.dashboard.kpiDetails.staffCriteria');
  if (metricId === 'icu') return t('admin.dashboard.kpiDetails.icuCriteria');
  if (metricId === 'outbreaks') return t('admin.dashboard.kpiDetails.outbreaksCriteria');
  return t('admin.dashboard.kpiDetails.defaultCriteria');
}

function buildMetricInsights(
  metric: AdminDashboardSummaryResponse['topCards'][number],
  summary: AdminDashboardSummaryResponse,
  language: 'en' | 'es',
  t: (key: string, params?: Record<string, string | number>) => string,
  outbreakAlerts: DoctorDashboardAlertResponse[],
): AdminDashboardMetricInsight[] {
  const metricId = (metric.id ?? '').toLowerCase();
  if (metricId === 'beds') return buildBedMetricInsights(metric, summary, language, t);
  if (metricId === 'staff') return buildStaffMetricInsights(metric, summary, language, t);
  if (metricId === 'icu') return buildIcuMetricInsights(metric, summary, language, t);
  if (metricId === 'outbreaks') return buildOutbreakMetricInsights(outbreakAlerts, summary, language, t);
  return buildFallbackMetricInsights(metric, summary, language, t);
}

function buildBedMetricInsights(
  metric: AdminDashboardSummaryResponse['topCards'][number],
  summary: AdminDashboardSummaryResponse,
  language: 'en' | 'es',
  t: (key: string, params?: Record<string, string | number>) => string,
): AdminDashboardMetricInsight[] {
  const { current: availableBeds, total: totalBeds } = parseRatio(metric.value);
  const availability = totalBeds && availableBeds != null ? Math.round((availableBeds / totalBeds) * 100) : null;
  const tone = deriveMetricTone(metric.id, (metric.status ?? '').toUpperCase(), metric.value);
  const signal = { label: metricToneLabel(tone, t), color: toneToColor(tone) };

  return compactInsights([
    availability != null ? insight({
      title: t('admin.dashboard.kpiDetails.freeCapacity'),
      location: t('admin.dashboard.kpiDetails.hospitalResources'),
      cases: `${availability}%`,
      severity: t('admin.dashboard.kpiDetails.free'),
      color: signal.color,
      meta: signal.label,
    }) : null,
  ]).slice(0, 3);
}

function buildStaffMetricInsights(
  metric: AdminDashboardSummaryResponse['topCards'][number],
  summary: AdminDashboardSummaryResponse,
  language: 'en' | 'es',
  t: (key: string, params?: Record<string, string | number>) => string,
): AdminDashboardMetricInsight[] {
  const doctors = parseFirstNumber(metric.badge);
  const totalStaff = parseFirstNumber(metric.value);
  const nurses = totalStaff != null && doctors != null ? Math.max(0, totalStaff - doctors) : null;
  const staffColor = toneToColor(deriveMetricTone(metric.id, (metric.status ?? '').toUpperCase(), metric.value));

  return compactInsights([
    doctors != null ? insight({
      title: t('admin.dashboard.kpiDetails.doctorsAvailable'),
      location: t('admin.dashboard.kpiDetails.activeShift'),
      cases: String(doctors),
      severity: t('admin.dashboard.kpiDetails.available'),
      color: staffColor,
    }) : null,
    nurses != null ? insight({
      title: t('admin.dashboard.kpiDetails.nursesAvailable'),
      location: t('admin.dashboard.kpiDetails.activeShift'),
      cases: String(nurses),
      severity: t('admin.dashboard.kpiDetails.available'),
      color: staffColor,
    }) : null,
  ]).slice(0, 3);
}

function buildIcuMetricInsights(
  metric: AdminDashboardSummaryResponse['topCards'][number],
  summary: AdminDashboardSummaryResponse,
  language: 'en' | 'es',
  t: (key: string, params?: Record<string, string | number>) => string,
): AdminDashboardMetricInsight[] {
  const { current: availableIcu, total: totalIcu } = parseRatio(metric.value);
  const availability = totalIcu && availableIcu != null ? Math.round((availableIcu / totalIcu) * 100) : null;
  const tone = deriveMetricTone(metric.id, (metric.status ?? '').toUpperCase(), metric.value);
  const signal = { label: metricToneLabel(tone, t), color: toneToColor(tone) };

  return compactInsights([
    availability != null ? insight({
      title: t('admin.dashboard.kpiDetails.icuFreeCapacity'),
      location: t('admin.dashboard.kpiDetails.intensiveCareUnit'),
      cases: `${availability}%`,
      severity: t('admin.dashboard.kpiDetails.free'),
      color: signal.color,
      meta: signal.label,
    }) : null,
  ]).slice(0, 3);
}

function buildOutbreakMetricInsights(
  outbreakAlerts: DoctorDashboardAlertResponse[],
  summary: AdminDashboardSummaryResponse,
  language: 'en' | 'es',
  t: (key: string, params?: Record<string, string | number>) => string,
): AdminDashboardMetricInsight[] {
  const source = outbreakAlerts.length > 0
    ? outbreakAlerts.map((alert) => ({
      title: translateDiseaseName(t, alert.title.replace(/ activity$/i, '').replace(/^Actividad de\s+/i, '')),
      location: alert.municipalityName ?? alert.area,
      cases: alert.caseLabel
        ? translateDashboardValue(t, alert.caseLabel)
        : t((alert.caseCount ?? 0) === 1 ? 'common.units.case' : 'common.units.activeCases', {
          count: (alert.caseCount ?? 0).toLocaleString(),
        }),
      severity: alert.confirmationStatus ? statusLabel(alert.confirmationStatus, t) : translateDashboardValue(t, alert.priority),
      color: alert.variant === 'critical' ? AppColors.status.dangerBright : alert.variant === 'warning' ? AppColors.status.warning : AppColors.status.info,
      meta: alert.confirmationStatus ? statusLabel(alert.confirmationStatus, t) : translateDashboardValue(t, alert.priority),
      count: alert.caseCount ?? 0,
    }))
    : summary.alerts.map((alert) => ({
      title: translateDiseaseName(t, alert.disease),
      location: alert.location,
      cases: t(alert.caseCount === 1 ? 'common.units.case' : 'common.units.activeCases', {
        count: alert.caseCount.toLocaleString(),
      }),
      severity: translateDashboardValue(t, alert.severity),
      color: alert.severity === 'HIGH' ? AppColors.status.dangerBright : alert.severity === 'MEDIUM' ? AppColors.status.warning : AppColors.status.info,
      meta: translateDashboardValue(t, alert.severity),
      count: alert.caseCount,
    }));

  return source
    .sort((left, right) => right.count - left.count)
    .slice(0, 5)
    .map(({ count: _count, ...item }) => item);
}

function buildFallbackMetricInsights(
  metric: AdminDashboardSummaryResponse['topCards'][number],
  summary: AdminDashboardSummaryResponse,
  language: 'en' | 'es',
  t: (key: string, params?: Record<string, string | number>) => string,
): AdminDashboardMetricInsight[] {
  return compactInsights([
    insight({
      title: localizeAdminMetricTitle(metric.title, t),
      location: summary.hospitalName,
      cases: translateDashboardValue(t, metric.value),
      severity: translateDashboardValue(t, metric.status ?? 'Stable'),
      color: AppColors.brand.primary,
      meta: language === 'es' ? 'Seguimiento operativo' : 'Operational follow-up',
    }),
  ]);
}

function buildMetricRelatedAlerts(
  metricId: string,
  summary: AdminDashboardSummaryResponse,
  language: 'en' | 'es',
): AdminDashboardMetricInsight[] {
  const relatedTypes = relatedActionTypesForMetric(metricId);
  if (relatedTypes.length === 0) return [];
  return summary.recommendedActions
    .filter((action) => relatedTypes.includes(action.type.toUpperCase()))
    .slice(0, 3)
    .map((action) => insight({
      title: localizeRecommendedActionTitle(action, language),
      location: localizeRecommendedActionType(action.type, language),
      cases: localizePriorityLabel(action.severity, language),
      severity: localizeActionStatus(action.status, language),
      color: severityToColor(action.severity),
      meta: localizeActionStatus(action.status, language),
    }));
}

function relatedActionTypesForMetric(metricId: string): string[] {
  if (metricId === 'beds') return ['BED_CAPACITY'];
  if (metricId === 'staff') return ['STAFFING', 'SUPPLY'];
  if (metricId === 'icu') return ['BED_CAPACITY'];
  return [];
}

function insight(value: AdminDashboardMetricInsight): AdminDashboardMetricInsight {
  return value;
}

function compactInsights(items: (AdminDashboardMetricInsight | null)[]): AdminDashboardMetricInsight[] {
  return items.filter((item): item is AdminDashboardMetricInsight => item !== null);
}

function parseRatio(value: string): { current: number | null; total: number | null } {
  const match = value.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) return { current: parseFirstNumber(value), total: null };
  return {
    current: Number.parseInt(match[1], 10),
    total: Number.parseInt(match[2], 10),
  };
}

function parseFirstNumber(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = value.match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : null;
}

function statusLabel(value: string | undefined | null, t: (key: string) => string): string {
  if (value === 'CONFIRMED') return t('common.statuses.confirmed');
  if (value === 'SUSPECTED') return t('common.statuses.suspected');
  return value ?? '';
}

function describeAlert(
  alert: DoctorDashboardAlertResponse,
  t: (key: string, params?: Record<string, string | number>) => string,
): AdminDashboardAlert {
  const match = alert.description.match(/^([\d,]+) active cases? in (.+)\. Status: (.+)\.$/);
  const rawDiseaseName = alert.title.replace(/ activity$/, '');
  const diseaseName = translateDiseaseName(t, rawDiseaseName);
  if (!match) {
    return {
      id: alert.id,
      title: t('doctor.dashboard.alerts.activityTitle', { disease: diseaseName }),
      description: alert.description,
      variant: alert.variant,
      department: alert.area,
      area: alert.area,
      priority: translateDashboardValue(t, alert.priority),
      recommendedAction: alert.recommendedAction,
      caseCount: alert.caseCount,
      caseLabel: alert.caseLabel ? translateDashboardValue(t, alert.caseLabel) : undefined,
      confirmationStatus: alert.confirmationStatus ? statusLabel(alert.confirmationStatus, t) : undefined,
      municipalityName: alert.municipalityName,
      stateName: alert.stateName,
    };
  }

  const [, count, area, status] = match;
  return {
    id: alert.id,
    title: t('doctor.dashboard.alerts.activityTitle', { disease: diseaseName }),
    description: t('doctor.dashboard.alerts.activityDescription', {
      cases: t('common.units.activeCases', { count }),
      area,
      status: statusLabel(status.toUpperCase(), t),
    }),
    variant: alert.variant,
    department: alert.area,
    area: alert.area,
    priority: translateDashboardValue(t, alert.priority),
    recommendedAction: alert.recommendedAction,
    caseCount: alert.caseCount,
    caseLabel: alert.caseLabel ? translateDashboardValue(t, alert.caseLabel) : undefined,
    confirmationStatus: alert.confirmationStatus ? statusLabel(alert.confirmationStatus, t) : statusLabel(status.toUpperCase(), t),
    municipalityName: alert.municipalityName,
    stateName: alert.stateName,
  };
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

function formatSyncTime(
  value: string | undefined,
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  if (!value) return t('doctor.dashboard.map.lastSyncPending');
  return t('doctor.dashboard.map.lastSync', {
    time: new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });
}

function positionZones(
  zones: DoctorDashboardMapResponse['zones'],
  t: (key: string, params?: Record<string, string | number>) => string,
  fallbackStateName?: string | null,
): AdminDashboardZone[] {
  if (zones.length === 0) return [];

  const zonesWithCoordinates = zones.filter(
    (zone) => typeof zone.latitude === 'number' && typeof zone.longitude === 'number',
  );
  if (zonesWithCoordinates.length === 0) {
    return zones.map((zone, index) => toAdminMapZone({
      zone,
      top: `${32 + index * 8}%`,
      left: `${44 + index * 6}%`,
      borderColor: zoneSeverityColor(zone),
      t,
      fallbackStateName,
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

  return zones.map((zone) => {
    const latitude = typeof zone.latitude === 'number' ? zone.latitude : minLat + latRange / 2;
    const longitude = typeof zone.longitude === 'number' ? zone.longitude : minLon + lonRange / 2;
    const top = 18 + ((maxLat - latitude) / latRange) * 64;
    const left = 18 + ((longitude - minLon) / lonRange) * 64;

    return toAdminMapZone({
      zone,
      top: `${Math.max(12, Math.min(82, top))}%`,
      left: `${Math.max(12, Math.min(82, left))}%`,
      borderColor: zoneSeverityColor(zone),
      t,
      fallbackStateName,
    });
  });
}

function toAdminMapZone({
  zone,
  top,
  left,
  borderColor,
  t,
  fallbackStateName,
}: {
  zone: DoctorDashboardMapResponse['zones'][number];
  top: string;
  left: string;
  borderColor: string;
  t: (key: string, params?: Record<string, string | number>) => string;
  fallbackStateName?: string | null;
}): AdminDashboardZone {
  return {
    id: zone.id,
    name: zone.name,
    risk: translateDashboardValue(t, zone.risk),
    disease: translateDiseaseName(t, zone.disease),
    cases: translateDashboardValue(t, zone.cases),
    radius: translateDashboardValue(t, zone.radius),
    priority: translateDashboardValue(t, zone.priority),
    note: translateDashboardValue(t, zone.note),
    recommendedAction: translateDashboardValue(t, zone.recommendedAction),
    municipalityName: zone.municipalityName ?? undefined,
    stateName: zone.stateName ?? fallbackStateName ?? undefined,
    top,
    left,
    borderColor,
    latitude: typeof zone.latitude === 'number' ? zone.latitude : undefined,
    longitude: typeof zone.longitude === 'number' ? zone.longitude : undefined,
  };
}

function getMapCenter(zones: AdminDashboardZone[]) {
  const hospitalNode = zones.find(
    (zone) => zone.id === 'hospital-node' && typeof zone.latitude === 'number' && typeof zone.longitude === 'number',
  );
  if (hospitalNode && typeof hospitalNode.latitude === 'number' && typeof hospitalNode.longitude === 'number') {
    return { latitude: hospitalNode.latitude, longitude: hospitalNode.longitude };
  }

  const geocodedZones = zones.filter(
    (zone) => typeof zone.latitude === 'number' && typeof zone.longitude === 'number',
  );
  if (geocodedZones.length === 0) return null;

  return {
    latitude: geocodedZones.reduce((sum, zone) => sum + (zone.latitude as number), 0) / geocodedZones.length,
    longitude: geocodedZones.reduce((sum, zone) => sum + (zone.longitude as number), 0) / geocodedZones.length,
  };
}

function getRadiusBounds(
  center: { latitude: number; longitude: number } | null,
  radiusKm: number | undefined,
) {
  if (!center || typeof radiusKm !== 'number') return undefined;
  const latitudePadding = radiusKm / 111;
  const longitudePadding = radiusKm / (111 * Math.cos(center.latitude * Math.PI / 180));

  return {
    minLatitude: center.latitude - latitudePadding,
    maxLatitude: center.latitude + latitudePadding,
    minLongitude: center.longitude - longitudePadding,
    maxLongitude: center.longitude + longitudePadding,
  };
}

function shortStateName(name: string): string {
  const aliases: Record<string, string> = {
    'Coahuila de Zaragoza': 'Coahuila',
    'Michoacan de Ocampo': 'Michoacan',
    'Michoac\u00e1n de Ocampo': 'Michoac\u00e1n',
    'Veracruz de Ignacio de la Llave': 'Veracruz',
    Mexico: 'M\u00e9xico',
  };
  return aliases[name] ?? name;
}

function stateLookupKey(name: string): string {
  const aliases: Record<string, string> = {
    'Coahuila de Zaragoza': 'Coahuila',
    'Michoacan de Ocampo': 'Michoacan',
    'Michoac\u00e1n de Ocampo': 'Michoac\u00e1n',
    'Veracruz de Ignacio de la Llave': 'Veracruz',
    Mexico: 'Mexico',
    'M\u00e9xico': 'Mexico',
  };
  return (aliases[name] ?? shortStateName(name))
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function getStateBoundary(stateName: string | undefined | null) {
  if (!stateName) return undefined;
  const targetKey = stateLookupKey(stateName);
  return mexicoStateBoundaries.find((boundary) => stateLookupKey(boundary.name) === targetKey);
}

function getZoneBounds(zones: AdminDashboardZone[]) {
  const geocodedZones = zones.filter(
    (zone) => typeof zone.latitude === 'number' && typeof zone.longitude === 'number',
  );
  if (geocodedZones.length === 0) return undefined;

  const latitudes = geocodedZones.map((zone) => zone.latitude as number);
  const longitudes = geocodedZones.map((zone) => zone.longitude as number);
  const latitudePadding = Math.max(0.12, (Math.max(...latitudes) - Math.min(...latitudes)) * 0.18);
  const longitudePadding = Math.max(0.12, (Math.max(...longitudes) - Math.min(...longitudes)) * 0.18);

  return {
    minLatitude: Math.min(...latitudes) - latitudePadding,
    maxLatitude: Math.max(...latitudes) + latitudePadding,
    minLongitude: Math.min(...longitudes) - longitudePadding,
    maxLongitude: Math.max(...longitudes) + longitudePadding,
  };
}

function getBoundaryBounds(boundary: MexicoStateBoundary | undefined) {
  if (!boundary) return undefined;
  const points = boundary.geometry.coordinates.flat(2);
  if (points.length === 0) return undefined;

  const longitudes = points.map(([longitude]) => longitude);
  const latitudes = points.map(([, latitude]) => latitude);
  const latitudePadding = Math.max(0.1, (Math.max(...latitudes) - Math.min(...latitudes)) * 0.12);
  const longitudePadding = Math.max(0.1, (Math.max(...longitudes) - Math.min(...longitudes)) * 0.12);

  return {
    minLatitude: Math.min(...latitudes) - latitudePadding,
    maxLatitude: Math.max(...latitudes) + latitudePadding,
    minLongitude: Math.min(...longitudes) - longitudePadding,
    maxLongitude: Math.max(...longitudes) + longitudePadding,
  };
}

function localizeRecommendedActionTitle(
  action: AdminDashboardSummaryResponse['recommendedActions'][number],
  language: 'en' | 'es',
) {
  const localized = action.translations?.[language]?.title ?? action.translations?.en?.title;
  if (localized && localized.trim().length > 0) return localized.trim();
  if (language !== 'es') return action.title;
  const titles: Record<string, string> = {
    'Expand Monitored Bed Capacity': 'Expandir capacidad de camas monitoreadas',
    'Monitor Bed Occupancy Trend': 'Monitorear tendencia de ocupacion de camas',
    'Increase Emergency Physician Staffing': 'Aumentar cobertura de medicos de urgencias',
    'ICU Capacity Critical - Activate Surge Protocol': 'Activar protocolo de expansion UCI',
    'Implement Respiratory Isolation Measures': 'Implementar medidas de aislamiento respiratorio',
    'Replenish Critical Protective and Respiratory Supplies': 'Reabastecer insumos criticos de proteccion respiratoria',
    'Review PPE Stock Levels': 'Revisar niveles de inventario de EPP',
  };
  return titles[action.title] ?? action.title;
}

function localizedActionDescription(
  action: AdminDashboardSummaryResponse['recommendedActions'][number],
  language: 'en' | 'es',
) {
  const localized = action.translations?.[language]?.description ?? action.translations?.en?.description;
  if (localized && localized.trim().length > 0) return localized.trim();
  const category = localizeRecommendedActionType(action.type, language).toLowerCase();
  return language === 'es'
    ? `Recomendacion operativa relacionada con ${category}, priorizada por las senales actuales del hospital.`
    : `Operational recommendation related to ${category}, prioritized from the hospital's current signals.`;
}

function localizedActionSteps(
  action: AdminDashboardSummaryResponse['recommendedActions'][number],
  language: 'en' | 'es',
) {
  const localized = action.translations?.[language]?.recommendedActions ?? action.translations?.en?.recommendedActions;
  if (localized && localized.length > 0) return localized.filter((step) => step.trim().length > 0).slice(0, 4);
  const type = action.type.toUpperCase();
  if (language === 'es') {
    if (type === 'SUPPLY') return ['Validar inventario critico', 'Coordinar reabastecimiento', 'Confirmar disponibilidad con el area responsable'];
    if (type === 'BED_CAPACITY') return ['Revisar ocupacion actual', 'Activar protocolo de capacidad', 'Coordinar altas y traslados necesarios'];
    if (type === 'STAFFING') return ['Confirmar personal disponible', 'Reasignar cobertura operativa', 'Notificar al area responsable'];
    if (type.includes('EPIDEMIOLOGY')) return ['Revisar senal epidemiologica', 'Alinear respuesta preventiva', 'Notificar al equipo operativo'];
    return ['Revisar la recomendacion', 'Asignar responsable', 'Dar seguimiento operativo'];
  }
  if (type === 'SUPPLY') return ['Validate critical inventory', 'Coordinate replenishment', 'Confirm availability with the responsible area'];
  if (type === 'BED_CAPACITY') return ['Review current occupancy', 'Activate capacity protocol', 'Coordinate required discharges and transfers'];
  if (type === 'STAFFING') return ['Confirm available staff', 'Reassign operational coverage', 'Notify the responsible area'];
  if (type.includes('EPIDEMIOLOGY')) return ['Review epidemiological signal', 'Align preventive response', 'Notify the operational team'];
  return ['Review the recommendation', 'Assign an owner', 'Track operational follow-up'];
}

function localizeRecommendedActionType(type: string, language: 'en' | 'es') {
  const normalized = type.toUpperCase();
  if (language !== 'es') {
    const englishLabels: Record<string, string> = {
      SUPPLY: 'Supplies',
      BED_CAPACITY: 'Hospital Capacity',
      STAFFING: 'Staffing',
      ISOLATION: 'Local Epidemiology',
      LOCAL_EPIDEMIOLOGY: 'Local Epidemiology',
      EPIDEMIOLOGY_HOSPITAL: 'Hospital Epidemiology',
      EPIDEMIOLOGY_MUNICIPAL: 'Municipal Epidemiology',
    };
    return englishLabels[normalized] ?? type.replace(/_/g, ' ');
  }
  const labels: Record<string, string> = {
    SUPPLY: 'Insumos',
    BED_CAPACITY: 'Capacidad hospitalaria',
    STAFFING: 'Personal',
    ISOLATION: 'Epidemiologia local',
    LOCAL_EPIDEMIOLOGY: 'Epidemiologia local',
    EPIDEMIOLOGY_HOSPITAL: 'Epidemiologia hospitalaria',
    EPIDEMIOLOGY_MUNICIPAL: 'Epidemiologia municipal',
  };
  return labels[normalized] ?? type.replace(/_/g, ' ');
}

function localizePriorityLabel(severity: string, language: 'en' | 'es') {
  const normalized = severity.toUpperCase();
  if (language !== 'es') {
    const labels: Record<string, string> = {
      CRITICAL: 'Critical',
      HIGH: 'High',
      MEDIUM: 'Medium',
      MODERATE: 'Medium',
      LOW: 'Low',
    };
    return labels[normalized] ?? normalized;
  }
  const labels: Record<string, string> = {
    CRITICAL: 'Crítica',
    HIGH: 'Alta',
    MEDIUM: 'Media',
    MODERATE: 'Media',
    LOW: 'Baja',
  };
  return labels[normalized] ?? 'Prioridad';
}

function localizeAdminMetricTitle(
  title: string,
  t: (key: string, params?: Record<string, string | number>) => string,
  metricId?: string,
) {
  if (metricId) {
    const idTranslated = t(`admin.dashboard.metrics.${metricId}.title`);
    if (idTranslated !== `admin.dashboard.metrics.${metricId}.title`) return idTranslated;
  }
  const normalized = title.trim().toLowerCase();
  const keys: Record<string, string> = {
    'available beds': 'availableBeds',
    'occupied beds': 'occupiedBeds',
    'oxygen capacity': 'oxygenCapacity',
    'oxygen availability': 'oxygenAvailability',
    'staff on shift': 'staff',
    'icu availability': 'icu',
    'icu occupancy': 'icuOccupancy',
    'triage pressure': 'triagePressure',
    'emergency load': 'emergencyLoad',
    'active outbreaks': 'outbreaks',
  };
  const key = keys[normalized];
  if (!key) return title;
  const translated = t(`admin.dashboard.metrics.${key}.title`);
  return translated === `admin.dashboard.metrics.${key}.title` ? title : translated;
}

function localizeAdminMetricSubtitle(subtitle: string, language: 'en' | 'es') {
  const normalized = subtitle.trim().toLowerCase();
  if (normalized === 'icu beds') {
    return language === 'es' ? 'En Unidad de Cuidados Intensivos' : 'In Intensive Care Unit';
  }
  if (normalized === 'doctors + nurses') {
    return language === 'es' ? 'En turno' : 'On shift';
  }
  if (language !== 'es') return subtitle;
  const labels: Record<string, string> = {
    'general ward': 'Hospitalizacion general',
    'nearby area': 'Area cercana',
  };
  if (labels[normalized]) return labels[normalized];
  return subtitle
    .replace(/^Live operational signal for /i, 'Senal operativa en vivo para ')
    .replace(/^Snapshot /i, 'Corte ')
    .replace(/^Updated /i, 'Actualizado ');
}

function severityToColor(value: string) {
  const normalized = value.toUpperCase();
  if (normalized === 'CRITICAL') return AppColors.status.danger;
  if (normalized === 'HIGH') return AppColors.status.dangerBright;
  if (normalized === 'MEDIUM') return AppColors.status.warning;
  return AppColors.status.info;
}

function severityToSoftColor(value: string) {
  const normalized = value.toUpperCase();
  if (normalized === 'CRITICAL') return AppColors.status.dangerSoft;
  if (normalized === 'HIGH') return AppColors.status.dangerSoft;
  if (normalized === 'MEDIUM') return AppColors.status.warningWash;
  return AppColors.status.infoSoft;
}

function severityTone(value: string) {
  const normalized = value.toUpperCase();
  if (normalized === 'CRITICAL') return { accent: AppColors.status.danger, soft: AppColors.status.dangerSoft, border: AppColors.status.dangerBorder };
  if (normalized === 'HIGH') return { accent: AppColors.clinicalSeverity.high.accent, soft: AppColors.status.warningPanel, border: AppColors.clinicalSeverity.high.border };
  if (normalized === 'MEDIUM' || normalized === 'MODERATE') return { accent: AppColors.status.info, soft: AppColors.status.infoSoft, border: AppColors.status.infoSoft };
  return { accent: AppColors.status.success, soft: AppColors.status.successWash, border: AppColors.status.successBorder };
}

function severityRank(value: string) {
  const normalized = value.toUpperCase();
  if (normalized === 'CRITICAL') return 4;
  if (normalized === 'HIGH') return 3;
  if (normalized === 'MEDIUM' || normalized === 'MODERATE') return 2;
  return 1;
}

function compareRecommendedActions(
  first: AdminDashboardSummaryResponse['recommendedActions'][number],
  second: AdminDashboardSummaryResponse['recommendedActions'][number],
) {
  const severityDelta = severityRank(second.severity) - severityRank(first.severity);
  if (severityDelta !== 0) return severityDelta;
  return localizeRecommendedActionTitle(first, 'en').localeCompare(localizeRecommendedActionTitle(second, 'en'));
}

function isArchivedRecommendedAction(status: string) {
  const normalized = status.toUpperCase();
  return normalized === 'COMPLETED' || normalized === 'REJECTED' || normalized === 'DISMISSED';
}

function isArchivedOperationalRecommendation(recommendation: OperationalRecommendationResponse) {
  return isArchivedRecommendedAction(recommendation.status);
}

function recommendedActionKey(action: AdminDashboardSummaryResponse['recommendedActions'][number]) {
  return `${normalizeRecommendationType(action.type)}:${normalizeRecommendationText(localizeRecommendedActionTitle(action, 'en') || action.title)}`;
}

function operationalRecommendationKey(recommendation: OperationalRecommendationResponse) {
  const localizedTitle = recommendation.translations?.en?.title ?? recommendation.title;
  return `${normalizeRecommendationType(recommendation.type)}:${normalizeRecommendationText(localizedTitle)}`;
}

function normalizeRecommendationType(value: string) {
  const normalized = value.toUpperCase();
  if (normalized === 'ISOLATION') return 'LOCAL_EPIDEMIOLOGY';
  return normalized;
}

function normalizeRecommendationText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function recommendedActionCategoryTone(type: string) {
  const normalized = type.toUpperCase();
  if (normalized === 'BED_CAPACITY') {
    return { accent: AppColors.resourceStatus.info.accent, soft: AppColors.resourceStatus.info.background, border: AppColors.recommendationCategory.medical.border };
  }
  if (normalized === 'STAFFING') {
    return { accent: AppColors.recommendationCategory.logistics.accent, soft: AppColors.recommendationCategory.logistics.soft, border: AppColors.recommendationCategory.logistics.border };
  }
  if (normalized === 'SUPPLY') {
    return { accent: AppColors.recommendationCategory.staffing.accent, soft: AppColors.recommendationCategory.staffing.soft, border: AppColors.recommendationCategory.staffing.border };
  }
  if (normalized === 'LOCAL_EPIDEMIOLOGY' || normalized.startsWith('EPIDEMIOLOGY')) {
    return { accent: AppColors.clinicalSeverity.critical.text, soft: AppColors.status.dangerPanel, border: AppColors.recommendationCategory.critical.border };
  }
  return { accent: AppColors.text.body, soft: AppColors.surface.subtle, border: withAlpha(AppColors.text.body, 0.22) };
}

function actionIcon(type: string, color: string) {
  const normalized = type.toUpperCase();
  const iconName = normalized === 'SUPPLY'
    ? 'package'
    : normalized === 'BED_CAPACITY'
      ? 'activity'
    : normalized === 'STAFFING'
      ? 'users'
      : normalized === 'ISOLATION'
          ? 'shield'
          : normalized === 'LOCAL_EPIDEMIOLOGY' || normalized.startsWith('EPIDEMIOLOGY')
            ? 'map-pin'
            : 'check-square';

  return <Feather name={iconName} size={16} color={color} />;
}

function localizeActionStatus(status: string, language: 'en' | 'es') {
  const normalized = status.toUpperCase();
  const labels: Record<string, { en: string; es: string }> = {
    NEW: { en: 'Unassigned', es: 'Sin asignar' },
    ACCEPTED: { en: 'Accepted', es: 'Aceptado' },
    ASSIGNED: { en: 'Assigned', es: 'Asignado' },
    IN_PROGRESS: { en: 'In progress', es: 'En progreso' },
    COMPLETED: { en: 'Completed', es: 'Completado' },
    DISMISSED: { en: 'Dismissed', es: 'Descartado' },
  };
  return labels[normalized]?.[language] ?? status.replace(/_/g, ' ');
}

function actionStatusTone(status: string) {
  const normalized = status.toUpperCase();
  if (normalized === 'NEW') return { accent: AppColors.brand.action, soft: AppColors.surface.brandSoft, border: AppColors.border.brandSubtle };
  if (normalized === 'ASSIGNED' || normalized === 'ACCEPTED' || normalized === 'IN_PROGRESS' || normalized === 'COMPLETED') {
    return { accent: AppColors.status.success, soft: AppColors.status.successWash, border: AppColors.status.successBorder };
  }
  if (normalized === 'REJECTED' || normalized === 'DISMISSED') return { accent: AppColors.status.danger, soft: AppColors.status.dangerSoft, border: AppColors.status.dangerBorder };
  return { accent: AppColors.text.body, soft: AppColors.surface.subtle, border: AppColors.border.default };
}

function deriveMetricTone(metricId: string | undefined, status: string, value?: string): AdminDashboardMetric['tone'] {
  const normalizedMetricId = (metricId ?? '').toLowerCase();
  const ratio = value ? parseRatio(value) : { current: null, total: null };
  const availabilityPercent = ratio.total && ratio.current != null ? (ratio.current / ratio.total) * 100 : null;

  if (normalizedMetricId === 'icu') {
    if ((ratio.current != null && ratio.current <= 3) || (availabilityPercent != null && availabilityPercent <= 15)) return 'critical';
    if ((ratio.current != null && ratio.current <= 5) || (availabilityPercent != null && availabilityPercent <= 30)) return 'warning';
    return 'positive';
  }

  if (normalizedMetricId === 'beds') {
    if (availabilityPercent != null && availabilityPercent <= 15) return 'critical';
    if (availabilityPercent != null && availabilityPercent <= 30) return 'warning';
  }

  if (status.includes('CRITICAL')) return 'critical';
  if (status.includes('WARNING')) return 'warning';
  if (normalizedMetricId === 'staff') return 'positive';
  if (normalizedMetricId === 'outbreaks') return 'info';
  return 'positive';
}

function metricToneLabel(
  tone: AdminDashboardMetric['tone'],
  t: (key: string, params?: Record<string, string | number>) => string,
) {
  if (tone === 'critical') return t('admin.dashboard.kpiDetails.critical');
  if (tone === 'warning') return t('admin.dashboard.kpiDetails.watch');
  return t('admin.dashboard.kpiDetails.stable');
}

function toneToColor(tone: AdminDashboardMetric['tone']) {
  if (tone === 'critical') return AppColors.status.dangerBright;
  if (tone === 'warning') return AppColors.status.warning;
  if (tone === 'positive') return AppColors.status.successBright;
  if (tone === 'info') return AppColors.status.infoBright;
  return AppColors.text.secondary;
}

function metricTonePalette(tone: AdminDashboardMetric['tone'] = 'default', fallbackAccent?: string) {
  const palettes = {
    critical: {
      accent: AppColors.status.dangerBright,
      border: withAlpha(AppColors.status.dangerBright, 0.24),
      label: AppColors.status.dangerDeep,
      value: AppColors.status.dangerDark,
      track: AppColors.status.dangerBorder,
    },
    warning: {
      accent: AppColors.status.warning,
      border: withAlpha(AppColors.status.warning, 0.26),
      label: AppColors.status.warningLabel,
      value: AppColors.status.warningValue,
      track: AppColors.status.warningSoft,
    },
    positive: {
      accent: AppColors.status.successBright,
      border: withAlpha(AppColors.status.successBright, 0.24),
      label: AppColors.status.successText,
      value: AppColors.status.successDeep,
      track: AppColors.status.successSoft,
    },
    info: {
      accent: AppColors.status.infoBright,
      border: withAlpha(AppColors.status.info, 0.22),
      label: AppColors.status.infoText,
      value: AppColors.text.primary,
      track: AppColors.clinicalSeverity.moderate.badge,
    },
    default: {
      accent: fallbackAccent ?? AppColors.text.secondary,
      border: AppColors.border.default,
      label: AppColors.text.secondary,
      value: AppColors.text.primary,
      track: AppColors.border.default,
    },
  };

  return palettes[tone ?? 'default'];
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 32,
  },
  container: {
    padding: 24,
    gap: 24,
  },
  heroStrip: {
    paddingHorizontal: 24,
    paddingVertical: 22,
    borderRadius: 24,
    backgroundColor: AppColors.surface.raised,
    borderWidth: 1,
    borderColor: withAlpha(AppColors.brand.primary, 0.08),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: AppColors.shadow.blue,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 26,
    elevation: 4,
  },
  heroCopy: {
    flex: 1,
    paddingRight: 24,
  },
  heroEyebrow: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: AppColors.brand.primary,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '700',
    color: AppColors.text.primary,
    marginBottom: 8,
    maxWidth: 720,
  },
  heroDescription: {
    fontSize: 15,
    lineHeight: 24,
    color: AppColors.text.body,
    maxWidth: 760,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
  },
  heroActionsNarrow: {
    width: '100%',
    flexDirection: 'column',
  },
  secondaryAction: {
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  errorCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: AppColors.status.infoSoft,
    borderColor: AppColors.status.infoSoft,
  },
  errorTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: AppColors.status.infoDeep,
  },
  errorText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: AppColors.brand.link,
  },
  skeletonSpacedSmall: {
    marginTop: 8,
  },
  skeletonBadge: {
    width: 54,
    height: 24,
    borderRadius: 999,
    backgroundColor: AppColors.chart.grid,
  },
  topCardsRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  topCardsRowCompact: {
    gap: 10,
  },
  metricCard: {
    flex: 1,
    minHeight: 176,
    padding: 24,
    paddingTop: 22,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: AppColors.text.primary,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.10,
    shadowRadius: 30,
    elevation: 5,
  },
  metricAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 12,
  },
  metricTitle: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 0,
    color: AppColors.text.secondary,
  },
  metricBadgePill: {
    flexShrink: 0,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  metricBadge: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 54,
  },
  metricValueCopy: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 8,
  },
  skeletonValueBlock: {
    flex: 1,
    minWidth: 0,
    gap: 7,
  },
  metricIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  metricValue: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    color: AppColors.text.primary,
  },
  metricValueUnit: {
    flexShrink: 1,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    color: AppColors.text.primary,
  },
  metricSubtitle: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 18,
    color: AppColors.text.secondary,
  },
  skeletonSubtitleBlock: {
    marginTop: 12,
    gap: 7,
  },
  dashboardSection: {
    gap: 16,
  },
  mainGrid: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'stretch',
  },
  mainGridCompact: {
    flexDirection: 'column',
  },
  mapCard: {
    flexShrink: 0,
    alignSelf: 'stretch',
  },
  retryHost: {
    position: 'relative',
    overflow: 'hidden',
  },
  retryOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.surface.subtleTranslucent,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: withAlpha(AppColors.brand.primary, 0.14),
    backgroundColor: AppColors.surface.card,
    shadowColor: AppColors.text.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  retryText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: AppColors.brand.primary,
  },
  mapSkeleton: {
    flex: 1,
    height: 560,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: withAlpha(AppColors.brand.primary, 0.05),
    backgroundColor: AppColors.border.default,
    shadowColor: AppColors.text.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 26,
    elevation: 3,
  },
  mapCardCompact: {
    width: '100%',
  },
  alertsPanel: {
    flexShrink: 0,
    display: 'flex',
    padding: 16,
    backgroundColor: AppColors.surface.cardSoft,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.border.default,
    overflow: 'hidden',
    shadowColor: AppColors.text.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 26,
    elevation: 3,
    alignSelf: 'stretch',
  },
  sidePanel: {
    minHeight: 560,
  },
  alertsHeader: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.surface.muted,
  },
  alertsTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    color: AppColors.text.primary,
  },
  sectionHeaderRule: {
    width: 42,
    height: 3,
    borderRadius: 999,
    backgroundColor: AppColors.brand.primary,
    marginTop: 10,
  },
  alertsList: {
    flex: 1,
    padding: 16,
    gap: 12,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  alertItems: {
    gap: 12,
  },
  alertCard: {
    width: '100%',
    minHeight: 0,
  },
  alertSkeletonItem: {
    minHeight: 96,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.border.soft,
    backgroundColor: AppColors.surface.subtle,
    padding: 14,
    gap: 10,
    justifyContent: 'center',
  },
  analyticsCard: {
    flexShrink: 0,
    minHeight: 560,
  },
  stackCard: {
    width: '100%',
    minHeight: 360,
  },
  caseCard: {
    flexShrink: 0,
    display: 'flex',
    minHeight: 560,
    borderRadius: 14,
    backgroundColor: AppColors.surface.card,
    overflow: 'hidden',
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
    color: AppColors.text.primary,
  },
  caseSectionLabel: {
    marginBottom: 12,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: AppColors.text.soft,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  caseMetrics: {
    flex: 1,
    padding: 16,
    gap: 12,
    justifyContent: 'space-between',
  },
  actionItems: {
    gap: 12,
  },
  actionMetricCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: AppColors.surface.card,
    gap: 12,
  },
  actionSkeletonItem: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.border.soft,
    backgroundColor: AppColors.surface.subtle,
    gap: 12,
  },
  skeletonActionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: AppColors.chart.grid,
  },
  actionMetricTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  actionMetricIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actionMetricTextGroup: {
    flex: 1,
    gap: 4,
  },
  actionMetricMeta: {
    fontSize: 12,
    lineHeight: 16,
    color: AppColors.text.soft,
  },
  actionMetricBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  actionPriorityBadge: {
    minHeight: 26,
    borderRadius: 999,
    paddingLeft: 10,
    paddingRight: 4,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  actionPriorityText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
    color: AppColors.text.body,
    textTransform: 'uppercase',
  },
  actionPriorityValue: {
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  actionStatusBadge: {
    minHeight: 26,
    borderRadius: 999,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  showMoreActionsButton: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.border.brandSubtle,
    backgroundColor: AppColors.surface.brandSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  showMoreActionsText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    color: AppColors.brand.primary,
  },
  showMoreActionsCount: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.surface.card,
  },
  showMoreActionsCountText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
    color: AppColors.brand.action,
  },
  recommendationModalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  recommendationModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: withAlpha(AppColors.text.primary, 0.28),
  },
  recommendationModalCard: {
    width: '100%',
    maxWidth: 620,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: AppColors.border.panelStrong,
    backgroundColor: AppColors.surface.card,
    padding: 22,
    shadowColor: AppColors.text.primary,
    shadowOpacity: 0.18,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
    elevation: 24,
  },
  recommendationModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recommendationModalIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  recommendationModalTitleGroup: {
    flex: 1,
  },
  recommendationModalEyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    color: AppColors.brand.primary,
    textTransform: 'uppercase',
  },
  recommendationModalTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    color: AppColors.text.primary,
  },
  recommendationModalClose: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.border.panelStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.surface.card,
  },
  recommendationModalDescription: {
    marginTop: 16,
    fontSize: 14,
    lineHeight: 22,
    color: AppColors.text.body,
  },
  recommendationModalSignalRow: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  recommendationModalSignalCard: {
    flex: 1,
    minWidth: 190,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.border.panelStrong,
    backgroundColor: AppColors.surface.subtle,
    padding: 14,
    gap: 6,
  },
  recommendationModalSignalLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
    color: AppColors.text.soft,
    textTransform: 'uppercase',
  },
  recommendationModalSignalValue: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '900',
    color: AppColors.text.primary,
  },
  recommendationModalActionBlock: {
    marginTop: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AppColors.border.panelStrong,
    padding: 14,
    gap: 10,
  },
  recommendationModalActionTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '900',
    color: AppColors.text.primary,
  },
  recommendationModalStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  recommendationModalStepNumber: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.surface.card,
    flexShrink: 0,
  },
  recommendationModalStepNumberText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
  },
  recommendationModalStepText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: AppColors.text.body,
    fontWeight: '700',
  },
  recommendationModalButton: {
    marginTop: 18,
    alignSelf: 'stretch',
  },
  caseMetricName: {
    flex: 1,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
    color: AppColors.text.body,
  },
  caseMetricValue: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
    color: AppColors.text.body,
  },
  moreAlertsButton: {
    minHeight: 52,
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: withAlpha(AppColors.brand.primary, 0.16),
    backgroundColor: AppColors.surface.brandSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  moreAlertsText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    color: AppColors.brand.primary,
  },
  moreAlertsBadge: {
    minWidth: 26,
    height: 24,
    borderRadius: 999,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.surface.card,
  },
  moreAlertsBadgeText: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '900',
    color: AppColors.brand.primary,
  },
  moreAlertsOverlay: {
    flex: 1,
    padding: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreAlertsBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: withAlpha(AppColors.text.primary, 0.38),
  },
  moreAlertsCard: {
    width: '100%',
    maxWidth: 760,
    maxHeight: '86%',
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: AppColors.surface.card,
    borderWidth: 1,
    borderColor: AppColors.border.default,
    shadowColor: AppColors.text.primary,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.16,
    shadowRadius: 42,
    elevation: 6,
  },
  moreAlertsHeader: {
    minHeight: 84,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border.default,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  moreAlertsEyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: AppColors.text.secondary,
  },
  moreAlertsTitle: {
    marginTop: 4,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '900',
    color: AppColors.text.primary,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: AppColors.border.default,
    backgroundColor: AppColors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreAlertsList: {
    padding: 24,
    gap: 14,
  },
  stateExplorerOverlay: {
    flex: 1,
    padding: 28,
    justifyContent: 'center',
  },
  stateExplorerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: withAlpha(AppColors.text.primary, 0.38),
  },
  stateExplorerCard: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: AppColors.surface.card,
    borderWidth: 1,
    borderColor: AppColors.border.default,
    shadowColor: AppColors.text.primary,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.16,
    shadowRadius: 34,
    elevation: 6,
  },
  stateExplorerHeader: {
    minHeight: 76,
    paddingHorizontal: 22,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border.default,
  },
  stateExplorerEyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    color: AppColors.brand.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  stateExplorerTitle: {
    marginTop: 4,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    color: AppColors.text.primary,
  },
  stateExplorerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stateExplorerSecondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: withAlpha(AppColors.brand.primary, 0.14),
    backgroundColor: AppColors.surface.subtle,
  },
  stateExplorerSecondaryText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
    color: AppColors.brand.primary,
  },
  stateExplorerError: {
    flex: 1,
    minHeight: 620,
    position: 'relative',
    backgroundColor: AppColors.surface.subtle,
  },
});

export default AdminDashboard;
export const heroStripStylesForTesting = styles;
