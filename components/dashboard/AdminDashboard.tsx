import React, { useState } from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LayoutChangeEvent, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { initialsFromName } from '@/lib/format';
import { SidebarNavItem } from '@/components/Sidebar';
import { RadarMapCard } from '@/components/dashboard/RadarMapCard';
import { adminNavigationLinks, adminSidebarItems } from '@/components/dashboard/adminNavigation';
import { AlertCard } from '@/components/feedback/AlertCard';
import { Button } from '@/components/foundation/Button';
import { ProgressBar } from '@/components/foundation/ProgressBar';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CardBase } from '@/components/patterns/CardBase';

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

const topCards = [
  {
    title: 'AVAILABLE BEDS',
    value: '85%',
    badge: '-2%',
    badgeColor: '#22C55E',
    progressValue: 78,
    progressColor: '#22C55E',
  },
  {
    title: 'ICU BEDS',
    value: '12/20',
    badge: '-5%',
    badgeColor: '#EF4444',
    progressValue: 64,
    progressColor: '#3B82F6',
  },
  {
    title: 'OXYGEN SUPPLY',
    value: 'OPTIMAL',
    badge: 'Stable',
    badgeColor: '#94A3B8',
    segmented: true,
  },
  {
    title: 'STAFFING',
    value: '92%',
    badge: '-1%',
    badgeColor: '#EF4444',
    progressValue: 84,
    progressColor: '#22C55E',
  },
  {
    title: 'ISOLATION ROOMS',
    value: '18',
    badge: '+3',
    badgeColor: '#22C55E',
    progressValue: 58,
    progressColor: '#1718C7',
  },
  {
    title: 'EMERGENCY CAPACITY',
    value: 'Warning',
    subtitle: 'Surgical Ward Overflow\nImminent',
    tone: 'critical' as const,
  },
];

export function AdminDashboard() {
  const router = useRouter();
  const { logout, profile } = useAuth();
  const [gridWidth, setGridWidth] = useState(0);
  const gridGap = 16;
  const topGap = 12;
  const metricWidth = gridWidth > 0 ? (gridWidth - gridGap * 3) / 4 : undefined;
  const mapWidth = metricWidth ? metricWidth * 2 + gridGap : undefined;
  const topCardWidth = gridWidth > 0 ? (gridWidth - topGap * 5) / 6 : undefined;

  return (
    <DashboardLayout
      active="dashboard"
      sectionLabel="Dashboard"
      searchPlaceholder="Search hospital metrics..."
      userName={profile?.fullName ?? 'Administrator'}
      userId={profile?.hospitalName ? profile.hospitalName : profile?.email}
      avatarText={initialsFromName(profile?.fullName)}
      links={adminNavigationLinks}
      sidebarItems={adminSidebarItems}
      onLogout={async () => {
        await logout();
        router.replace('/login');
      }}
    >
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroTitle}>Hospital Radar Overview</Text>
              <Text style={styles.heroSubtitle}>
                Real-time epidemiological monitoring and facility status tracking.
              </Text>
            </View>

            <View style={styles.heroActions}>
              <Button
                label="Export Report"
                size="sm"
                variant="secondary"
                leadingIcon={<Feather name="download" size={12} color="#334155" />}
                style={styles.secondaryAction}
              />
              <Button
                label="Alert Protocol"
                size="sm"
                variant="primary"
                leadingIcon={<Feather name="star" size={12} color="#FFFFFF" />}
                style={styles.primaryAction}
              />
            </View>
          </View>

          <View style={styles.topCardsRow}>
            {topCards.map((card) => (
              <OverviewMetricCard
                key={card.title}
                {...card}
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

              <View style={[styles.alertsPanel, metricWidth ? { width: metricWidth } : null]}>
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

              <AdminCaseAnalyticsCard
                style={[styles.analyticsCard, metricWidth ? { width: metricWidth, flex: undefined } : null]}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </DashboardLayout>
  );
}

interface OverviewMetricCardProps {
  title: string;
  value: string;
  badge?: string;
  badgeColor?: string;
  subtitle?: string;
  progressValue?: number;
  progressColor?: string;
  segmented?: boolean;
  tone?: 'default' | 'critical';
  style?: StyleProp<ViewStyle>;
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
}: OverviewMetricCardProps) {
  const isCritical = tone === 'critical';

  return (
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
  );
}

function AdminCaseAnalyticsCard({
  style,
}: {
  style?: StyleProp<ViewStyle>;
}) {
  const chartBars = [
    { label: 'MON', value: 50 },
    { label: 'TUE', value: 76 },
    { label: 'WED', value: 100 },
    { label: 'THU', value: 104, active: true },
    { label: 'FRI', value: 86 },
    { label: 'SAT', value: 64 },
    { label: 'SUN', value: 56 },
  ];
  const maxValue = Math.max(...chartBars.map((bar) => bar.value), 1);

  return (
    <CardBase style={[styles.caseCard, style]}>
      <View style={styles.caseHeader}>
        <Text style={styles.caseTitle}>Case Analytics</Text>
        <Button
          label="Last 7 Days"
          size="sm"
          variant="surface"
          trailingIcon={<Feather name="chevron-down" size={12} color="#64748B" />}
          style={styles.caseFilter}
          labelStyle={styles.caseFilterLabel}
        />
      </View>

      <Text style={styles.caseSectionLabel}>Regional Disease Trends</Text>

      <View style={styles.caseChart}>
        {chartBars.map((bar) => {
          const heightPercent = (bar.value / maxValue) * 100;
          return (
            <View key={bar.label} style={styles.caseBarItem}>
              <View style={styles.caseBarTrack}>
                <View
                  style={[
                    styles.caseBarFill,
                    {
                      height: `${heightPercent}%`,
                      backgroundColor: bar.active ? '#1215C9' : '#C7C9F3',
                    },
                  ]}
                />
              </View>
              <Text style={styles.caseBarLabel}>{bar.label}</Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.caseSectionLabel}>Top Diseases by Volume</Text>

      <View style={styles.caseMetrics}>
        <View style={styles.caseMetricRow}>
          <View style={styles.caseMetricTopRow}>
            <Text style={styles.caseMetricName}>Respiratory/Viral</Text>
            <Text style={styles.caseMetricValue}>2,140 cases</Text>
          </View>
          <View style={styles.caseMetricTrack}>
            <View style={[styles.caseMetricFill, { width: '72%', backgroundColor: '#1215C9' }]} />
          </View>
        </View>

        <View style={styles.caseMetricRow}>
          <View style={styles.caseMetricTopRow}>
            <Text style={styles.caseMetricName}>Gastrointestinal</Text>
            <Text style={styles.caseMetricValue}>842 cases</Text>
          </View>
          <View style={styles.caseMetricTrack}>
            <View style={[styles.caseMetricFill, { width: '34%', backgroundColor: '#63A8FF' }]} />
          </View>
        </View>

        <View style={styles.caseMetricRow}>
          <View style={styles.caseMetricTopRow}>
            <Text style={styles.caseMetricName}>Cardiovascular</Text>
            <Text style={styles.caseMetricValue}>612 cases</Text>
          </View>
          <View style={styles.caseMetricTrack}>
            <View style={[styles.caseMetricFill, { width: '24%', backgroundColor: '#B6C3D7' }]} />
          </View>
        </View>
      </View>

      <Button
        label="View Full Epidemiological Report"
        variant="secondary"
        size="sm"
        style={styles.caseAction}
        labelStyle={styles.caseActionLabel}
      />
    </CardBase>
  );
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
  caseChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 146,
    marginBottom: 24,
  },
  caseBarItem: {
    alignItems: 'center',
    flex: 1,
  },
  caseBarTrack: {
    width: 20,
    height: 96,
    justifyContent: 'flex-end',
  },
  caseBarFill: {
    width: '100%',
    borderRadius: 3,
    minHeight: 18,
  },
  caseBarLabel: {
    marginTop: 10,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#8B9AB0',
  },
  caseMetrics: {
    gap: 14,
    marginBottom: 24,
  },
  caseMetricRow: {
    gap: 7,
  },
  caseMetricTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
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
