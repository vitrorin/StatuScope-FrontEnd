import React, { useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

const MAP_IMAGE_URI = 'https://www.figma.com/api/mcp/asset/5bd3e67c-b2d1-4685-9db8-9c8033f3f9f3';

const alerts = [
  {
    id: 'influenza-a-spike',
    title: 'Influenza A Spike',
    description: 'Confirmed 45% increase in pediatric ward in the last 6 hours.',
    variant: 'critical' as const,
    area: 'Pediatric Ward',
    priority: 'Immediate',
    recommendedAction: 'Increase respiratory observation capacity and flag pediatric fever-compatible triage as high priority.',
  },
  {
    id: 'dengue-risk-alert',
    title: 'Dengue Risk Alert',
    description: '7 suspected dengue cases reported within 3km radius today.',
    variant: 'warning' as const,
    area: 'Emergency Intake',
    priority: 'High',
    recommendedAction: 'Maintain rapid triage for vector-borne symptoms and verify hydration treatment readiness.',
  },
  {
    id: 'vaccine-supply-update',
    title: 'Vaccine Supply Update',
    description: 'New shipment of Bivalent boosters arrived in Pharmacy Unit B.',
    variant: 'info' as const,
    area: 'Pharmacy Unit B',
    priority: 'Routine',
    recommendedAction: 'Coordinate booster distribution with current demand and update immunization planning for vulnerable groups.',
  },
  {
    id: 'new-epidemiological-pattern',
    title: 'New Epidemiological Pattern',
    description: 'Unusual increase in pediatric fever cases detected today.',
    variant: 'neutral' as const,
    area: 'General Pediatrics',
    priority: 'Review',
    recommendedAction: 'Review symptom similarity across new fever cases and compare against current influenza cluster signals.',
  },
] satisfies DoctorDashboardAlert[];

const topMetrics = [
  {
    title: 'Active Cases Nearby',
    value: '1,284',
    badge: '+2%',
    status: 'positive' as const,
    detailTitle: 'Active Cases Nearby',
    detailSummary: 'Current number of tracked cases across the surrounding monitored districts near this hospital.',
    signalLabel: 'Growing regional load',
    recommendedAction: 'Sustain high-sensitivity triage and keep nearby cluster monitoring active during the next intake cycle.',
  },
  {
    title: 'Fastest Growing Disease',
    value: 'Influenza',
    badge: '+25%',
    status: 'danger' as const,
    subtitle: 'Projected increase for next 48h',
    detailTitle: 'Fastest Growing Disease',
    detailSummary: 'The disease with the strongest projected acceleration based on regional and clinical intake signals.',
    signalLabel: 'High acceleration',
    recommendedAction: 'Prioritize respiratory readiness, increase watch on pediatric admissions, and align staff for rapid case escalation.',
    iconKey: 'trend' as const,
  },
  {
    title: 'Local Risk Level',
    value: '3 active clusters detected',
    badge: 'Moderate',
    status: 'warning' as const,
    detailTitle: 'Local Risk Level',
    detailSummary: 'The active cluster count and their current pressure level around the hospital influence zone.',
    signalLabel: 'Moderate regional pressure',
    recommendedAction: 'Continue cluster surveillance and prepare flexible patient flow routing if one cluster intensifies quickly.',
  },
  {
    title: 'Hospital Capacity',
    value: '87%',
    badge: 'Stable',
    status: 'neutral' as const,
    subtitle: 'Current emergency response readiness',
    detailTitle: 'Hospital Capacity',
    detailSummary: 'Overall emergency response readiness considering beds, staff coverage, and acute operational load.',
    signalLabel: 'Stable but watchful',
    recommendedAction: 'Maintain current readiness level and protect buffer capacity for respiratory and fever-driven intake.',
  },
] satisfies DoctorDashboardMetric[];

const mapZones = [
  {
    id: 'west-cluster',
    name: 'West District Respiratory Cluster',
    risk: 'High',
    disease: 'Influenza-like Illness',
    cases: '14 active signals',
    radius: '3.2 km',
    priority: 'Immediate',
    note: 'This area is generating the strongest respiratory pressure signal in the current local map view.',
    recommendedAction: 'Increase respiratory observation readiness and keep a fast referral pathway open for new symptomatic patients.',
    top: '49%',
    left: '48%',
    borderColor: '#EF4444',
  },
  {
    id: 'central-hospital-node',
    name: 'Central Referral Node',
    risk: 'Monitored',
    disease: 'Mixed intake pressure',
    cases: '42 tracked admissions',
    radius: 'Hospital core',
    priority: 'Operational review',
    note: 'The central node is concentrating referral volume and balancing admissions from the surrounding districts.',
    recommendedAction: 'Keep referral routing active and coordinate bed allocation with emergency and ICU-adjacent teams.',
    top: '33%',
    left: '63%',
    borderColor: '#0003B8',
  },
  {
    id: 'south-east-fever-zone',
    name: 'South-East Fever Zone',
    risk: 'Moderate',
    disease: 'Pediatric fever cluster',
    cases: '9 monitored cases',
    radius: '2.4 km',
    priority: 'Early action',
    note: 'A smaller but consistent pediatric fever grouping is appearing in the south-east area of influence.',
    recommendedAction: 'Prepare pediatric observation capacity and maintain rapid symptom escalation review for similar presentations.',
    top: '61%',
    left: '57%',
    borderColor: '#F97316',
  },
] satisfies DoctorDashboardZone[];

const navigationLinks = {
  dashboard: '/dashboard/doctor',
  diagnosis: '/diagnosis',
  analytics: '/analytics',
} as const;

export function DoctorDashboard() {
  const router = useRouter();
  const [gridWidth, setGridWidth] = useState(0);
  const [selectedMetric, setSelectedMetric] = useState<DoctorDashboardMetric | null>(null);
  const [selectedZone, setSelectedZone] = useState<DoctorDashboardZone | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<DoctorDashboardAlert | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const gridGap = 16;
  const metricWidth = gridWidth > 0 ? (gridWidth - gridGap * 3) / 4 : undefined;
  const mapWidth = metricWidth ? metricWidth * 2 + gridGap : undefined;

  return (
    <DashboardLayout
      active="dashboard"
      sectionLabel="Dashboard"
      searchPlaceholder="Search medical records..."
      userName="Dr. Sarah Chen"
      userId="ID: 442910"
      avatarText="SC"
      links={navigationLinks}
      onLogout={() => router.replace('/')}
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
          {topMetrics.map((metric) => (
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
          <RadarMapCard
            title="Live Heatmap"
            showOverlayPanel
            overlayTitle="LIVE HEATMAP"
            overlayBadgeLabel="SECURE"
            overlayItems={[
              { label: 'COVID-19 Clusters', value: '14', color: '#EF4444' },
              { label: 'Influenza', value: '42', color: '#F97316' },
              { label: 'Hospital Density', value: 'High', color: '#0003B8' },
            ]}
            showControls
            legendItems={[
              { label: 'High Risk', color: '#EF4444' },
              { label: 'Emerging', color: '#FB923C' },
              { label: 'Hospital Node', color: '#0003B8' },
            ]}
            footerTextRight="Last Sync: Just Now"
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

          <View
            style={[styles.alertsPanel, metricWidth ? { width: metricWidth } : null]}
          >
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

          <DiseaseBreakdownCard
            title="Disease Breakdown"
            rows={[
              { label: 'MEASLES', valueText: '124 Cases', progress: 44, barColor: '#1718C7', barHeight: 12 },
              { label: 'DENGUE', valueText: '89 Cases', progress: 34, barColor: '#1718C7', barHeight: 12 },
              { label: 'INFLUENZA', valueText: '312 Cases', progress: 84, barColor: '#1718C7', barHeight: 12 },
              { label: 'PERTUSSIS', valueText: '12 Cases', progress: 10, barColor: '#1718C7', barHeight: 12 },
              { label: 'COVID-LIKE ILLNESS', valueText: '245 Cases', progress: 65, barColor: '#1718C7', barHeight: 12 },
            ]}
            summaryItems={[
              { label: 'Total Cases Analysed', value: '782' },
              { label: 'Growth vs Prev. Week', value: '+12.4%', valueColor: '#EF4444' },
            ]}
            buttonLabel="Export Full Report"
            onButtonPress={() => setIsReportOpen(true)}
            style={[styles.analyticsCard, metricWidth ? { width: metricWidth, flex: undefined } : null]}
          />
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
});

export default DoctorDashboard;
