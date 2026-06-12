import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { systemNavigationLinks, getSystemSidebarItems } from '@/components/dashboard/systemNavigation';
import { RadarMapCard, RadarMapPin, RadarMapPolygon } from '@/components/dashboard/RadarMapCard';
import { Button } from '@/components/foundation/Button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { OverlayStatCard } from '@/components/overlays/OverlayStatCard';
import { PdfPreviewFrame } from '@/components/overlays/PdfPreviewFrame';
import { CardBase } from '@/components/patterns/CardBase';
import { MexicoStateBoundary, mexicoStateBoundaries } from '@/assets/maps/mexicoStateBoundaries';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/i18n';
import { initialsFromName } from '@/lib/format';
import {
  getSystemDashboardSummary,
  SystemDashboardSummaryResponse,
  SystemHospitalUserMetricResponse,
  SystemHospitalOutbreakResponse,
  SystemMetricResponse,
  SystemNearbyOutbreakResponse,
} from '@/lib/systemAdmin';
import { isSpanish } from '@/components/views/admin/localization';
import { AppColors, withAlpha } from '@/constants/theme';

const metricIcons: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  hospitals: 'hospital-building',
  hospital: 'hospital-building',
  users: 'account-group-outline',
  system: 'shield-check-outline',
  check: 'shield-check-outline',
  ai: 'brain',
  cpu: 'brain',
};

const mexicoBounds = getMexicoBounds(mexicoStateBoundaries);

export function SystemDashboard() {
  const router = useRouter();
  const { logout, profile } = useAuth();
  const { language } = useTranslation();
  const es = isSpanish(language);
  const [summary, setSummary] = useState<SystemDashboardSummaryResponse | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<SystemHospitalOutbreakResponse | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<SystemMetricResponse | null>(null);
  const [selectedHospitalUserMetric, setSelectedHospitalUserMetric] = useState<SystemHospitalUserMetricResponse | null>(null);
  const [isHospitalMapExpanded, setIsHospitalMapExpanded] = useState(false);
  const [isActivityExpanded, setIsActivityExpanded] = useState(false);
  const [isHospitalMapHovered, setIsHospitalMapHovered] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [mainGridWidth, setMainGridWidth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sidebarItems = useMemo(() => getSystemSidebarItems(language), [language]);
  const topRegions = useMemo(
    () => [...(summary?.regionalDistribution ?? [])].sort((a, b) => b.value - a.value).slice(0, 3),
    [summary?.regionalDistribution],
  );
  const maxRegionValue = useMemo(
    () => Math.max(1, ...topRegions.map((region) => region.value)),
    [topRegions],
  );
  const regionalMapPolygons = useMemo<RadarMapPolygon[]>(() => {
    const valuesByState = new Map((summary?.regionalDistribution ?? []).map((region) => [stateLookupKey(region.label), region.value]));
    return mexicoStateBoundaries.map((boundary) => {
      const value = valuesByState.get(stateLookupKey(boundary.name)) ?? 0;
      const intensity = value > 0 ? value / maxRegionValue : 0;
      return {
        id: boundary.id,
        geometry: boundary.geometry,
        fillColor: regionalFillColor(intensity),
        strokeColor: value > 0 ? withAlpha(AppColors.brand.action, 0.58) : withAlpha(AppColors.text.secondary, 0.22),
        strokeWidth: value > 0 ? 1.25 : 0.8,
      };
    });
  }, [maxRegionValue, summary?.regionalDistribution]);
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
  const handleMainGridLayout = useCallback((event: { nativeEvent: { layout: { width: number } } }) => {
    const nextWidth = event.nativeEvent.layout.width;
    setMainGridWidth((currentWidth) => (Math.abs(currentWidth - nextWidth) > 1 ? nextWidth : currentWidth));
  }, []);
  const mainPanelWidth = mainGridWidth > 0 ? (mainGridWidth - 14) / 2 : undefined;

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

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
      <ScrollView
        testID="system-dashboard-screen"
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isHospitalMapHovered && !isHospitalMapExpanded}
      >
        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>{es ? 'Vista global' : 'System Overview'}</Text>
            <Text style={styles.title}>{es ? 'Estado general de StatuScope' : 'System Overview'}</Text>
            <Text style={styles.subtitle}>
              {es
                ? 'Estado en tiempo real de hospitales, usuarios, servicios y brotes cercanos a la red.'
                : 'Real-time status of hospitals, users, services, and nearby outbreak pressure across the network.'}
            </Text>
          </View>
          <View style={styles.heroActions}>
            <Button
              label={es ? 'Exportar reporte' : 'Export Report'}
              variant="secondary"
              size="sm"
              leadingIcon={<Feather name="download" size={15} color={AppColors.text.body} />}
              onPress={() => setIsReportOpen(true)}
              disabled={!summary}
            />
            <Button
              label={es ? 'Actualizar metricas' : 'Refresh Metrics'}
              variant="primary"
              size="sm"
              leadingIcon={<Feather name="refresh-cw" size={15} color={AppColors.surface.card} />}
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
                <TouchableOpacity key={metric.id} style={styles.metricTouchable} activeOpacity={0.84} onPress={() => setSelectedMetric(metric)}>
                  <MetricCard metric={metric} es={es} />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.mainGrid} onLayout={handleMainGridLayout}>
              <View style={[styles.regionalMapPanel, mainPanelWidth ? { width: mainPanelWidth } : styles.mainPanelFallback]}>
                <RadarMapCard
                  title={es ? 'Mapa de sucursales por estado' : 'Branch Map by State'}
                  subtitle={es ? 'Estados con mayor presencia hospitalaria' : 'States with the largest hospital footprint'}
                  showOverlayPanel
                  overlayTitle={es ? 'Top estados con mas hospitales' : 'Top States by Hospitals'}
                  overlayBadgeLabel="TOP 3"
                  overlayItems={topRegions.map((region) => ({
                    label: shortStateName(region.label),
                    value: `${region.value}`,
                    color: regionalFillColor(region.value / maxRegionValue),
                  }))}
                  showControls
                  showFooter={false}
                  mapHeight={388}
                  fitMapToCard
                  mapCenterLatitude={23.6345}
                  mapCenterLongitude={-102.5528}
                  mapZoom={4.35}
                  minZoom={4}
                  maxZoom={6}
                  mapBounds={mexicoBounds}
                  enablePan
                  onMapHoverChange={setIsHospitalMapHovered}
                  pins={[]}
                  polygons={regionalMapPolygons}
                  bottomRightActionLabel={es ? 'Expandir mapa' : 'Expand map'}
                  onBottomRightActionPress={() => setIsHospitalMapExpanded(true)}
                  legendItems={[
                    { label: es ? 'Hospitales' : 'Hospitals', color: AppColors.brand.action },
                    { label: es ? 'Menor presencia' : 'Lower footprint', color: AppColors.border.brandSoft },
                  ]}
                />
                {/*
                  <CardBase style={styles.mapLegendCard}>
                    <Text style={styles.mapLegendTitle}>{es ? 'Top estados con mas hospitales' : 'Top States by Hospitals'}</Text>
                    <View style={styles.mapLegendList}>
                      {topRegions.map((region, index) => (
                        <View key={region.label} style={styles.mapLegendRow}>
                          <View style={[styles.mapLegendRank, { backgroundColor: regionalFillColor(region.value / maxRegionValue) }]}>
                            <Text style={styles.mapLegendRankText}>{index + 1}</Text>
                          </View>
                          <View style={styles.mapLegendCopy}>
                            <Text style={styles.mapLegendState}>{shortStateName(region.label)}</Text>
                          <Text style={styles.mapLegendMeta}>
                            {region.value} {es ? 'sucursales' : 'branches'} · {region.percent}%
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                  </CardBase>
                */}
              </View>

              <CardBase style={[styles.panel, styles.activityPanel, mainPanelWidth ? { width: mainPanelWidth } : styles.mainPanelFallback]}>
                <View style={styles.panelHeader}>
                  <View>
                    <Text style={styles.panelTitle}>{es ? 'Tendencia de actividad de usuarios' : 'User Activity Trend'}</Text>
                    <Text style={styles.panelSubtitle}>
                      {es ? 'Actividad separada por administradores y doctores' : 'Activity split by administrators and doctors'}
                    </Text>
                  </View>
                  <View style={styles.panelHeaderActions}>
                    <View style={styles.rangePill}><Text style={styles.rangeText}>{es ? 'Ultimos 7 dias' : 'Last 7 Days'}</Text></View>
                    <TouchableOpacity
                      style={styles.expandButton}
                      activeOpacity={0.78}
                      onPress={() => setIsActivityExpanded(true)}
                    >
                      <Feather name="maximize-2" size={15} color={AppColors.brand.action} />
                    </TouchableOpacity>
                  </View>
                </View>
                <ActivityTrendChart points={summary.userActivity} es={es} />
              </CardBase>
            </View>

            <CardBase style={styles.panel}>
              <View style={styles.panelHeader}>
                <View>
                  <Text style={styles.panelTitle}>{es ? 'Brotes activos cerca de hospitales' : 'Active Outbreaks Near Hospitals'}</Text>
                  <Text style={styles.panelSubtitle}>
                    {es ? 'Deteccion por radio de 35 km desde cada hospital' : 'Detection within a 35 km radius from each hospital'}
                  </Text>
                </View>
                <Text style={styles.linkText}>{es ? 'Radio 35 km' : '35 km radius'}</Text>
              </View>
              <View style={styles.hospitalList}>
                {(summary.hospitalOutbreaks ?? []).map((hospital) => (
                  <TouchableOpacity
                    key={hospital.id}
                    style={styles.hospitalRow}
                    activeOpacity={0.82}
                    onPress={() => setSelectedHospital(hospital)}
                  >
                    <View style={[styles.hospitalIcon, hospital.nearbyActiveOutbreakCount > 0 && styles.hospitalIconAlert]}>
                      <MaterialCommunityIcons
                        name={hospital.nearbyActiveOutbreakCount > 0 ? 'radar' : 'hospital-building'}
                        size={18}
                        color={hospital.nearbyActiveOutbreakCount > 0 ? AppColors.status.dangerOutbreak : AppColors.brand.action}
                      />
                    </View>
                    <View style={styles.hospitalCopy}>
                      <Text style={styles.hospitalName}>{hospital.name}</Text>
                      <Text style={styles.hospitalDetail}>
                        {[hospital.municipalityName, hospital.stateName].filter(Boolean).join(', ') || hospital.code}
                      </Text>
                    </View>
                    <View style={styles.outbreakSummary}>
                      <Text style={[
                        styles.outbreakCount,
                        hospital.nearbyActiveOutbreakCount > 0 ? styles.outbreakCountAlert : styles.outbreakCountQuiet,
                      ]}>
                        {hospital.nearbyActiveOutbreakCount}
                      </Text>
                      <Text style={styles.outbreakLabel}>
                        {es ? 'brotes activos cerca' : 'active outbreaks nearby'}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={18} color={AppColors.text.muted} />
                  </TouchableOpacity>
                ))}
              </View>
            </CardBase>
          </>
        ) : null}
      </ScrollView>

      <HospitalMapExpandedModal
        visible={isHospitalMapExpanded}
        es={es}
        hospitals={summary?.hospitalOutbreaks ?? []}
        regionalDistribution={summary?.regionalDistribution ?? []}
        onClose={() => setIsHospitalMapExpanded(false)}
        onHospitalPress={setSelectedHospital}
      />
      <MetricInfoModal
        visible={selectedMetric !== null}
        metric={selectedMetric}
        es={es}
        onClose={() => setSelectedMetric(null)}
      />
      <ActivityDetailModal
        visible={isActivityExpanded}
        es={es}
        hospitals={summary?.hospitalUserMetrics ?? []}
        selectedHospital={selectedHospitalUserMetric}
        onSelectHospital={setSelectedHospitalUserMetric}
        onClose={() => {
          setIsActivityExpanded(false);
          setSelectedHospitalUserMetric(null);
        }}
      />
      <HospitalOutbreakModal
        visible={selectedHospital !== null}
        hospital={selectedHospital}
        es={es}
        onClose={() => setSelectedHospital(null)}
      />
      <SystemReportOverlay
        visible={isReportOpen}
        summary={summary}
        es={es}
        onClose={() => setIsReportOpen(false)}
      />
    </DashboardLayout>
  );
}

function ActivityTrendChart({
  points,
  es,
}: {
  points: SystemDashboardSummaryResponse['userActivity'];
  es: boolean;
}) {
  const max = Math.max(1, ...points.map((point) => point.value));
  const adminTotal = points.reduce((sum, point) => sum + (point.adminValue ?? 0), 0);
  const doctorTotal = points.reduce((sum, point) => sum + (point.doctorValue ?? 0), 0);
  const peak = points.reduce((current, point) => point.value > current.value ? point : current, points[0] ?? { label: '', value: 0, adminValue: 0, doctorValue: 0 });
  const peakLabel = formatActivityPointLabel(peak, es);

  return (
    <View style={styles.activityWrap}>
      <View style={styles.activitySummaryRow}>
        <View style={styles.activitySummaryCard}>
          <View style={[styles.activityDot, { backgroundColor: AppColors.brand.action }]} />
          <Text style={styles.activitySummaryValue}>{adminTotal}</Text>
          <Text style={styles.activitySummaryLabel}>{es ? 'actividad admin' : 'admin activity'}</Text>
        </View>
        <View style={styles.activitySummaryCard}>
          <View style={[styles.activityDot, { backgroundColor: AppColors.brand.teal }]} />
          <Text style={styles.activitySummaryValue}>{doctorTotal}</Text>
          <Text style={styles.activitySummaryLabel}>{es ? 'actividad doctores' : 'doctor activity'}</Text>
        </View>
        <View style={styles.activityPeakCard}>
          <Text style={styles.activityPeakLabel}>{es ? 'Pico semanal' : 'Weekly peak'}</Text>
          <Text style={styles.activityPeakValue}>{peak.value}</Text>
          <Text style={styles.activityPeakDay}>{peakLabel.compact}</Text>
        </View>
      </View>

      <View style={styles.activityChart}>
        {points.map((point) => {
          const adminHeight = Math.max(8, ((point.adminValue ?? 0) / max) * 148);
          const doctorHeight = Math.max(8, ((point.doctorValue ?? 0) / max) * 148);
          const pointLabel = formatActivityPointLabel(point, es);
          return (
            <View key={point.date ?? point.label} style={styles.activityDay}>
              <Text style={styles.activityDayTotal}>{point.value}</Text>
              <View style={styles.activityColumnPair}>
                <View style={styles.activityMiniColumnWrap}>
                  <View style={[styles.activityColumn, styles.adminSegment, { height: adminHeight }]} />
                </View>
                <View style={styles.activityMiniColumnWrap}>
                  <View style={[styles.activityColumn, styles.doctorSegment, { height: doctorHeight }]} />
                </View>
              </View>
              <View style={styles.activityDaySplit}>
                <Text style={styles.activitySplitText}>{point.adminValue ?? 0}</Text>
                <Text style={styles.activitySplitText}>{point.doctorValue ?? 0}</Text>
              </View>
              <Text style={styles.activityDateLabel}>{pointLabel.date}</Text>
              <Text style={styles.barLabel}>{pointLabel.weekday}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.activityLegend}>
        <View style={styles.activityLegendItem}><View style={[styles.activityLegendSwatch, { backgroundColor: AppColors.brand.action }]} /><Text style={styles.activityLegendText}>{es ? 'Administradores' : 'Administrators'}</Text></View>
        <View style={styles.activityLegendItem}><View style={[styles.activityLegendSwatch, { backgroundColor: AppColors.brand.teal }]} /><Text style={styles.activityLegendText}>{es ? 'Doctores' : 'Doctors'}</Text></View>
      </View>
    </View>
  );
}

function activityPointDate(point: SystemDashboardSummaryResponse['userActivity'][number]) {
  if (!point.date) return null;
  const [year, month, day] = point.date.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatActivityPointLabel(
  point: SystemDashboardSummaryResponse['userActivity'][number],
  es: boolean,
) {
  const date = activityPointDate(point);
  if (!date) {
    return {
      weekday: point.label,
      date: point.label,
      compact: point.label,
      full: point.label,
    };
  }
  const locale = es ? 'es-MX' : 'en-US';
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' })
    .format(date)
    .replace('.', '')
    .toUpperCase();
  const dateLabel = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' })
    .format(date)
    .replace('.', '');
  return {
    weekday,
    date: dateLabel,
    compact: `${weekday} · ${dateLabel}`,
    full: `${weekday} ${dateLabel}`,
  };
}

function MetricCard({ metric, es }: { metric: SystemMetricResponse; es: boolean }) {
  const palette = metricPalette(metric);
  const iconName = metricIcons[metric.id] ?? metricIcons[metric.iconKey] ?? 'chart-box-outline';
  const title = translateMetricTitle(metric.title, es);
  const value = translateMetricValue(metric.value, es);
  const detail = translateMetricDetail(metric.detail, es);
  const badge = metric.status === 'warning'
    ? (es ? 'Revision' : 'Review')
    : metric.status === 'critical'
      ? (es ? 'Atencion' : 'Attention')
      : (es ? 'Estable' : 'Stable');

  return (
    <CardBase style={[styles.metricCard, { borderColor: palette.border }]}>
      <View style={[styles.metricAccent, { backgroundColor: palette.accent }]} />
      <View style={styles.metricHeader}>
        <Text style={styles.metricTitle}>{title}</Text>
        <View style={[styles.metricBadgePill, { backgroundColor: `${palette.accent}14` }]}>
          <Text style={[styles.metricBadge, { color: palette.accent }]}>{badge}</Text>
        </View>
      </View>
      <View style={styles.metricValueRow}>
        <View style={[styles.metricIconBox, { backgroundColor: `${palette.accent}12` }]}>
          <MaterialCommunityIcons name={iconName} size={20} color={palette.accent} />
        </View>
        <Text style={styles.metricValue} numberOfLines={2}>{value}</Text>
      </View>
      <Text style={styles.metricDetail}>{detail}</Text>
    </CardBase>
  );
}

function HospitalOutbreakModal({
  visible,
  hospital,
  es,
  onClose,
}: {
  visible: boolean;
  hospital: SystemHospitalOutbreakResponse | null;
  es: boolean;
  onClose: () => void;
}) {
  if (!hospital) return null;
  const topOutbreaks = hospital.nearbyOutbreaks ?? [];
  const alertTone = hospital.nearbyActiveOutbreakCount > 0 ? AppColors.status.dangerOutbreak : AppColors.brand.action;
  const locationText = [hospital.municipalityName, hospital.stateName].filter(Boolean).join(', ');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.dialogHeader}>
            <View style={styles.dialogHeaderCopy}>
              <Text style={styles.dialogEyebrow}>{es ? 'Radar epidemiologico' : 'Epidemiological Radar'}</Text>
              <Text style={styles.dialogTitle}>{hospital.name}</Text>
              <Text style={styles.dialogSubtitle}>
                {hospital.nearbyActiveOutbreakCount > 0
                  ? (es ? 'Hospital con brotes activos dentro del radio de vigilancia.' : 'Hospital with active outbreaks inside the surveillance radius.')
                  : (es ? 'Hospital sin brotes activos detectados dentro del radio configurado.' : 'Hospital with no active outbreaks detected inside the configured radius.')}
              </Text>
              {locationText ? (
                <View style={[styles.locationPill, { borderColor: `${alertTone}30`, backgroundColor: `${alertTone}0D` }]}>
                  <Feather name="map-pin" size={13} color={alertTone} />
                  <Text style={styles.locationText}>{locationText}</Text>
                </View>
              ) : null}
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.78}>
              <Feather name="x" size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.dialogBody} showsVerticalScrollIndicator={false}>
            <View style={styles.hospitalDetailStatsGrid}>
              <OverlayStatCard
                label={es ? 'Brotes cercanos' : 'Nearby Outbreaks'}
                value={`${hospital.nearbyActiveOutbreakCount}`}
                detail={es ? 'brotes activos cerca' : 'active outbreaks nearby'}
                accentColor={alertTone}
                style={styles.modalStatCard}
                valueStyle={styles.modalStatValue}
              />
              <OverlayStatCard
                label={es ? 'Radio' : 'Radius'}
                value={`${hospital.radiusKm} km`}
                detail={es ? 'desde el hospital' : 'from the hospital'}
                accentColor={AppColors.brand.action}
                style={styles.modalStatCard}
                valueStyle={styles.modalStatValue}
              />
              <OverlayStatCard
                label={es ? 'Codigo' : 'Code'}
                value={hospital.code}
                detail={hospital.active ? (es ? 'hospital activo' : 'active hospital') : (es ? 'hospital inactivo' : 'inactive hospital')}
                accentColor={AppColors.brand.teal}
                style={styles.modalStatCard}
                valueStyle={styles.modalStatValue}
              />
            </View>

            <View style={styles.insightsSection}>
              <View style={styles.insightsHeader}>
                <View>
                  <Text style={styles.insightsTitle}>{es ? 'Top de brotes cercanos' : 'Top Nearby Outbreaks'}</Text>
                  <Text style={styles.insightsCriteria}>
                    {es ? 'Ordenado por severidad, casos y distancia' : 'Ranked by severity, cases, and distance'}
                  </Text>
                </View>
              </View>
              <View style={styles.insightsList}>
                {topOutbreaks.length > 0 ? topOutbreaks.map((outbreak, index) => (
                  <OutbreakInsightRow key={outbreak.id ?? `${outbreak.diseaseName}-${index}`} outbreak={outbreak} index={index} es={es} />
                )) : (
                  <View style={styles.emptyInsight}>
                    <Feather name="check-circle" size={20} color={AppColors.brand.action} />
                    <Text style={styles.emptyInsightText}>
                      {es
                        ? 'No hay brotes municipales activos dentro del radio de 35 km.'
                        : 'No active municipal outbreaks were detected within the 35 km radius.'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </CardBase>
      </View>
    </Modal>
  );
}

function HospitalMapExpandedModal({
  visible,
  es,
  hospitals,
  regionalDistribution,
  onClose,
  onHospitalPress,
}: {
  visible: boolean;
  es: boolean;
  hospitals: SystemHospitalOutbreakResponse[];
  regionalDistribution: SystemDashboardSummaryResponse['regionalDistribution'];
  onClose: () => void;
  onHospitalPress: (hospital: SystemHospitalOutbreakResponse) => void;
}) {
  const [selectedState, setSelectedState] = useState<MexicoStateBoundary | null>(null);
  const stateNamesWithHospitals = useMemo(() => new Set(regionalDistribution.map((region) => stateLookupKey(region.label))), [regionalDistribution]);
  const selectedStateKey = selectedState ? stateLookupKey(selectedState.name) : null;
  const selectedStateHospitals = useMemo(() => (
    selectedStateKey
      ? hospitals.filter((hospital) => stateLookupKey(hospital.stateName ?? '') === selectedStateKey)
      : []
  ), [hospitals, selectedStateKey]);
  const selectedBounds = selectedState ? getBoundaryBounds(selectedState) : mexicoBounds;
  const selectedCenter = selectedState ? getBoundaryCenter(selectedState) : { latitude: 23.6345, longitude: -102.5528 };
  const selectorPolygons = useMemo<RadarMapPolygon[]>(() => mexicoStateBoundaries.map((boundary) => {
    const boundaryKey = stateLookupKey(boundary.name);
    const hasHospitals = stateNamesWithHospitals.has(boundaryKey);
    return {
      id: boundary.id,
      geometry: boundary.geometry,
      fillColor: hasHospitals ? withAlpha(AppColors.brand.action, 0.05) : withAlpha(AppColors.text.secondary, 0.04),
      strokeColor: hasHospitals ? withAlpha(AppColors.brand.action, 0.62) : withAlpha(AppColors.text.secondary, 0.24),
      strokeWidth: hasHospitals ? 1.3 : 1,
    };
  }), [stateNamesWithHospitals]);
  const selectedPolygons = useMemo<RadarMapPolygon[]>(() => (
    selectedState
      ? [{
        id: selectedState.id,
        geometry: selectedState.geometry,
        fillColor: withAlpha(AppColors.brand.action, 0.06),
        strokeColor: AppColors.brand.action,
        strokeWidth: 2,
      }]
      : []
  ), [selectedState]);
  const stateNamePins = useMemo<RadarMapPin[]>(() => mexicoStateBoundaries
    .filter((boundary) => stateNamesWithHospitals.has(stateLookupKey(boundary.name)))
    .map((boundary) => {
      const center = getBoundaryCenter(boundary);
      return {
        id: `state-${boundary.id}`,
        latitude: center.latitude,
        longitude: center.longitude,
        borderColor: AppColors.brand.primary,
        fillColor: AppColors.surface.card,
        label: shortStateName(boundary.name),
        icon: <Feather name="map-pin" size={13} color={AppColors.brand.primary} />,
        onPress: () => setSelectedState(boundary),
      };
    }), [stateNamesWithHospitals]);
  const hospitalPins = useMemo<RadarMapPin[]>(() => selectedStateHospitals
    .filter((hospital) => typeof hospital.latitude === 'number' && typeof hospital.longitude === 'number')
    .map((hospital) => {
      const hasOutbreaks = hospital.nearbyActiveOutbreakCount > 0;
      return {
        id: hospital.id,
        latitude: hospital.latitude,
        longitude: hospital.longitude,
        borderColor: hasOutbreaks ? AppColors.status.dangerOutbreak : AppColors.brand.action,
        fillColor: hasOutbreaks ? AppColors.status.dangerWash : AppColors.surface.brandSoft,
        icon: (
          <MaterialCommunityIcons
            name="hospital-box-outline"
            size={12}
            color={AppColors.brand.primary}
          />
        ),
        onPress: () => onHospitalPress(hospital),
      };
    }), [onHospitalPress, selectedStateHospitals]);
  const pins = selectedState ? hospitalPins : stateNamePins;
  const polygons = selectedState ? selectedPolygons : selectorPolygons;

  useEffect(() => {
    if (!visible) setSelectedState(null);
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.mapModalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.mapDialog}>
          <View style={styles.mapDialogHeader}>
            <View>
              <Text style={styles.dialogEyebrow}>{es ? 'Red hospitalaria' : 'Hospital Network'}</Text>
              <Text style={styles.dialogTitle}>{es ? 'Hospitales en Mexico' : 'Hospitals in Mexico'}</Text>
              <Text style={styles.dialogSubtitle}>
                {es ? 'Explora las sucursales registradas por estado.' : 'Explore registered branches by state.'}
              </Text>
            </View>
            <View style={styles.mapDialogActions}>
              {selectedState ? (
                <TouchableOpacity style={styles.mapBackButton} activeOpacity={0.75} onPress={() => setSelectedState(null)}>
                  <Feather name="arrow-left" size={16} color={AppColors.brand.action} />
                  <Text style={styles.mapBackText}>{es ? 'Estados' : 'States'}</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.78}>
                <Feather name="x" size={18} color={AppColors.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.mapDialogBody}>
            <RadarMapCard
              title={selectedState ? shortStateName(selectedState.name) : (es ? 'Mapa nacional de hospitales' : 'National Hospital Map')}
              subtitle={selectedState
                ? (es ? 'Hospitales del estado seleccionado' : 'Hospitals in the selected state')
                : (es ? 'Selecciona un estado para mostrar sus hospitales' : 'Select a state to show its hospitals')}
              showControls
              showFooter
              footerTextLeft={selectedState ? (es ? 'Estado seleccionado' : 'Selected state') : (es ? 'Selecciona un estado en el mapa' : 'Select a state on the map')}
              footerTextRight={selectedState
                ? `${selectedStateHospitals.length} ${es ? 'hospitales' : 'hospitals'}`
                : `${stateNamePins.length} ${es ? 'estados' : 'states'}`}
              mapHeight={650}
              mapCenterLatitude={selectedCenter.latitude}
              mapCenterLongitude={selectedCenter.longitude}
              mapZoom={selectedState ? 6.45 : 6}
              minZoom={selectedState ? 5 : 5}
              maxZoom={selectedState ? 10 : 12}
              mapBounds={selectedBounds}
              enablePan
              pins={pins}
              polygons={polygons}
              legendItems={[
                { label: selectedState ? (es ? 'Silueta del estado' : 'State outline') : (es ? 'Estado con hospitales' : 'State with hospitals'), color: AppColors.brand.action },
                { label: es ? 'Hospital registrado' : 'Registered hospital', color: AppColors.brand.primary },
              ]}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function MetricInfoModal({
  visible,
  metric,
  es,
  onClose,
}: {
  visible: boolean;
  metric: SystemMetricResponse | null;
  es: boolean;
  onClose: () => void;
}) {
  if (!metric) return null;
  const palette = metricPalette(metric);
  const title = translateMetricTitle(metric.title, es);
  const value = translateMetricValue(metric.value, es);
  const detail = translateMetricDetail(metric.detail, es);
  const explanation = metricExplanation(metric.id, es);
  const badge = metric.status === 'warning'
    ? (es ? 'Necesita revision' : 'Needs review')
    : metric.status === 'critical'
      ? (es ? 'Atencion prioritaria' : 'Priority attention')
      : (es ? 'Comportamiento estable' : 'Stable behavior');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <CardBase style={styles.metricDialog}>
          <View style={styles.dialogHeader}>
            <View style={styles.dialogHeaderCopy}>
              <Text style={styles.dialogEyebrow}>{es ? 'Detalle de KPI' : 'KPI Detail'}</Text>
              <Text style={styles.dialogTitle}>{title}</Text>
              <Text style={styles.dialogSubtitle}>{detail}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.78}>
              <Feather name="x" size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.metricDialogBody}>
            <View style={styles.modalStatsGrid}>
              <OverlayStatCard
                label={es ? 'Valor actual' : 'Current Value'}
                value={value}
                detail={es ? 'lectura consolidada' : 'consolidated reading'}
                accentColor={palette.accent}
                style={styles.modalStatCard}
                valueStyle={styles.modalStatValue}
              />
              <OverlayStatCard
                label={es ? 'Estado operativo' : 'Operational Status'}
                value={badge}
                detail={es ? 'segun senales del backend' : 'based on backend signals'}
                accentColor={palette.accent}
                style={styles.modalStatCard}
                valueStyle={styles.modalStatValue}
              />
            </View>
            <View style={styles.kpiInsightCard}>
              <View style={[styles.kpiInsightIcon, { backgroundColor: `${palette.accent}12` }]}>
                <MaterialCommunityIcons name="chart-box-outline" size={20} color={palette.accent} />
              </View>
              <View style={styles.kpiInsightCopy}>
                <Text style={styles.kpiInsightTitle}>{es ? 'Como interpretar esta KPI' : 'How to read this KPI'}</Text>
                <Text style={styles.kpiInsightText}>{explanation}</Text>
              </View>
            </View>
          </View>
        </CardBase>
      </View>
    </Modal>
  );
}

function ActivityDetailModal({
  visible,
  es,
  hospitals,
  selectedHospital,
  onSelectHospital,
  onClose,
}: {
  visible: boolean;
  es: boolean;
  hospitals: SystemHospitalUserMetricResponse[];
  selectedHospital: SystemHospitalUserMetricResponse | null;
  onSelectHospital: (hospital: SystemHospitalUserMetricResponse) => void;
  onClose: () => void;
}) {
  const sortedHospitals = useMemo(() => [...hospitals].sort((a, b) => b.totalUsers - a.totalUsers), [hospitals]);
  const activeHospital = selectedHospital ?? sortedHospitals[0] ?? null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <CardBase style={styles.activityDialog}>
          <View style={styles.dialogHeader}>
            <View style={styles.dialogHeaderCopy}>
              <Text style={styles.dialogEyebrow}>{es ? 'Actividad por hospital' : 'Hospital Activity'}</Text>
              <Text style={styles.dialogTitle}>{es ? 'Hospitales con mas usuarios' : 'Hospitals with Most Users'}</Text>
              <Text style={styles.dialogSubtitle}>
                {es ? 'Selecciona un hospital para ver su mezcla de roles y actividad.' : 'Select a hospital to inspect role mix and user activity.'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.78}>
              <Feather name="x" size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.activityDialogBody}>
            <View style={styles.hospitalMetricListPanel}>
              <View style={styles.activityDetailPanelHeader}>
                <Text style={styles.activityDetailPanelTitle}>{es ? 'Top hospitales' : 'Top Hospitals'}</Text>
                <Text style={styles.activityDetailPanelSubtitle}>
                  {es ? 'Ordenado por usuarios totales.' : 'Sorted by total users.'}
                </Text>
              </View>
              <ScrollView style={styles.hospitalMetricList} contentContainerStyle={styles.hospitalMetricListContent} showsVerticalScrollIndicator={false}>
                {sortedHospitals.map((hospital, index) => {
                  const active = activeHospital?.hospitalId === hospital.hospitalId;
                  return (
                    <TouchableOpacity
                      key={hospital.hospitalId}
                      style={[styles.hospitalMetricRow, active && styles.hospitalMetricRowActive]}
                      activeOpacity={0.78}
                      onPress={() => onSelectHospital(hospital)}
                    >
                      <View style={[styles.hospitalMetricRank, active && styles.hospitalMetricRankActive]}>
                        <Text style={[styles.hospitalMetricRankText, active && styles.hospitalMetricRankTextActive]}>{index + 1}</Text>
                      </View>
                      <View style={styles.hospitalMetricCopy}>
                        <Text style={styles.hospitalMetricName}>{hospital.hospitalName}</Text>
                        <Text style={styles.hospitalMetricPlace}>
                          {[hospital.municipalityName, hospital.stateName].filter(Boolean).join(', ')}
                        </Text>
                      </View>
                      <Text style={styles.hospitalMetricTotal}>{hospital.totalUsers}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.hospitalMetricDetailPanel}>
              {activeHospital ? (
                <>
                  <Text style={styles.hospitalMetricDetailEyebrow}>{es ? 'Detalle seleccionado' : 'Selected Detail'}</Text>
                  <Text style={styles.hospitalMetricDetailTitle}>{activeHospital.hospitalName}</Text>
                  <View style={styles.hospitalMetricStatsGrid}>
                    <OverlayStatCard style={styles.modalStatCard} valueStyle={styles.modalStatValue} label={es ? 'Usuarios totales' : 'Total Users'} value={`${activeHospital.totalUsers}`} detail={es ? 'cuentas asignadas' : 'assigned accounts'} accentColor={AppColors.brand.action} />
                    <OverlayStatCard style={styles.modalStatCard} valueStyle={styles.modalStatValue} label={es ? 'Usuarios activos' : 'Active Users'} value={`${activeHospital.activeUsers}`} detail={es ? 'con acceso vigente' : 'currently enabled'} accentColor={AppColors.brand.teal} />
                    <OverlayStatCard style={styles.modalStatCard} valueStyle={styles.modalStatValue} label={es ? 'Doctores' : 'Doctors'} value={`${activeHospital.doctorUsers}`} detail={es ? 'personal medico' : 'medical staff'} accentColor={AppColors.status.cyanDark} />
                    <OverlayStatCard style={styles.modalStatCard} valueStyle={styles.modalStatValue} label={es ? 'Administradores' : 'Administrators'} value={`${activeHospital.adminUsers}`} detail={es ? 'gestion hospitalaria' : 'hospital management'} accentColor={AppColors.brand.purple} />
                  </View>
                  <View style={styles.inactiveStrip}>
                    <Text style={styles.inactiveStripLabel}>{es ? 'Usuarios inactivos o pendientes' : 'Inactive or pending users'}</Text>
                    <Text style={styles.inactiveStripValue}>{activeHospital.inactiveUsers}</Text>
                  </View>
                </>
              ) : (
                <View style={styles.emptyInsight}>
                  <Feather name="info" size={20} color={AppColors.brand.action} />
                  <Text style={styles.emptyInsightText}>{es ? 'Aun no hay hospitales con usuarios asignados.' : 'There are no hospitals with assigned users yet.'}</Text>
                </View>
              )}
            </View>
          </View>
        </CardBase>
      </View>
    </Modal>
  );
}

function SystemReportOverlay({
  visible,
  summary,
  es,
  onClose,
}: {
  visible: boolean;
  summary: SystemDashboardSummaryResponse | null;
  es: boolean;
  onClose: () => void;
}) {
  const [previewPdf, setPreviewPdf] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFilename, setPreviewFilename] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !summary) {
      setPreviewPdf(null);
      setPreviewFilename(null);
      setPreviewUrl((current) => {
        revokePdfUrl(current);
        return null;
      });
      return;
    }
    const { pdf, filename } = buildSystemReportPdf(summary, es);
    setPreviewPdf(pdf);
    setPreviewFilename(filename);
    setPreviewUrl((current) => {
      revokePdfUrl(current);
      return createPdfUrl(pdf);
    });
  }, [es, summary, visible]);

  useEffect(() => () => {
    revokePdfUrl(previewUrl);
  }, [previewUrl]);

  const handleDownload = () => {
    if (!previewPdf || !previewFilename) return;
    savePdfDocument(previewPdf, previewFilename);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.reportOverlay}>
        <Pressable style={styles.reportPreviewBackdrop} onPress={onClose} />
        <CardBase style={[styles.reportDialog, styles.reportPreviewDialog]}>
          <View style={styles.reportHeader}>
            <View style={styles.reportHeaderCopy}>
              <Text style={styles.dialogEyebrow}>{es ? 'Vista previa del reporte' : 'Report Preview'}</Text>
              <Text style={styles.dialogTitle}>{es ? 'Reporte del administrador del sistema' : 'System Administrator Report'}</Text>
              <Text style={styles.dialogSubtitle}>
                {es ? 'Revisa el PDF antes de descargarlo.' : 'Review the PDF before downloading it.'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.reportPreviewBody}>
            {previewUrl ? (
              <PdfPreviewFrame url={previewUrl} title={es ? 'Vista previa del reporte' : 'Report preview'} />
            ) : (
              <View style={styles.reportPreviewFallback}>
                <Feather name="file-text" size={24} color={AppColors.brand.action} />
                <Text style={styles.reportPreviewFallbackText}>{es ? 'La vista previa no esta disponible.' : 'Preview is not available.'}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.reportDownloadButton} activeOpacity={0.82} onPress={handleDownload} disabled={!previewPdf}>
              <Feather name="download" size={18} color={AppColors.surface.card} />
              <Text style={styles.reportDownloadButtonText}>{es ? 'Descargar reporte' : 'Download report'}</Text>
            </TouchableOpacity>
          </View>
        </CardBase>
      </View>
    </Modal>
  );
}

function OutbreakInsightRow({ outbreak, index, es }: { outbreak: SystemNearbyOutbreakResponse; index: number; es: boolean }) {
  const tone = severityTone(outbreak.severity);
  return (
    <View style={styles.insightRow}>
      <View style={[styles.insightMarker, { borderColor: `${tone}33`, backgroundColor: `${tone}12` }]}>
        <Text style={[styles.insightRankText, { color: tone }]}>{index + 1}</Text>
      </View>
      <View style={styles.insightCopy}>
        <Text style={styles.insightTitle}>{outbreak.diseaseName}</Text>
        <Text style={styles.insightLocation}>
          {[outbreak.municipalityName, outbreak.stateName].filter(Boolean).join(', ')}
        </Text>
      </View>
      <View style={styles.insightMeta}>
        <Text style={[styles.insightCases, { color: tone }]}>
          {outbreak.caseCount} {es ? 'casos' : 'cases'}
        </Text>
        <Text style={styles.insightSeverity}>
          {localizeSeverity(outbreak.severity, es)} · {outbreak.distanceKm} km
        </Text>
      </View>
    </View>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <View style={styles.metricsGrid}>
        {Array.from({ length: 4 }).map((_, index) => (
          <CardBase key={index} style={[styles.metricCard, styles.skeletonCard]}>
            <View style={styles.skeletonMetricHeader} />
            <View style={styles.skeletonMetricValue} />
            <View style={styles.skeletonMetricLine} />
          </CardBase>
        ))}
      </View>
      <View style={styles.mainGrid}>
        <CardBase style={[styles.panel, styles.skeletonMainPanel]}>
          <View style={styles.skeletonPanelTitle} />
          <View style={styles.skeletonMapBlob} />
        </CardBase>
        <CardBase style={[styles.panel, styles.skeletonMainPanel]}>
          <View style={styles.skeletonHeaderRow}>
            <View>
              <View style={styles.skeletonPanelTitle} />
              <View style={styles.skeletonPanelSubtitle} />
            </View>
            <View style={styles.skeletonPill} />
          </View>
          <View style={styles.skeletonSummaryRow}>
            <View style={styles.skeletonSummaryCard} />
            <View style={styles.skeletonSummaryCard} />
            <View style={styles.skeletonPeakCard} />
          </View>
          <View style={styles.skeletonChartRow}>
            {Array.from({ length: 7 }).map((_, index) => <View key={index} style={[styles.skeletonChartBar, { height: 70 + index * 12 }]} />)}
          </View>
        </CardBase>
      </View>
    </>
  );
}

function metricPalette(metric: SystemMetricResponse) {
  const status = metric.status?.toLowerCase();
  if (status === 'critical') return { accent: AppColors.status.dangerOutbreak, border: withAlpha(AppColors.status.dangerOutbreak, 0.24) };
  if (status === 'warning') return { accent: AppColors.status.warningDark, border: withAlpha(AppColors.status.warningDark, 0.26) };
  if (metric.id === 'users') return { accent: AppColors.brand.teal, border: withAlpha(AppColors.brand.teal, 0.22) };
  if (metric.id === 'ai') return { accent: AppColors.brand.purple, border: withAlpha(AppColors.brand.purple, 0.22) };
  return { accent: AppColors.brand.action, border: withAlpha(AppColors.brand.action, 0.20) };
}

function severityTone(severity: string) {
  const normalized = severity.toUpperCase();
  if (normalized === 'CRITICAL') return AppColors.status.dangerOutbreak;
  if (normalized === 'HIGH') return AppColors.severityTone.high;
  if (normalized === 'MEDIUM') return AppColors.status.warningDark;
  return AppColors.brand.teal;
}

function localizeSeverity(severity: string, es: boolean) {
  const normalized = severity.toUpperCase();
  if (!es) return normalized.charAt(0) + normalized.slice(1).toLowerCase();
  if (normalized === 'CRITICAL') return 'Critico';
  if (normalized === 'HIGH') return 'Alto';
  if (normalized === 'MEDIUM') return 'Medio';
  return 'Bajo';
}

function regionalFillColor(intensity: number) {
  if (intensity >= 0.8) return withAlpha(AppColors.brand.action, 0.78);
  if (intensity >= 0.55) return withAlpha(AppColors.brand.action, 0.52);
  if (intensity > 0) return withAlpha(AppColors.brand.action, 0.28);
  return withAlpha(AppColors.border.brandSoft, 0.42);
}

function shortStateName(name: string): string {
  const aliases: Record<string, string> = {
    'Coahuila de Zaragoza': 'Coahuila',
    'Michoacan de Ocampo': 'Michoacan',
    'Michoacán de Ocampo': 'Michoacán',
    'Veracruz de Ignacio de la Llave': 'Veracruz',
    Mexico: 'México',
  };
  return aliases[name] ?? name;
}

function stateLookupKey(name: string): string {
  const aliases: Record<string, string> = {
    'Coahuila de Zaragoza': 'Coahuila',
    'Michoacan de Ocampo': 'Michoacan',
    'Michoacán de Ocampo': 'Michoacán',
    'Veracruz de Ignacio de la Llave': 'Veracruz',
    Mexico: 'Mexico',
    'México': 'Mexico',
  };
  return (aliases[name] ?? shortStateName(name))
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function getMexicoBounds(boundaries: MexicoStateBoundary[]) {
  const points = boundaries.flatMap((boundary) => boundary.geometry.coordinates.flat(2));
  const longitudes = points.map(([longitude]) => longitude);
  const latitudes = points.map(([, latitude]) => latitude);
  return {
    minLatitude: Math.min(...latitudes) - 0.8,
    maxLatitude: Math.max(...latitudes) + 0.8,
    minLongitude: Math.min(...longitudes) - 0.8,
    maxLongitude: Math.max(...longitudes) + 0.8,
  };
}

function getBoundaryBounds(boundary: MexicoStateBoundary) {
  const points = boundary.geometry.coordinates.flat(2);
  const longitudes = points.map(([longitude]) => longitude);
  const latitudes = points.map(([, latitude]) => latitude);
  return {
    minLatitude: Math.min(...latitudes) - 0.35,
    maxLatitude: Math.max(...latitudes) + 0.35,
    minLongitude: Math.min(...longitudes) - 0.35,
    maxLongitude: Math.max(...longitudes) + 0.35,
  };
}

function getBoundaryCenter(boundary: MexicoStateBoundary) {
  const bounds = getBoundaryBounds(boundary);
  return {
    latitude: (bounds.minLatitude + bounds.maxLatitude) / 2,
    longitude: (bounds.minLongitude + bounds.maxLongitude) / 2,
  };
}

function metricExplanation(metricId: string, es: boolean) {
  if (metricId === 'hospitals' || metricId === 'hospital') {
    return es
      ? 'Mide la cobertura operativa de la red. Sirve para confirmar cuantas sucursales estan activas y disponibles para monitoreo, asignacion de usuarios y analisis epidemiologico.'
      : 'Measures operational coverage across the network. It confirms how many branches are active and available for monitoring, user assignment, and epidemiological analysis.';
  }
  if (metricId === 'users') {
    return es
      ? 'Resume el volumen de cuentas con actividad reciente. Al cruzarlo con el desglose de hospitales ayuda a detectar concentracion de uso, sedes con poca adopcion o roles desbalanceados.'
      : 'Summarizes accounts with recent activity. Paired with the hospital breakdown, it helps detect usage concentration, low-adoption sites, or unbalanced roles.';
  }
  if (metricId === 'ai' || metricId === 'cpu') {
    return es
      ? 'Indica si los servicios de inteligencia artificial estan listos para apoyar recomendaciones y analisis. Un estado de revision normalmente apunta a configuracion pendiente.'
      : 'Indicates whether AI services are ready to support recommendations and analysis. A review status usually points to pending configuration.';
  }
  return es
    ? 'Consolida senales tecnicas del backend y la base de datos para mostrar si el sistema esta disponible para operacion diaria.'
    : 'Consolidates backend and database signals to show whether the system is available for daily operation.';
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
  return value === 'Operational' ? 'Operativo' : value === 'Running' ? 'Activo' : value === 'Needs config' ? 'Requiere configuracion' : value;
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

function buildSystemReportPdf(summary: SystemDashboardSummaryResponse, es: boolean) {
  const pdf = createSimplePdf();
  const generatedAt = summary.generatedAt ? new Date(summary.generatedAt) : new Date();
  const hospitalsWithOutbreaks = summary.hospitalOutbreaks.filter((hospital) => hospital.nearbyActiveOutbreakCount > 0).length;
  const totalNearbyOutbreaks = summary.hospitalOutbreaks.reduce((sum, hospital) => sum + hospital.nearbyActiveOutbreakCount, 0);
  const topHospitals = [...summary.hospitalUserMetrics].sort((a, b) => b.totalUsers - a.totalUsers).slice(0, 8);
  const topRegions = [...summary.regionalDistribution].sort((a, b) => b.value - a.value).slice(0, 8);
  let y = 54;

  pdf.rect(36, 34, 540, 76, [246, 247, 255], [218, 220, 251]);
  pdf.text(es ? 'Reporte del administrador del sistema' : 'System Administrator Report', 54, y, 18, true, [15, 23, 42]);
  y += 24;
  pdf.text(`StatuScope | ${generatedAt.toLocaleString(es ? 'es-MX' : 'en-US')}`, 54, y, 10, false, [82, 97, 116]);
  y += 18;
  pdf.text(
    es
      ? `${formatPdfNumber(summary.metrics.length)} KPIs | ${formatPdfNumber(summary.hospitalOutbreaks.length)} hospitales | ${formatPdfNumber(hospitalsWithOutbreaks)} con brotes cercanos | ${formatPdfNumber(totalNearbyOutbreaks)} brotes`
      : `${formatPdfNumber(summary.metrics.length)} KPIs | ${formatPdfNumber(summary.hospitalOutbreaks.length)} hospitals | ${formatPdfNumber(hospitalsWithOutbreaks)} with nearby outbreaks | ${formatPdfNumber(totalNearbyOutbreaks)} outbreaks`,
    54,
    y,
    9,
    false,
    [82, 97, 116],
  );
  y = 132;

  y = drawPdfTable(
    pdf,
    y,
    es ? 'KPIs principales' : 'Primary KPIs',
    [es ? 'Indicador' : 'Metric', es ? 'Valor' : 'Value', es ? 'Interpretacion' : 'Interpretation'],
    [182, 96, 238],
    summary.metrics.map((metric) => [
      translateMetricTitle(metric.title, es),
      translateMetricValue(metric.value, es),
      translateMetricDetail(metric.detail, es),
    ]),
  );

  y = drawPdfTable(
    pdf,
    y,
    es ? 'Actividad de usuarios por dia' : 'Daily User Activity',
    [es ? 'Dia' : 'Day', es ? 'Total' : 'Total', es ? 'Admins' : 'Admins', es ? 'Doctores' : 'Doctors'],
    [160, 90, 120, 146],
    summary.userActivity.map((point) => [
      formatActivityPointLabel(point, es).full,
      formatPdfNumber(point.value),
      formatPdfNumber(point.adminValue ?? 0),
      formatPdfNumber(point.doctorValue ?? 0),
    ]),
  );

  y = drawPdfTable(
    pdf,
    y,
    es ? 'Top estados por presencia hospitalaria' : 'Top States by Hospital Footprint',
    [es ? 'Estado' : 'State', es ? 'Hospitales' : 'Hospitals', es ? 'Participacion' : 'Share'],
    [260, 110, 146],
    topRegions.map((region) => [
      shortStateName(region.label),
      formatPdfNumber(region.value),
      `${region.percent}%`,
    ]),
  );

  y = drawPdfTable(
    pdf,
    y,
    es ? 'Riesgo epidemiologico cerca de hospitales' : 'Epidemiological Risk Near Hospitals',
    [es ? 'Hospital' : 'Hospital', es ? 'Ubicacion' : 'Location', es ? 'Brotes' : 'Outbreaks', es ? 'Radio' : 'Radius'],
    [208, 174, 68, 66],
    summary.hospitalOutbreaks.slice(0, 10).map((hospital) => [
      hospital.name,
      [hospital.municipalityName, hospital.stateName].filter(Boolean).join(', ') || hospital.code,
      formatPdfNumber(hospital.nearbyActiveOutbreakCount),
      `${hospital.radiusKm} km`,
    ]),
  );

  y = drawPdfTable(
    pdf,
    y,
    es ? 'Hospitales con mas usuarios' : 'Hospitals with Most Users',
    [es ? 'Hospital' : 'Hospital', es ? 'Total' : 'Total', es ? 'Activos' : 'Active', es ? 'Doctores' : 'Doctors', es ? 'Admins' : 'Admins', es ? 'Inactivos' : 'Inactive'],
    [206, 58, 62, 64, 62, 64],
    topHospitals.map((hospital) => [
      hospital.hospitalName,
      formatPdfNumber(hospital.totalUsers),
      formatPdfNumber(hospital.activeUsers),
      formatPdfNumber(hospital.doctorUsers),
      formatPdfNumber(hospital.adminUsers),
      formatPdfNumber(hospital.inactiveUsers),
    ]),
  );

  const filename = `statuscope-system-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  return { pdf: pdf.output(), filename };
}

function drawPdfSectionTitle(pdf: SimplePdf, y: number, title: string) {
  y = pdf.ensureSpace(y, 52);
  pdf.text(title, 48, y, 13, true, [23, 24, 199]);
  return y + 26;
}

function drawPdfTable(
  pdf: SimplePdf,
  y: number,
  title: string,
  headers: string[],
  widths: number[],
  rows: string[][],
) {
  y = drawPdfSectionTitle(pdf, y, title);
  const x = 48;
  const tableWidth = widths.reduce((sum, width) => sum + width, 0);
  const headerHeight = 26;
  y = pdf.ensureSpace(y, headerHeight + 28);
  pdf.rect(x, y, tableWidth, headerHeight, [248, 250, 252], [226, 232, 240]);
  let cursorX = x;
  headers.forEach((header, index) => {
    pdf.text(header, cursorX + 7, y + 17, 8.5, true, [100, 116, 139]);
    if (index > 0) pdf.line(cursorX, y, cursorX, y + headerHeight, [226, 232, 240]);
    cursorX += widths[index];
  });
  y += headerHeight;

  rows.forEach((row) => {
    const cellLines = row.map((cell, index) => wrapPdfText(cell, Math.max(8, Math.floor((widths[index] - 14) / 5.2))));
    const rowHeight = Math.max(30, Math.max(...cellLines.map((lines) => lines.length)) * 11 + 14);
    y = pdf.ensureSpace(y, rowHeight + 18);
    pdf.rect(x, y, tableWidth, rowHeight, undefined, [226, 232, 240]);
    cursorX = x;
    cellLines.forEach((lines, columnIndex) => {
      lines.slice(0, 4).forEach((line, lineIndex) => {
        pdf.text(line, cursorX + 7, y + 16 + lineIndex * 11, 8.6, columnIndex === 0, columnIndex === 0 ? [15, 23, 42] : [71, 85, 105]);
      });
      if (columnIndex > 0) pdf.line(cursorX, y, cursorX, y + rowHeight, [226, 232, 240]);
      cursorX += widths[columnIndex];
    });
    y += rowHeight;
  });

  return y + 20;
}

function formatPdfNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

type PdfColor = [number, number, number];

interface SimplePdf {
  text: (value: string, x: number, y: number, size?: number, bold?: boolean, color?: PdfColor) => void;
  line: (x1: number, y1: number, x2: number, y2: number, color?: PdfColor, width?: number) => void;
  rect: (x: number, y: number, width: number, height: number, fill?: PdfColor, stroke?: PdfColor) => void;
  ensureSpace: (y: number, minSpace: number) => number;
  output: () => string;
}

function createSimplePdf(): SimplePdf {
  const pages: string[][] = [[]];
  const pageWidth = 612;
  const pageHeight = 792;
  const currentPage = () => pages[pages.length - 1];
  const addPage = () => pages.push([]);

  return {
    text(value, x, y, size = 10, bold = false, color = [15, 23, 42]) {
      const pdfY = pageHeight - y;
      const [r, g, b] = color.map((component) => (component / 255).toFixed(3));
      currentPage().push(
        `BT /${bold ? 'F2' : 'F1'} ${size} Tf ${r} ${g} ${b} rg ${x.toFixed(2)} ${pdfY.toFixed(2)} Td (${escapePdfText(value)}) Tj ET`,
      );
    },
    line(x1, y1, x2, y2, color = [226, 232, 240], width = 0.7) {
      const [r, g, b] = color.map((component) => (component / 255).toFixed(3));
      currentPage().push(
        `q ${r} ${g} ${b} RG ${width.toFixed(2)} w ${x1.toFixed(2)} ${(pageHeight - y1).toFixed(2)} m ${x2.toFixed(2)} ${(pageHeight - y2).toFixed(2)} l S Q`,
      );
    },
    rect(x, y, width, height, fill, stroke = [226, 232, 240]) {
      const pdfY = pageHeight - y - height;
      const strokeColor = stroke.map((component) => (component / 255).toFixed(3)).join(' ');
      if (fill) {
        const fillColor = fill.map((component) => (component / 255).toFixed(3)).join(' ');
        currentPage().push(
          `q ${fillColor} rg ${strokeColor} RG ${x.toFixed(2)} ${pdfY.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re B Q`,
        );
        return;
      }
      currentPage().push(
        `q ${strokeColor} RG ${x.toFixed(2)} ${pdfY.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re S Q`,
      );
    },
    ensureSpace(y, minSpace) {
      if (y + minSpace <= 740) return y;
      addPage();
      return 54;
    },
    output() {
      return buildPdfDocument(pages, pageWidth, pageHeight);
    },
  };
}

function createPdfUrl(pdf: string) {
  const webGlobal = globalThis as typeof globalThis & {
    Blob?: typeof Blob;
    URL?: typeof URL;
  };
  if (!webGlobal.Blob || !webGlobal.URL) return null;
  const blob = new webGlobal.Blob([pdf], { type: 'application/pdf' });
  return webGlobal.URL.createObjectURL(blob);
}

function revokePdfUrl(url: string | null) {
  const webGlobal = globalThis as typeof globalThis & { URL?: typeof URL };
  if (url && webGlobal.URL) {
    webGlobal.URL.revokeObjectURL(url);
  }
}

function savePdfDocument(pdf: string, filename: string) {
  const webGlobal = globalThis as typeof globalThis & {
    Blob?: typeof Blob;
    URL?: typeof URL;
    document?: Document;
  };
  if (!webGlobal.Blob || !webGlobal.URL || !webGlobal.document) return;
  const blob = new webGlobal.Blob([pdf], { type: 'application/pdf' });
  const url = webGlobal.URL.createObjectURL(blob);
  const link = webGlobal.document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  webGlobal.URL.revokeObjectURL(url);
}

function buildPdfDocument(pages: string[][], pageWidth: number, pageHeight: number) {
  const objects: string[] = [];
  const addObject = (content: string) => {
    objects.push(content);
    return objects.length;
  };

  const catalogId = addObject('');
  const pagesId = addObject('');
  const fontRegularId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const fontBoldId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  const pageIds: number[] = [];

  pages.forEach((lines) => {
    const content = lines.join('\n');
    const contentId = addObject(`<< /Length ${latin1Length(content)} >>\nstream\n${content}\nendstream`);
    const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    pageIds.push(pageId);
  });

  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`;

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(latin1Length(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = latin1Length(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}

function latin1Length(value: string) {
  return value.length;
}

function escapePdfText(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\r?\n/g, ' ');
}

function wrapPdfText(value: string, maxChars: number) {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [''];
}

const styles = StyleSheet.create({
  contentContainer: { padding: 32, gap: 24 },
  hero: {
    backgroundColor: AppColors.surface.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: AppColors.border.default,
    padding: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
    shadowColor: AppColors.text.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.05,
    shadowRadius: 28,
    elevation: 2,
  },
  heroCopy: { flex: 1, minWidth: 0 },
  eyebrow: { fontSize: 13, fontWeight: '800', color: AppColors.brand.action, textTransform: 'uppercase', letterSpacing: 0 },
  title: { marginTop: 8, fontSize: 30, lineHeight: 38, fontWeight: '900', color: AppColors.text.primary },
  subtitle: { marginTop: 6, fontSize: 16, lineHeight: 24, color: AppColors.text.secondary, maxWidth: 760 },
  heroActions: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  metricsGrid: { width: '100%', flexDirection: 'row', gap: 14, flexWrap: 'wrap' },
  metricTouchable: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 220 },
  metricCard: {
    flex: 1,
    minWidth: 220,
    minHeight: 176,
    padding: 24,
    paddingTop: 22,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: AppColors.surface.card,
    shadowOpacity: 0.10,
  },
  metricAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
  metricHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18, gap: 12 },
  metricTitle: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: '700', color: AppColors.text.secondary },
  metricBadgePill: { flexShrink: 0, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  metricBadge: { fontSize: 11, lineHeight: 14, fontWeight: '800' },
  metricValueRow: { flexDirection: 'row', alignItems: 'center', minHeight: 54 },
  metricIconBox: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  metricValue: { flex: 1, minWidth: 0, fontSize: 30, lineHeight: 36, fontWeight: '900', color: AppColors.text.primary },
  metricDetail: { marginTop: 12, fontSize: 12, lineHeight: 18, color: AppColors.text.secondary },
  mainGrid: { width: '100%', minHeight: 520, flexDirection: 'row', gap: 14, alignItems: 'stretch' },
  mainPanelFallback: { flex: 1 },
  panel: { borderRadius: 18, padding: 24, backgroundColor: AppColors.surface.card },
  activityPanel: { flexGrow: 0, flexShrink: 0, minWidth: 0, justifyContent: 'space-between' },
  regionalPanel: { flex: 1, minWidth: 280 },
  regionalMapPanel: { flexGrow: 0, flexShrink: 0, minWidth: 0, gap: 12 },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 },
  panelHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  panelTitle: { fontSize: 17, lineHeight: 24, fontWeight: '900', color: AppColors.text.primary },
  panelSubtitle: { marginTop: 4, fontSize: 12, lineHeight: 18, fontWeight: '600', color: AppColors.text.secondary },
  rangePill: { borderWidth: 1, borderColor: AppColors.border.brandSoft, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: AppColors.surface.brandWash },
  rangeText: { fontSize: 12, fontWeight: '800', color: AppColors.brand.action },
  expandButton: { width: 34, height: 34, borderRadius: 12, borderWidth: 1, borderColor: AppColors.border.brandSoft, backgroundColor: AppColors.surface.card, alignItems: 'center', justifyContent: 'center' },
  activityWrap: { marginTop: 18, gap: 18, flex: 1 },
  activitySummaryRow: { flexDirection: 'row', gap: 10 },
  activitySummaryCard: {
    flex: 1,
    minHeight: 76,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.border.soft,
    backgroundColor: AppColors.surface.subtle,
    padding: 12,
  },
  activityPeakCard: {
    width: 118,
    minHeight: 76,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.border.brandSoft,
    backgroundColor: AppColors.surface.brandWash,
    padding: 12,
  },
  activityDot: { width: 8, height: 8, borderRadius: 999, marginBottom: 8 },
  activitySummaryValue: { fontSize: 22, lineHeight: 26, fontWeight: '900', color: AppColors.text.primary },
  activitySummaryLabel: { marginTop: 2, fontSize: 11, lineHeight: 14, fontWeight: '800', color: AppColors.text.secondary, textTransform: 'uppercase' },
  activityPeakLabel: { fontSize: 11, lineHeight: 14, fontWeight: '800', color: AppColors.text.secondary, textTransform: 'uppercase' },
  activityPeakValue: { marginTop: 7, fontSize: 24, lineHeight: 28, fontWeight: '900', color: AppColors.brand.action },
  activityPeakDay: { marginTop: 1, fontSize: 12, lineHeight: 16, fontWeight: '900', color: AppColors.text.secondary },
  activityChart: { minHeight: 248, marginTop: 10, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 },
  activityDay: { flex: 1, alignItems: 'center', gap: 7 },
  activityDayTotal: { fontSize: 12, lineHeight: 16, fontWeight: '900', color: AppColors.text.primary },
  activityColumnPair: { height: 152, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 5 },
  activityMiniColumnWrap: { width: 15, height: 152, justifyContent: 'flex-end', borderRadius: 999, backgroundColor: AppColors.border.soft, overflow: 'hidden' },
  activityColumn: {
    width: '100%',
    minHeight: 8,
    borderRadius: 999,
  },
  adminSegment: { backgroundColor: AppColors.brand.action },
  doctorSegment: { backgroundColor: AppColors.brand.teal },
  activityDaySplit: { flexDirection: 'row', gap: 4 },
  activitySplitText: { minWidth: 18, textAlign: 'center', fontSize: 10, lineHeight: 12, fontWeight: '800', color: AppColors.text.secondary },
  activityDateLabel: { marginTop: -2, fontSize: 10, lineHeight: 12, fontWeight: '900', color: AppColors.text.secondary, textTransform: 'uppercase' },
  activityLegend: { flexDirection: 'row', gap: 16, justifyContent: 'center', flexWrap: 'wrap' },
  activityLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  activityLegendSwatch: { width: 10, height: 10, borderRadius: 999 },
  activityLegendText: { fontSize: 12, lineHeight: 16, fontWeight: '800', color: AppColors.text.secondary },
  chart: { height: 260, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: 28, gap: 10 },
  barSlot: { flex: 1, alignItems: 'center', gap: 8 },
  barTrack: { width: 34, height: 160, borderRadius: 999, backgroundColor: AppColors.border.soft, justifyContent: 'flex-end', overflow: 'hidden' },
  bar: { width: '100%', borderRadius: 999, backgroundColor: AppColors.brand.action },
  barValue: { fontSize: 12, lineHeight: 16, fontWeight: '900', color: AppColors.text.primary },
  barLabel: { fontSize: 11, fontWeight: '800', color: AppColors.text.muted },
  regionList: { marginTop: 24, gap: 18 },
  regionItem: { gap: 8 },
  regionHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  regionLabel: { fontSize: 13, fontWeight: '700', color: AppColors.text.body },
  regionPercent: { fontSize: 13, fontWeight: '900', color: AppColors.text.primary },
  track: { height: 8, borderRadius: 999, backgroundColor: AppColors.border.soft, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999, backgroundColor: AppColors.brand.action },
  mapLegendCard: { borderRadius: 18, padding: 16, backgroundColor: AppColors.surface.card },
  mapLegendTitle: { fontSize: 13, lineHeight: 18, fontWeight: '900', color: AppColors.text.primary },
  mapLegendList: { marginTop: 10, gap: 8 },
  mapLegendRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mapLegendRank: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  mapLegendRankText: { fontSize: 12, lineHeight: 16, fontWeight: '900', color: AppColors.surface.card },
  mapLegendCopy: { flex: 1, minWidth: 0 },
  mapLegendState: { fontSize: 13, lineHeight: 17, fontWeight: '900', color: AppColors.text.primary },
  mapLegendMeta: { marginTop: 2, fontSize: 11, lineHeight: 14, fontWeight: '700', color: AppColors.text.secondary },
  linkText: { fontSize: 13, fontWeight: '900', color: AppColors.brand.action },
  hospitalList: { marginTop: 14, gap: 10 },
  hospitalRow: {
    minHeight: 76,
    borderRadius: 16,
    backgroundColor: AppColors.surface.subtle,
    borderWidth: 1,
    borderColor: AppColors.border.soft,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  hospitalIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.decorative.hospitalIconWash },
  hospitalIconAlert: { backgroundColor: AppColors.status.dangerWash },
  hospitalCopy: { flex: 1, minWidth: 0 },
  hospitalName: { color: AppColors.text.primary, fontWeight: '900', fontSize: 14, lineHeight: 18 },
  hospitalDetail: { marginTop: 4, color: AppColors.text.secondary, fontSize: 12, lineHeight: 16, fontWeight: '600' },
  outbreakSummary: { alignItems: 'flex-end', minWidth: 160 },
  outbreakCount: { fontSize: 22, lineHeight: 26, fontWeight: '900' },
  outbreakCountAlert: { color: AppColors.status.dangerOutbreak },
  outbreakCountQuiet: { color: AppColors.brand.action },
  outbreakLabel: { marginTop: 2, color: AppColors.text.secondary, fontSize: 11, lineHeight: 14, fontWeight: '800', textAlign: 'right' },
  modalOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: AppColors.modal.backdropStrong },
  mapModalOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 14 },
  mapDialog: {
    width: '100%',
    maxWidth: 1520,
    maxHeight: '96%',
    borderRadius: 24,
    backgroundColor: AppColors.surface.card,
    borderWidth: 1,
    borderColor: AppColors.border.default,
    overflow: 'hidden',
    shadowColor: AppColors.text.primary,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.14,
    shadowRadius: 36,
    elevation: 8,
  },
  mapDialogHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 18, paddingHorizontal: 24, paddingTop: 22, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: AppColors.border.soft },
  mapDialogActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mapBackButton: { height: 40, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: withAlpha(AppColors.brand.action, 0.14), backgroundColor: AppColors.surface.subtle, flexDirection: 'row', alignItems: 'center', gap: 8 },
  mapBackText: { fontSize: 13, lineHeight: 16, fontWeight: '800', color: AppColors.brand.action },
  mapDialogBody: { padding: 18, flex: 1 },
  mapStateBar: { minHeight: 64, borderRadius: 18, borderWidth: 1, borderColor: AppColors.border.default, backgroundColor: AppColors.surface.subtle, padding: 14, marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  mapStateCopy: { flex: 1, minWidth: 0 },
  mapStateLabel: { fontSize: 11, lineHeight: 14, fontWeight: '900', color: AppColors.text.muted, textTransform: 'uppercase' },
  mapStateValue: { marginTop: 4, fontSize: 15, lineHeight: 20, fontWeight: '900', color: AppColors.text.primary },
  dialog: { width: '100%', maxWidth: 760, maxHeight: '90%', borderRadius: 24, padding: 0, overflow: 'hidden' },
  metricDialog: { width: '100%', maxWidth: 720, maxHeight: '86%', borderRadius: 24, padding: 0, overflow: 'hidden' },
  activityDialog: { width: '100%', maxWidth: 1280, maxHeight: '94%', borderRadius: 24, padding: 0, overflow: 'hidden' },
  dialogHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 18, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: AppColors.border.soft },
  dialogHeaderCopy: { flex: 1, minWidth: 0 },
  dialogEyebrow: { fontSize: 12, lineHeight: 16, fontWeight: '800', color: AppColors.brand.action, textTransform: 'uppercase', letterSpacing: 0 },
  dialogTitle: { marginTop: 8, fontSize: 22, lineHeight: 28, fontWeight: '900', color: AppColors.text.primary },
  dialogSubtitle: { marginTop: 8, fontSize: 14, lineHeight: 22, color: AppColors.text.soft },
  locationPill: { alignSelf: 'flex-start', marginTop: 12, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  locationText: { fontSize: 13, lineHeight: 17, fontWeight: '900', color: AppColors.text.primary },
  closeButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: AppColors.border.default },
  dialogBody: { padding: 24, gap: 20 },
  metricDialogBody: { padding: 24, gap: 18 },
  kpiInsightCard: { borderRadius: 18, borderWidth: 1, borderColor: AppColors.border.default, backgroundColor: AppColors.surface.subtle, padding: 18, flexDirection: 'row', gap: 14 },
  kpiInsightIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  kpiInsightCopy: { flex: 1, minWidth: 0 },
  kpiInsightTitle: { fontSize: 14, lineHeight: 18, fontWeight: '900', color: AppColors.text.primary },
  kpiInsightText: { marginTop: 7, fontSize: 13, lineHeight: 21, fontWeight: '600', color: AppColors.text.body },
  activityDialogBody: { padding: 18, flexDirection: 'row', gap: 16, minHeight: 650 },
  activityDetailChartPanel: { flex: 1.35, minWidth: 430, borderRadius: 20, borderWidth: 1, borderColor: AppColors.border.default, backgroundColor: AppColors.surface.card, padding: 18 },
  activityDetailPanelHeader: { marginBottom: 12 },
  activityDetailPanelTitle: { fontSize: 15, lineHeight: 20, fontWeight: '900', color: AppColors.text.primary },
  activityDetailPanelSubtitle: { marginTop: 4, fontSize: 12, lineHeight: 16, fontWeight: '700', color: AppColors.text.secondary },
  hospitalMetricListPanel: { flex: 1, minWidth: 480, borderRadius: 20, borderWidth: 1, borderColor: AppColors.border.default, backgroundColor: AppColors.surface.card, padding: 18 },
  hospitalMetricList: { maxHeight: 560 },
  hospitalMetricListContent: { gap: 10, paddingBottom: 4 },
  hospitalMetricRow: { minHeight: 74, borderRadius: 16, borderWidth: 1, borderColor: AppColors.border.soft, backgroundColor: AppColors.surface.subtle, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  hospitalMetricRowActive: { borderColor: withAlpha(AppColors.brand.action, 0.28), backgroundColor: AppColors.surface.brandWash },
  hospitalMetricRank: { width: 34, height: 34, borderRadius: 11, backgroundColor: AppColors.border.soft, alignItems: 'center', justifyContent: 'center' },
  hospitalMetricRankActive: { backgroundColor: AppColors.brand.action },
  hospitalMetricRankText: { fontSize: 13, lineHeight: 16, fontWeight: '900', color: AppColors.text.secondary },
  hospitalMetricRankTextActive: { color: AppColors.surface.card },
  hospitalMetricCopy: { flex: 1, minWidth: 0 },
  hospitalMetricName: { fontSize: 14, lineHeight: 18, fontWeight: '900', color: AppColors.text.primary },
  hospitalMetricPlace: { marginTop: 4, fontSize: 12, lineHeight: 16, fontWeight: '600', color: AppColors.text.secondary },
  hospitalMetricTotal: { fontSize: 20, lineHeight: 24, fontWeight: '900', color: AppColors.brand.action },
  hospitalMetricDetailPanel: { flex: 1, minWidth: 480, borderRadius: 20, borderWidth: 1, borderColor: AppColors.border.default, backgroundColor: AppColors.surface.card, padding: 20 },
  hospitalMetricDetailEyebrow: { fontSize: 11, lineHeight: 14, fontWeight: '900', color: AppColors.brand.action, textTransform: 'uppercase' },
  hospitalMetricDetailTitle: { marginTop: 8, fontSize: 22, lineHeight: 28, fontWeight: '900', color: AppColors.text.primary },
  hospitalMetricStatsGrid: { marginTop: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  inactiveStrip: { marginTop: 16, minHeight: 58, borderRadius: 16, borderWidth: 1, borderColor: AppColors.border.default, backgroundColor: AppColors.surface.subtle, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  inactiveStripLabel: { fontSize: 13, lineHeight: 18, fontWeight: '800', color: AppColors.text.secondary },
  inactiveStripValue: { fontSize: 24, lineHeight: 30, fontWeight: '900', color: AppColors.text.secondary },
  modalStatsGrid: { flexDirection: 'row', gap: 12 },
  hospitalDetailStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  modalStatCard: { flex: 1, minHeight: 96, borderRadius: 16, padding: 16, paddingLeft: 20, borderWidth: 1, overflow: 'hidden' },
  modalStatValue: { fontSize: 24, lineHeight: 30 },
  insightsSection: { borderRadius: 18, borderWidth: 1, borderColor: AppColors.border.default, backgroundColor: AppColors.surface.card, overflow: 'hidden' },
  insightsHeader: { minHeight: 62, paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: AppColors.border.soft },
  insightsTitle: { fontSize: 14, lineHeight: 18, fontWeight: '900', color: AppColors.text.primary },
  insightsCriteria: { marginTop: 4, fontSize: 12, lineHeight: 16, fontWeight: '600', color: AppColors.text.secondary },
  insightsList: { padding: 12, gap: 10 },
  insightRow: { minHeight: 72, borderRadius: 16, backgroundColor: AppColors.surface.subtle, borderWidth: 1, borderColor: AppColors.border.soft, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  insightMarker: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  insightRankText: { fontSize: 13, lineHeight: 16, fontWeight: '900' },
  insightCopy: { flex: 1, minWidth: 0 },
  insightTitle: { fontSize: 14, lineHeight: 18, fontWeight: '900', color: AppColors.text.primary },
  insightLocation: { marginTop: 4, fontSize: 12, lineHeight: 16, fontWeight: '600', color: AppColors.text.secondary },
  insightMeta: { alignItems: 'flex-end', maxWidth: 160 },
  insightCases: { fontSize: 13, lineHeight: 18, fontWeight: '900' },
  insightSeverity: { marginTop: 4, fontSize: 11, lineHeight: 14, fontWeight: '700', color: AppColors.text.secondary },
  emptyInsight: { padding: 18, flexDirection: 'row', alignItems: 'center', gap: 10 },
  emptyInsightText: { flex: 1, fontSize: 14, lineHeight: 22, color: AppColors.text.body },
  reportOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  reportPreviewBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: withAlpha(AppColors.text.primary, 0.38) },
  reportDialog: { width: '100%', padding: 0, overflow: 'hidden' },
  reportPreviewDialog: { flex: 1, borderRadius: 18 },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 18, paddingHorizontal: 22, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: AppColors.border.soft, minHeight: 76 },
  reportHeaderCopy: { flex: 1, minWidth: 0 },
  reportPreviewBody: { flex: 1, padding: 18, gap: 14 },
  reportPreviewFallback: { flex: 1, minHeight: 520, borderRadius: 16, borderWidth: 1, borderColor: AppColors.border.default, backgroundColor: AppColors.surface.subtle, alignItems: 'center', justifyContent: 'center', gap: 12 },
  reportPreviewFallbackText: { fontSize: 14, lineHeight: 20, fontWeight: '700', color: AppColors.text.secondary, textAlign: 'center' },
  reportDownloadButton: { minHeight: 52, borderRadius: 14, backgroundColor: AppColors.brand.action, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  reportDownloadButtonText: { fontSize: 15, lineHeight: 20, fontWeight: '900', color: AppColors.surface.card },
  errorCard: { backgroundColor: AppColors.surface.card, borderRadius: 18, padding: 24, borderWidth: 1, borderColor: AppColors.status.dangerBorder, gap: 8 },
  errorTitle: { fontSize: 18, fontWeight: '800', color: AppColors.status.dangerDeep },
  errorText: { color: AppColors.text.secondary },
  skeletonCard: { backgroundColor: AppColors.surface.subtle },
  skeletonMainPanel: { flex: 1, minWidth: 0, minHeight: 520, backgroundColor: AppColors.surface.subtle, gap: 18 },
  skeletonMetricHeader: { width: '52%', height: 14, borderRadius: 999, backgroundColor: AppColors.chart.grid },
  skeletonMetricValue: { marginTop: 28, width: 96, height: 34, borderRadius: 999, backgroundColor: AppColors.chart.skeleton },
  skeletonMetricLine: { marginTop: 18, width: '82%', height: 12, borderRadius: 999, backgroundColor: AppColors.chart.grid },
  skeletonPanelTitle: { width: 190, height: 16, borderRadius: 999, backgroundColor: AppColors.chart.skeleton },
  skeletonPanelSubtitle: { marginTop: 10, width: 260, height: 12, borderRadius: 999, backgroundColor: AppColors.chart.grid },
  skeletonHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 },
  skeletonPill: { width: 118, height: 32, borderRadius: 999, backgroundColor: AppColors.chart.grid },
  skeletonSummaryRow: { flexDirection: 'row', gap: 10 },
  skeletonSummaryCard: { flex: 1, height: 90, borderRadius: 16, backgroundColor: AppColors.chart.grid },
  skeletonPeakCard: { width: 118, height: 90, borderRadius: 16, backgroundColor: AppColors.chart.skeleton },
  skeletonChartRow: { flex: 1, minHeight: 248, flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingTop: 28 },
  skeletonChartBar: { flex: 1, maxWidth: 44, borderRadius: 999, backgroundColor: AppColors.chart.skeleton },
  skeletonMapBlob: { flex: 1, minHeight: 388, borderRadius: 18, backgroundColor: AppColors.chart.grid },
});

export default SystemDashboard;
