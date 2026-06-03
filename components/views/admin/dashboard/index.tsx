import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, LayoutChangeEvent, ScrollView, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle, useWindowDimensions } from 'react-native';
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
import { useTranslation } from '@/i18n';
import { getHospitalAdminLabel, isSpanish } from '@/components/views/admin/localization';
import { translateDashboardBadge, translateDashboardValue } from '@/lib/dashboardLocalization';

const MAP_IMAGE_URI = 'https://www.figma.com/api/mcp/asset/5bd3e67c-b2d1-4685-9db8-9c8033f3f9f3';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

export function AdminDashboard() {
  const router = useRouter();
  const { logout, profile } = useAuth();
  const { language, t } = useTranslation();
  const { width: viewportWidth } = useWindowDimensions();
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
  const isCompact = viewportWidth < 1220;
  const isNarrow = viewportWidth < 860;
  const actionWidth = !isCompact && gridWidth > 0 ? (gridWidth - gridGap) * 0.28 : undefined;
  const mapWidth = !isCompact && gridWidth > 0 && actionWidth ? gridWidth - actionWidth - gridGap : undefined;
  const topCardColumns = isNarrow ? 1 : isCompact ? 2 : 4;
  const topCardWidth = gridWidth > 0
    ? (gridWidth - topGap * Math.max(0, topCardColumns - 1)) / topCardColumns
    : undefined;

  const loadDashboard = useCallback(async () => {
    setLoadState((current) => (current === 'success' ? 'success' : 'loading'));
    setError(null);
    try {
      const data = await getAdminDashboardSummary();
      setDashboard(data);
      setLoadState('success');
    } catch (nextError) {
      setLoadState('error');
      setError(nextError instanceof Error ? nextError.message : isSpanish(language) ? 'No se pudo cargar el panel administrativo.' : 'Unable to load the admin dashboard.');
    }
  }, [language]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const topCards = useMemo(() => {
    if (!dashboard) return [];
    return dashboard.topCards.map((card) => mapMetric(card, dashboard, language, t));
  }, [dashboard, language, t]);
  const alerts = useMemo(() => (dashboard?.alerts ?? []).map((alert) => mapAlert(alert, language, t)), [dashboard, language, t]);
  const mapZones = useMemo(() => positionZones(dashboard?.mapZones ?? [], language, t), [dashboard, language, t]);
  const mapViewport = useMemo(() => deriveMapViewport(dashboard?.mapZones ?? []), [dashboard]);
  const actionCards = useMemo(() => dashboard?.recommendedActions ?? [], [dashboard]);

  return (
    <DashboardLayout
      active="dashboard"
      sectionLabel={isSpanish(language) ? 'Panel' : 'Dashboard'}
      userName={profile?.fullName ?? getHospitalAdminLabel(language)}
      userId={profile?.email ?? undefined}
      avatarText={initialsFromName(profile?.fullName)}
      links={adminNavigationLinks}
      sidebarItems={adminSidebarItems}
      onLogout={async () => { await logout(); router.replace('/login'); }}
    >
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
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
                leadingIcon={<Feather name="download" size={12} color="#334155" />}
                style={styles.secondaryAction}
                onPress={() => setIsExportOpen(true)}
              />
              <Button
                label={isSpanish(language) ? 'Protocolo de alerta' : 'Alert Protocol'}
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
              <Text style={styles.errorTitle}>{isSpanish(language) ? 'Panel no disponible' : 'Dashboard unavailable'}</Text>
              <Text style={styles.errorText}>{error}</Text>
            </CardBase>
          ) : null}

          {loadState === 'loading' && !dashboard ? (
            <CardBase style={styles.loadingCard}>
              <ActivityIndicator color="#0003B8" />
              <Text style={styles.loadingText}>{isSpanish(language) ? 'Cargando panel operativo...' : 'Loading operational dashboard...'}</Text>
            </CardBase>
          ) : (
            <>
              <View
                style={styles.dashboardSection}
                onLayout={(event: LayoutChangeEvent) => {
                  const nextWidth = event.nativeEvent.layout.width;
                  if (Math.abs(nextWidth - gridWidth) > 1) {
                    setGridWidth(nextWidth);
                  }
                }}
              >
                <View style={[styles.mainGrid, isCompact && styles.mainGridCompact]}>
                  <RadarMapCard
                    title={isSpanish(language) ? 'Mapa de calor en vivo' : 'Live Heatmap'}
                    showOverlayPanel
                    overlayTitle={isSpanish(language) ? 'MAPA DE CALOR EN VIVO' : 'LIVE HEATMAP'}
                    overlayBadgeLabel={isSpanish(language) ? 'SEGURO' : 'SECURE'}
                    overlayItems={buildMapOverlayItems(mapZones, language)}
                    showControls
                    legendItems={[
                      { label: isSpanish(language) ? 'Critico' : 'Critical', color: '#EF4444' },
                      { label: isSpanish(language) ? 'Advertencia' : 'Warning', color: '#F97316' },
                      { label: isSpanish(language) ? 'Estable' : 'Stable', color: '#0003B8' },
                    ]}
                    footerTextRight={
                      dashboard?.generatedAt
                        ? `${isSpanish(language) ? 'Ultima sincronizacion' : 'Last Sync'}: ${new Date(dashboard.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : isSpanish(language) ? 'Ultima sincronizacion: pendiente' : 'Last Sync: Pending'
                    }
                    mapImageUri={MAP_IMAGE_URI}
                    mapHeight={isNarrow ? 360 : 430}
                    mapCenterLatitude={mapViewport.centerLatitude}
                    mapCenterLongitude={mapViewport.centerLongitude}
                    mapZoom={mapViewport.zoom}
                    minZoom={mapViewport.minZoom}
                    maxZoom={16}
                    mapBounds={mapViewport.bounds}
                    enablePan
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
                    style={[
                      styles.mapCard,
                      isCompact ? styles.mapCardCompact : null,
                      mapWidth ? { width: mapWidth, flex: undefined } : null,
                    ]}
                  />

                  <PriorityActionsCard
                    actions={actionCards}
                    language={language}
                    style={[
                      styles.analyticsCard,
                      isCompact && styles.stackCard,
                      actionWidth ? { width: actionWidth, flex: undefined } : null,
                    ]}
                    onOpenReport={() => setIsReportOpen(true)}
                  />
                </View>

                <View style={[styles.topCardsRow, isCompact && styles.topCardsRowCompact]}>
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

                <View style={[styles.alertsPanel, styles.alertsPanelHorizontal]}>
                  <View style={styles.alertsHeader}>
                    <Text style={styles.alertsTitle}>{isSpanish(language) ? 'Alertas contextuales de enfermedad' : 'Contextual Disease Alerts'}</Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.alertsListHorizontal}
                  >
                    {alerts.map((alert) => (
                      <TouchableOpacity
                        key={alert.id}
                        activeOpacity={0.8}
                        onPress={() => setSelectedAlert(alert)}
                        style={styles.alertHorizontalItem}
                      >
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
  progressColor = '#93C5FD',
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
            <Feather name="alert-triangle" size={14} color="#1E40AF" style={styles.metricIcon} />
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
            trackColor={isCritical ? '#BFDBFE' : '#E2E8F0'}
            style={styles.metricProgress}
          />
        ) : null}
      </CardBase>
    </TouchableOpacity>
  );
}

function PriorityActionsCard({
  actions,
  language,
  style,
  onOpenReport,
}: {
  actions: AdminDashboardSummaryResponse['recommendedActions'];
  language: 'en' | 'es';
  style?: StyleProp<ViewStyle>;
  onOpenReport?: () => void;
}) {
  return (
    <CardBase style={[styles.caseCard, style]}>
      <View style={styles.caseHeader}>
        <Text style={styles.caseTitle}>{language === 'es' ? 'Acciones prioritarias' : 'Priority Actions'}</Text>
        <Button
          label={language === 'es' ? 'En vivo' : 'Live Feed'}
          size="sm"
          variant="surface"
          style={styles.caseFilter}
          labelStyle={styles.caseFilterLabel}
        />
      </View>

      <Text style={styles.caseSectionLabel}>{language === 'es' ? 'Cola operativa' : 'Operational Queue'}</Text>

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
              {action.type.replace(/_/g, ' ')} | {action.severity.toLowerCase()} {language === 'es' ? 'prioridad' : 'priority'}
            </Text>
          </View>
        ))}
      </View>

      <Button
        label={language === 'es' ? 'Ver reporte epidemiologico completo' : 'View Full Epidemiological Report'}
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
  language: 'en' | 'es',
  t: (key: string, params?: Record<string, string | number>) => string,
): AdminDashboardMetric {
  const title = localizeAdminMetricTitle(metric.title, language);
  const status = (metric.status ?? '').toUpperCase();
  const recommendedAction =
    summary.recommendedActions.find((action) => action.type === metric.id?.toUpperCase())?.title
    ?? (language === 'es'
      ? `Revisa ${title.toLowerCase()} y manten alineado al equipo operativo.`
      : `Review ${title.toLowerCase()} and keep the operational team aligned.`);

  return {
    title,
    value: translateDashboardValue(t, metric.value),
    badge: translateDashboardBadge(t, metric.badge ?? undefined),
    badgeColor: status.includes('CRITICAL') ? '#1E40AF' : status.includes('WARNING') ? '#3B82F6' : '#93C5FD',
    subtitle: metric.subtitle ? localizeAdminMetricSubtitle(metric.subtitle, language) : undefined,
    progressValue: deriveProgress(metric.value, metric.status),
    progressColor: status.includes('CRITICAL') ? '#1E40AF' : status.includes('WARNING') ? '#3B82F6' : '#93C5FD',
    segmented: title.toUpperCase().includes('OXYGEN'),
    tone: status.includes('CRITICAL') ? 'critical' : 'default',
    detailTitle: title,
    detailSummary: metric.subtitle
      ? localizeAdminMetricSubtitle(metric.subtitle, language)
      : language === 'es'
        ? `Senal operativa en vivo para ${title.toLowerCase()}.`
        : `Live operational signal for ${title.toLowerCase()}.`,
    signalLabel: translateDashboardValue(t, metric.status ?? 'Stable'),
    recommendedAction,
  };
}

function mapAlert(
  alert: AdminDashboardSummaryResponse['alerts'][number],
  language: 'en' | 'es',
  t: (key: string, params?: Record<string, string | number>) => string,
): AdminDashboardAlert {
  return {
    id: alert.id,
    title: language === 'es' ? `Alerta de ${translateDashboardValue(t, alert.disease)}` : `${translateDashboardValue(t, alert.disease)} alert`,
    description: language === 'es'
      ? `${alert.message} (${alert.caseCount} casos activos).`
      : `${alert.message} (${alert.caseCount} active cases).`,
    variant: alert.severity === 'HIGH' ? 'critical' : alert.severity === 'MEDIUM' ? 'warning' : 'info',
    department: alert.location,
    priority: translateDashboardValue(t, alert.severity),
    recommendedAction: language === 'es'
      ? `Revisa las medidas de contencion en ${alert.location} y ajusta el personal si aumenta la presion de casos.`
      : `Review containment measures for ${alert.location} and adjust staffing if case pressure rises.`,
  };
}

function positionZones(
  zones: AdminDashboardSummaryResponse['mapZones'],
  language: 'en' | 'es',
  t: (key: string, params?: Record<string, string | number>) => string,
): AdminDashboardZone[] {
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
    const risk = translateDashboardValue(t, zone.status.replace(/_/g, ' '));
    return {
      id: zone.municipalityId,
      name: zone.municipalityName,
      risk,
      disease: language === 'es'
        ? zone.outbreakCount === 1 ? '1 senal de brote' : `${zone.outbreakCount} senales de brote`
        : zone.outbreakCount === 1 ? '1 outbreak signal' : `${zone.outbreakCount} outbreak signals`,
      cases: language === 'es'
        ? `${zone.outbreakCount} cluster${zone.outbreakCount === 1 ? '' : 'es'} activos`
        : `${zone.outbreakCount} active cluster${zone.outbreakCount === 1 ? '' : 's'}`,
      radius: translateDashboardValue(t, language === 'es' ? 'Monitoreo regional' : 'Regional monitoring'),
      priority: zone.status.toUpperCase().includes('CRITICAL')
        ? (language === 'es' ? 'Inmediata' : 'Immediate')
        : zone.status.toUpperCase().includes('WARNING')
          ? (language === 'es' ? 'Alta' : 'High')
          : (language === 'es' ? 'Monitorear' : 'Monitor'),
      note: language === 'es'
        ? `${zone.municipalityName} esta bajo seguimiento dentro del perimetro de alerta del hospital.`
        : `${zone.municipalityName} is being tracked as part of the hospital alert perimeter.`,
      recommendedAction: language === 'es'
        ? `Coordina la planeacion de ingresos frente a las ${zone.outbreakCount} senales de brote en ${zone.municipalityName}.`
        : `Coordinate intake planning against the ${zone.outbreakCount} outbreak signal(s) in ${zone.municipalityName}.`,
      top: `${Math.max(12, Math.min(82, top))}%`,
      left: `${Math.max(12, Math.min(82, left))}%`,
      latitude: zone.latitude,
      longitude: zone.longitude,
      borderColor: zone.status.toUpperCase().includes('CRITICAL') ? '#EF4444' : zone.status.toUpperCase().includes('WARNING') ? '#F97316' : '#0003B8',
    };
  });
}

function deriveMapViewport(zones: AdminDashboardSummaryResponse['mapZones']) {
  const withCoordinates = zones.filter((zone) => Number.isFinite(zone.latitude) && Number.isFinite(zone.longitude));
  if (withCoordinates.length === 0) {
    return {
      centerLatitude: 19.4326,
      centerLongitude: -99.1332,
      zoom: 10,
      minZoom: 8,
      bounds: undefined,
    };
  }

  const latitudes = withCoordinates.map((zone) => zone.latitude);
  const longitudes = withCoordinates.map((zone) => zone.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const centerLatitude = (minLatitude + maxLatitude) / 2;
  const centerLongitude = (minLongitude + maxLongitude) / 2;
  const span = Math.max(maxLatitude - minLatitude, maxLongitude - minLongitude);

  let zoom = 11;
  if (span > 2.1) zoom = 7;
  else if (span > 1.2) zoom = 8;
  else if (span > 0.65) zoom = 9;
  else if (span > 0.3) zoom = 10;

  return {
    centerLatitude,
    centerLongitude,
    zoom,
    minZoom: Math.max(6, zoom - 2),
    bounds: {
      minLatitude: minLatitude - 0.25,
      maxLatitude: maxLatitude + 0.25,
      minLongitude: minLongitude - 0.25,
      maxLongitude: maxLongitude + 0.25,
    },
  };
}

function buildMapOverlayItems(zones: AdminDashboardZone[], language: 'en' | 'es') {
  const critical = zones.filter((zone) => zone.borderColor === '#EF4444').length;
  const warning = zones.filter((zone) => zone.borderColor === '#F97316').length;
  return [
    { label: language === 'es' ? 'Zonas criticas' : 'Critical zones', value: String(critical), color: '#EF4444' },
    { label: language === 'es' ? 'Zonas de advertencia' : 'Warning zones', value: String(warning), color: '#F97316' },
    { label: language === 'es' ? 'Municipios monitoreados' : 'Tracked municipalities', value: String(zones.length), color: '#0003B8' },
  ];
}

function localizeAdminMetricTitle(title: string, language: 'en' | 'es') {
  if (language !== 'es') return title;
  const normalized = title.trim().toLowerCase();
  const dictionary: Record<string, string> = {
    'available beds': 'Camas disponibles',
    'occupied beds': 'Camas ocupadas',
    'oxygen capacity': 'Capacidad de oxigeno',
    'oxygen availability': 'Disponibilidad de oxigeno',
    'icu occupancy': 'Ocupacion UCI',
    'triage pressure': 'Presion de triaje',
    'emergency load': 'Carga de emergencias',
  };
  return dictionary[normalized] ?? title;
}

function localizeAdminMetricSubtitle(subtitle: string, language: 'en' | 'es') {
  if (language !== 'es') return subtitle;
  return subtitle
    .replace(/^Live operational signal for /i, 'Senal operativa en vivo para ')
    .replace(/^Snapshot /i, 'Corte ')
    .replace(/^Updated /i, 'Actualizado ');
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
  if (value === 'HIGH') return '#1E40AF';
  if (value === 'MEDIUM') return '#3B82F6';
  return '#93C5FD';
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
    padding: 24,
    gap: 24,
  },
  heroStrip: {
    paddingHorizontal: 24,
    paddingVertical: 22,
    borderRadius: 24,
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 3, 184, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000F6B',
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
    color: '#0003B8',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    maxWidth: 720,
  },
  heroDescription: {
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
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
  primaryAction: {
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#0003B8',
    borderColor: '#0003B8',
  },
  errorCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  errorTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  errorText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: '#1D4ED8',
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
  topCardsRowCompact: {
    gap: 10,
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
    backgroundColor: '#F0F7FF',
    borderColor: '#BFDBFE',
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
    color: '#1E40AF',
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
    color: '#1E3A8A',
  },
  metricSubtitle: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 15,
    color: '#94A3B8',
  },
  metricSubtitleCritical: {
    color: '#1E40AF',
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
  mainGridCompact: {
    flexDirection: 'column',
  },
  mapCard: {
    flexShrink: 0,
    alignSelf: 'stretch',
  },
  mapCardCompact: {
    width: '100%',
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
  alertsPanelHorizontal: {
    minHeight: 226,
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
  alertsListHorizontal: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 14,
  },
  alertHorizontalItem: {
    width: 320,
  },
  alertCard: {
    width: '100%',
    minHeight: 0,
  },
  analyticsCard: {
    flexShrink: 0,
    minHeight: 540,
  },
  stackCard: {
    width: '100%',
    minHeight: 360,
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
    borderRadius: 12,
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
    borderRadius: 12,
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
export const heroStripStylesForTesting = styles;
