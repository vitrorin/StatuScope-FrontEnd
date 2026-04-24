import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RadarMapCard } from '@/components/dashboard/RadarMapCard';
import { AlertCard } from '@/components/feedback/AlertCard';
import { MiniBarChartCard } from '@/components/dashboard/MiniBarChartCard';

const MAP_IMAGE_URI = 'https://www.figma.com/api/mcp/asset/5bd3e67c-b2d1-4685-9db8-9c8033f3f9f3';

const alerts = [
  {
    title: 'Influenza A Spike',
    description: 'Confirmed 45% increase in pediatric ward in the last 6 hours.',
    variant: 'critical' as const,
  },
  {
    title: 'Dengue Risk Alert',
    description: '7 suspected dengue cases reported within 3km radius today.',
    variant: 'warning' as const,
  },
  {
    title: 'Vaccine Supply Update',
    description: 'New shipment of Bivalent boosters arrived in Pharmacy Unit B.',
    variant: 'info' as const,
  },
  {
    title: 'New Epidemiological Pattern',
    description: 'Unusual increase in pediatric fever cases detected today.',
    variant: 'neutral' as const,
  },
];

export function DoctorDashboard() {
  const router = useRouter();

  return (
    <DashboardLayout
      active="dashboard"
      sectionLabel="Dashboard"
      searchPlaceholder="Search medical records..."
      userName="Dr. Sarah Chen"
      userId="ID: 442910"
      avatarText="SC"
      onLogout={() => router.replace('/')}
    >
      <View style={styles.container}>
        <View style={styles.metricsRow}>
          <StatCard
            title="Active Cases Nearby"
            value="1,284"
            badge="+2%"
            status="positive"
            style={styles.metricCard}
          />
          <StatCard
            title="Fastest Growing Disease"
            value="Influenza"
            badge="+25%"
            status="danger"
            subtitle="Projected increase for next 48h"
            style={styles.metricCard}
            icon={<Feather name="trending-up" size={14} color="#94A3B8" />}
          />
          <StatCard
            title="Local Risk Level"
            value="3 active clusters detected"
            badge="Moderate"
            status="warning"
            style={styles.metricCard}
          />
          <StatCard
            title="Hospital Capacity"
            value="87%"
            badge="Stable"
            status="neutral"
            subtitle="Current emergency response readiness"
            style={styles.metricCard}
          />
          <StatCard
            title="Response Window"
            value="18 min"
            badge="On Track"
            status="positive"
            subtitle="Average emergency dispatch time"
            style={styles.metricCard}
          />
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
            style={styles.mapCard}
          />

          <View style={styles.alertsPanel}>
            <View style={styles.alertsHeader}>
              <Text style={styles.alertsTitle}>Contextual Disease Alerts</Text>
            </View>
            <View style={styles.alertsList}>
              {alerts.map((alert) => (
                <AlertCard
                  key={alert.title}
                  title={alert.title}
                  description={alert.description}
                  variant={alert.variant}
                  style={styles.alertCard}
                />
              ))}
            </View>
          </View>

          <MiniBarChartCard
            title="Case Analytics"
            subtitle="Regional Disease Trends"
            bars={[
              { label: 'MON', value: 40 },
              { label: 'TUE', value: 68 },
              { label: 'WED', value: 92 },
              { label: 'THU', value: 95, active: true },
              { label: 'FRI', value: 78 },
              { label: 'SAT', value: 56 },
              { label: 'SUN', value: 46 },
            ]}
            listItems={[
              { label: 'Respiratory/Viral', value: '2,140 cases' },
              { label: 'Gastrointestinal', value: '842 cases' },
              { label: 'Cardiovascular', value: '612 cases' },
            ]}
            buttonLabel="View Full Epidemiological Report"
            style={styles.analyticsCard}
          />
        </View>
      </View>
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  mainGrid: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  mapCard: {
    width: 600,
    flexShrink: 0,
    alignSelf: 'center',
  },
  alertsPanel: {
    width: 320,
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
    width: 320,
    flexShrink: 0,
    minHeight: 540,
  },
});

export default DoctorDashboard;
