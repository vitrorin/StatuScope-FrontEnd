import React, { useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { initialsFromName } from '@/lib/format';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RadarMapCard } from '@/components/dashboard/RadarMapCard';
import { AlertCard } from '@/components/feedback/AlertCard';
import { DiseaseBreakdownCard } from '@/components/dashboard/DiseaseBreakdownCard';

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

const navigationLinks = {
  dashboard: '/dashboard/doctor',
  diagnosis: '/diagnosis',
  analytics: '/analytics',
} as const;

export function DoctorDashboard() {
  const router = useRouter();
  const { logout, profile } = useAuth();
  const [gridWidth, setGridWidth] = useState(0);
  const gridGap = 16;
  const metricWidth = gridWidth > 0 ? (gridWidth - gridGap * 3) / 4 : undefined;
  const mapWidth = metricWidth ? metricWidth * 2 + gridGap : undefined;

  return (
    <DashboardLayout
      active="dashboard"
      sectionLabel="Dashboard"
      searchPlaceholder="Search medical records..."
      userName={profile?.fullName ?? 'Doctor'}
      userId={profile?.hospitalName ? profile.hospitalName : profile?.email}
      avatarText={initialsFromName(profile?.fullName)}
      links={navigationLinks}
      onLogout={async () => {
        await logout();
        router.replace('/login');
      }}
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
          <StatCard
            title="Active Cases Nearby"
            value="1,284"
            badge="+2%"
            status="positive"
            style={[styles.metricCard, metricWidth ? { width: metricWidth, flex: undefined } : null]}
          />
          <StatCard
            title="Fastest Growing Disease"
            value="Influenza"
            badge="+25%"
            status="danger"
            subtitle="Projected increase for next 48h"
            style={[styles.metricCard, metricWidth ? { width: metricWidth, flex: undefined } : null]}
            icon={<Feather name="trending-up" size={14} color="#94A3B8" />}
          />
          <StatCard
            title="Local Risk Level"
            value="3 active clusters detected"
            badge="Moderate"
            status="warning"
            style={[styles.metricCard, metricWidth ? { width: metricWidth, flex: undefined } : null]}
          />
          <StatCard
            title="Hospital Capacity"
            value="87%"
            badge="Stable"
            status="neutral"
            subtitle="Current emergency response readiness"
            style={[styles.metricCard, metricWidth ? { width: metricWidth, flex: undefined } : null]}
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
            style={[styles.analyticsCard, metricWidth ? { width: metricWidth, flex: undefined } : null]}
          />
        </View>
        </View>
      </ScrollView>
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
