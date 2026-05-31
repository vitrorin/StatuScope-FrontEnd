import React, { useMemo, useState } from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LayoutChangeEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { RadarMapCard } from '@/components/dashboard/RadarMapCard';
import { DiseaseBreakdownCard } from '@/components/dashboard/DiseaseBreakdownCard';
import { StatCard, StatCardStatus } from '@/components/dashboard/StatCard';
import { adminNavigationLinks, adminSidebarItems } from '@/components/dashboard/adminNavigation';
import { AlertCard } from '@/components/feedback/AlertCard';
import { Button } from '@/components/foundation/Button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
import { initialsFromName } from '@/lib/format';

const overviewMetrics: AdminDashboardMetric[] = [
  {
    id: 'bed-availability',
    title: 'Bed Availability',
    value: '85%',
    badge: 'Stable',
    status: 'positive',
    subtitle: '124 open beds across monitored floors',
    progressValue: 85,
    progressColor: '#22C55E',
    detailTitle: 'Bed Availability',
    detailSummary: 'Current inpatient bed availability across high-pressure care areas and overflow units.',
    signalLabel: 'Healthy buffer',
    recommendedAction: 'Keep surge beds ready in observation and maintain discharge pacing for the evening shift.',
    iconKey: 'bed',
  },
  {
    id: 'icu-capacity',
    title: 'ICU Capacity',
    value: '12 / 20',
    badge: 'Tight',
    status: 'warning',
    subtitle: 'Critical care utilization is trending upward',
    progressValue: 60,
    progressColor: '#F59E0B',
    detailTitle: 'ICU Capacity',
    detailSummary: 'Occupied versus available intensive care beds based on the latest operational snapshot.',
    signalLabel: 'Escalation watch',
    recommendedAction: 'Review transfer candidates and prepare step-down coordination before the next intake cycle.',
    iconKey: 'activity',
  },
  {
    id: 'staffing-coverage',
    title: 'Staffing Coverage',
    value: '92%',
    badge: '-1%',
    status: 'neutral',
    subtitle: 'Float coverage holding, night shift still exposed',
    progressValue: 92,
    progressColor: '#0003B8',
    detailTitle: 'Staffing Coverage',
    detailSummary: 'Coverage level against target staffing for the active operational cycle.',
    signalLabel: 'Near target',
    recommendedAction: 'Pre-alert respiratory-capable float staff and protect current nurse-to-patient ratios.',
    iconKey: 'users',
  },
  {
    id: 'oxygen-supply',
    title: 'Oxygen Reserve',
    value: 'Optimal',
    badge: '48 hrs',
    status: 'positive',
    subtitle: 'Mainline reserve and refill window are both on track',
    progressValue: 78,
    progressColor: '#22C55E',
    detailTitle: 'Oxygen Supply Resilience',
    detailSummary: 'Mainline oxygen reserve, refill continuity, and contingency readiness for respiratory-heavy scenarios.',
    signalLabel: 'Stable reserve',
    recommendedAction: 'Maintain reserve policy and confirm emergency refill lead times with supply operations.',
    iconKey: 'shield',
  },
];

const alerts: AdminDashboardAlert[] = [
  {
    id: 'influenza-a-spike',
    title: 'Influenza A Spike',
    description: 'Confirmed 45% increase in pediatric admissions over the last 6 hours.',
    variant: 'critical',
    department: 'Pediatric Ward',
    priority: 'Immediate',
    recommendedAction: 'Escalate respiratory observation capacity and deploy additional monitoring staff in pediatric care.',
  },
  {
    id: 'dengue-risk-alert',
    title: 'Dengue Risk Alert',
    description: '7 suspected dengue cases reported within the municipal catchment today.',
    variant: 'warning',
    department: 'Emergency Department',
    priority: 'High',
    recommendedAction: 'Prepare vector-borne case triage protocol and verify hydration treatment stock availability.',
  },
  {
    id: 'cold-chain-update',
    title: 'Cold Chain Update',
    description: 'Pharmacy unit B confirmed vaccine storage stability after the latest resupply.',
    variant: 'info',
    department: 'Pharmacy Unit B',
    priority: 'Routine',
    recommendedAction: 'Rebalance booster allocation across outpatient and inpatient immunization areas.',
  },
  {
    id: 'fever-pattern-review',
    title: 'Fever Pattern Review',
    description: 'A new cluster of pediatric fever presentations has been flagged for review.',
    variant: 'neutral',
    department: 'General Pediatrics',
    priority: 'Review',
    recommendedAction: 'Open a clinical review on the fever cluster and compare with regional trend signals.',
  },
];

const mapZones: AdminDashboardZone[] = [
  {
    id: 'central-hospital-node',
    name: 'Hospital Command Node',
    risk: 'Monitored',
    disease: 'Mixed intake pressure',
    cases: '42 tracked admissions',
    radius: 'Hospital core',
    priority: 'Operational review',
    note: 'This node concentrates referral pressure and serves as the coordination center for nearby districts.',
    recommendedAction: 'Keep transfer routing active and maintain live coordination with ICU and emergency bed managers.',
    latitude: 25.6866,
    longitude: -100.3161,
    borderColor: '#0003B8',
  },
  {
    id: 'west-respiratory-cluster',
    name: 'West Respiratory Cluster',
    risk: 'High',
    disease: 'Influenza-like illness',
    cases: '14 active signals',
    radius: '3.2 km',
    priority: 'Immediate',
    note: 'The west district is showing the strongest spike in respiratory pressure during the latest reporting window.',
    recommendedAction: 'Shift respiratory-ready beds to the west intake corridor and increase oxygen cart coverage nearby.',
    latitude: 25.6928,
    longitude: -100.3485,
    borderColor: '#EF4444',
  },
  {
    id: 'south-east-pediatric-zone',
    name: 'South-East Pediatric Zone',
    risk: 'Moderate',
    disease: 'Pediatric fever cluster',
    cases: '9 monitored cases',
    radius: '2.4 km',
    priority: 'Early action',
    note: 'Early case grouping is appearing in the south-east corridor with growing pediatric symptom similarity.',
    recommendedAction: 'Prepare pediatric observation capacity and sustain rapid triage for fever-compatible presentations.',
    latitude: 25.6631,
    longitude: -100.2878,
    borderColor: '#F97316',
  },
  {
    id: 'north-vaccine-corridor',
    name: 'North Vaccine Corridor',
    risk: 'Controlled',
    disease: 'Vaccination coverage catch-up',
    cases: '3 supply requests',
    radius: '4.1 km',
    priority: 'Routine',
    note: 'The northern corridor remains clinically stable but depends on timely redistribution of vaccines and PPE.',
    recommendedAction: 'Keep pharmacy dispatch synchronized with outpatient campaign schedules and avoid local stock pockets.',
    latitude: 25.7184,
    longitude: -100.3096,
    borderColor: '#22C55E',
  },
];

const readinessRows = [
  { id: 'respiratory', label: 'RESPIRATORY / VIRAL', valueText: '2,140 cases', progress: 72, barColor: '#1718C7' },
  { id: 'gastro', label: 'GASTROINTESTINAL', valueText: '842 cases', progress: 34, barColor: '#63A8FF' },
  { id: 'cardio', label: 'CARDIOVASCULAR', valueText: '612 cases', progress: 24, barColor: '#B6C3D7' },
  { id: 'vector', label: 'VECTOR-BORNE', valueText: '288 cases', progress: 18, barColor: '#F97316' },
];

const resourceRows = [
  { id: 'icu', label: 'ICU READINESS', valueText: '12 beds available', progress: 60, barColor: '#F59E0B' },
  { id: 'isolation', label: 'ISOLATION ROOMS', valueText: '18 rooms open', progress: 58, barColor: '#1718C7' },
  { id: 'oxygen', label: 'OXYGEN DISTRIBUTION', valueText: '48 hr reserve', progress: 78, barColor: '#22C55E' },
  { id: 'staff', label: 'FLEX STAFF COVERAGE', valueText: '92% staffed', progress: 92, barColor: '#0F766E' },
];

function formatSyncTime() {
  return `Last Sync: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function getMapBounds(zones: AdminDashboardZone[]) {
  const geocodedZones = zones.filter(
    (zone) => typeof zone.latitude === 'number' && typeof zone.longitude === 'number',
  );
  if (geocodedZones.length === 0) return undefined;

  const latitudes = geocodedZones.map((zone) => zone.latitude as number);
  const longitudes = geocodedZones.map((zone) => zone.longitude as number);
  const latitudePadding = Math.max(0.02, (Math.max(...latitudes) - Math.min(...latitudes)) * 0.35);
  const longitudePadding = Math.max(0.02, (Math.max(...longitudes) - Math.min(...longitudes)) * 0.35);

  return {
    minLatitude: Math.min(...latitudes) - latitudePadding,
    maxLatitude: Math.max(...latitudes) + latitudePadding,
    minLongitude: Math.min(...longitudes) - longitudePadding,
    maxLongitude: Math.max(...longitudes) + longitudePadding,
  };
}

function getMapCenter(zones: AdminDashboardZone[]) {
  const geocodedZones = zones.filter(
    (zone) => typeof zone.latitude === 'number' && typeof zone.longitude === 'number',
  );
  if (geocodedZones.length === 0) return null;

  return {
    latitude: geocodedZones.reduce((sum, zone) => sum + (zone.latitude as number), 0) / geocodedZones.length,
    longitude: geocodedZones.reduce((sum, zone) => sum + (zone.longitude as number), 0) / geocodedZones.length,
  };
}

function metricIcon(metric: AdminDashboardMetric) {
  const colorByStatus: Record<StatCardStatus, string> = {
    positive: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    neutral: '#64748B',
  };
  const color = colorByStatus[metric.status ?? 'neutral'];

  if (metric.iconKey === 'bed') return <MaterialCommunityIcons name="bed-outline" size={18} color={color} />;
  if (metric.iconKey === 'users') return <Feather name="users" size={18} color={color} />;
  if (metric.iconKey === 'shield') return <Feather name="shield" size={18} color={color} />;
  return <Feather name="activity" size={18} color={color} />;
}

export function AdminDashboard() {
  const router = useRouter();
  const { logout, profile } = useAuth();
  const [gridWidth, setGridWidth] = useState(0);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AdminDashboardAlert | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<AdminDashboardMetric | null>(null);
  const [selectedZone, setSelectedZone] = useState<AdminDashboardZone | null>(null);
  const [isMapHovered, setIsMapHovered] = useState(false);
  const gridGap = 16;
  const metricWidth = gridWidth > 0 ? (gridWidth - gridGap * 3) / 4 : undefined;
  const mapWidth = metricWidth ? metricWidth * 2 + gridGap : undefined;
  const hospitalName = profile?.hospitalName ?? 'Hospital Administrator';
  const userName = profile?.fullName ?? 'Hospital Administrator';
  const userId = profile?.id ? `ID: ${profile.id}` : undefined;
  const alertPreview = alerts.slice(0, 3);
  const remainingAlerts = Math.max(0, alerts.length - alertPreview.length);
  const mapCenter = useMemo(() => getMapCenter(mapZones), []);
  const mapBounds = useMemo(() => getMapBounds(mapZones), []);

  return (
    <DashboardLayout
      active="dashboard"
      sectionLabel="Dashboard"
      searchPlaceholder="Search hospital metrics..."
      userName={userName}
      userId={userId}
      avatarText={initialsFromName(userName)}
      links={adminNavigationLinks}
      sidebarItems={adminSidebarItems}
      onLogout={async () => { await logout(); router.replace('/login'); }}
    >
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.dashboardToolbar}>
            <View style={styles.dashboardToolbarContext}>
              <Text style={styles.toolbarEyebrow}>{hospitalName}</Text>
              <View style={styles.dashboardTitleUnderline} />
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

          <View
            style={styles.metricsRow}
            onLayout={(event: LayoutChangeEvent) => {
              const nextWidth = event.nativeEvent.layout.width;
              if (Math.abs(nextWidth - gridWidth) > 1) {
                setGridWidth(nextWidth);
              }
            }}
          >
            {overviewMetrics.map((metric) => (
              <TouchableOpacity
                key={metric.id}
                style={[styles.metricTouchable, metricWidth ? { width: metricWidth, flex: undefined } : styles.metricCard]}
                activeOpacity={0.86}
                onPress={() => setSelectedMetric(metric)}
              >
                <StatCard
                  title={metric.title}
                  value={metric.value}
                  badge={metric.badge}
                  status={metric.status}
                  subtitle={metric.subtitle}
                  showProgress={typeof metric.progressValue === 'number'}
                  progressValue={metric.progressValue}
                  progressColor={metric.progressColor}
                  icon={metricIcon(metric)}
                  style={styles.metricCard}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.mainGrid}>
            <RadarMapCard
              title="Hospital Impact Map"
              showOverlayPanel
              overlayTitle="LIVE OPERATIONS MAP"
              overlayBadgeLabel="SECURE"
              overlayItems={[
                { label: 'Cluster alerts', value: '4', color: '#EF4444' },
                { label: 'Referral nodes', value: '2', color: '#0003B8' },
                { label: 'Stable corridors', value: '1', color: '#22C55E' },
              ]}
              showControls
              showFooter
              footerTextLeft="© OpenStreetMap contributors"
              footerTextRight={isMapHovered ? 'Scroll to zoom, drag to pan' : formatSyncTime()}
              mapHeight={560}
              mapCenterLatitude={mapCenter?.latitude}
              mapCenterLongitude={mapCenter?.longitude}
              mapZoom={12}
              minZoom={10}
              maxZoom={16}
              mapBounds={mapBounds}
              enablePan
              onMapHoverChange={setIsMapHovered}
              bottomRightActionLabel="Expand map"
              pins={mapZones.map((zone) => ({
                id: zone.id,
                latitude: zone.latitude,
                longitude: zone.longitude,
                borderColor: zone.borderColor,
                fillColor: '#FFFFFF',
                icon: zone.borderColor === '#22C55E'
                  ? <MaterialCommunityIcons name="check-circle-outline" size={14} color={zone.borderColor} />
                  : zone.borderColor === '#F97316'
                    ? <MaterialCommunityIcons name="virus-outline" size={14} color={zone.borderColor} />
                    : zone.borderColor === '#0003B8'
                      ? <MaterialCommunityIcons name="hospital-box-outline" size={12} color={zone.borderColor} />
                      : <MaterialCommunityIcons name="alert" size={16} color={zone.borderColor} />,
                onPress: () => setSelectedZone(zone),
              }))}
              style={[styles.mapCard, mapWidth ? { width: mapWidth, flex: undefined } : null]}
            />

            <View style={[styles.alertsPanel, metricWidth ? { width: metricWidth } : null]}>
              <View style={styles.alertsHeader}>
                <Text style={styles.alertsTitle}>Operational Disease Alerts</Text>
                <View style={styles.sectionHeaderRule} />
              </View>
              <View style={styles.alertsList}>
                {alertPreview.map((alert) => (
                  <TouchableOpacity
                    key={alert.id}
                    activeOpacity={0.82}
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

                {remainingAlerts > 0 ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.moreAlertsButton}
                    onPress={() => setSelectedAlert(alerts[alertPreview.length])}
                  >
                    <Text style={styles.moreAlertsText}>Review next alert</Text>
                    <View style={styles.moreAlertsBadge}>
                      <Text style={styles.moreAlertsBadgeText}>+{remainingAlerts}</Text>
                    </View>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>

          <View style={styles.breakdownGrid}>
            <DiseaseBreakdownCard
              title="Regional Disease Pressure"
              rows={readinessRows}
              summaryItems={[
                { label: '7-day trend', value: '+12%', valueColor: '#DC2626' },
                { label: 'Dominant pattern', value: 'Respiratory / viral' },
              ]}
              buttonLabel="View Full Epidemiological Report"
              onButtonPress={() => setIsReportOpen(true)}
              style={styles.breakdownCard}
            />
            <DiseaseBreakdownCard
              title="Facility Readiness"
              rows={resourceRows}
              summaryItems={[
                { label: 'Escalation level', value: 'Level 2 monitoring', valueColor: '#B45309' },
                { label: 'Next review', value: '18:00 local' },
              ]}
              buttonLabel="Open Alert Protocol"
              onButtonPress={() => setIsProtocolOpen(true)}
              style={styles.breakdownCard}
            />
          </View>
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

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 32,
  },
  container: {
    padding: 32,
    gap: 32,
  },
  dashboardToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
  },
  dashboardToolbarContext: {
    flex: 1,
    minWidth: 0,
  },
  toolbarEyebrow: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '900',
    color: '#0F172A',
  },
  dashboardTitleUnderline: {
    width: 214,
    height: 3,
    borderRadius: 999,
    backgroundColor: '#0F172A',
    marginTop: 8,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  secondaryAction: {
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  primaryAction: {
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#0003B8',
    borderColor: '#0003B8',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metricTouchable: {
    flex: 1,
  },
  metricCard: {
    flex: 1,
    minWidth: 0,
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
    alignSelf: 'stretch',
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
  },
  alertsHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  alertsTitle: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionHeaderRule: {
    width: 72,
    height: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 3, 184, 0.14)',
    marginTop: 10,
  },
  alertsList: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  alertCard: {
    width: '100%',
    minHeight: 0,
  },
  moreAlertsButton: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 3, 184, 0.16)',
    backgroundColor: '#EEF2FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  moreAlertsText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    color: '#0003B8',
  },
  moreAlertsBadge: {
    minWidth: 26,
    height: 24,
    borderRadius: 999,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  moreAlertsBadgeText: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '900',
    color: '#0003B8',
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
});

export default AdminDashboard;
