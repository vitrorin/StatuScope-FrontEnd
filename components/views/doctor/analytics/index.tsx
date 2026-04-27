import React, { useState } from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DiseaseBreakdownCard } from '@/components/dashboard/DiseaseBreakdownCard';
import { RadarMapCard } from '@/components/dashboard/RadarMapCard';
import { DetectionBanner } from '@/components/feedback/DetectionBanner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SidebarItemKey, SidebarNavItem } from '@/components/Sidebar';
import { SummaryCountCard } from '@/components/users/SummaryCountCard';
import {
  AnalyticsDiseaseDetail,
  DiseaseDetailOverlay,
} from '@/components/views/doctor/analytics/Sub-funcionalidades/DiseaseDetailOverlay';
import {
  AnalyticsZoneDetail,
  ZoneDetailOverlay,
} from '@/components/views/doctor/analytics/Sub-funcionalidades/ZoneDetailOverlay';
import { ExpandedMapOverlay } from '@/components/views/doctor/analytics/Sub-funcionalidades/ExpandedMapOverlay';

const doctorNavigationLinks = {
  dashboard: '/dashboard/doctor',
  diagnosis: '/diagnosis',
  analytics: '/analytics',
} as const;

const MAP_IMAGE_URI = 'https://www.figma.com/api/mcp/asset/cbdd5cc9-3c45-4f39-a2c3-b4e5475de25a';

const timeFilterOptions = [
  { label: 'Last 24 Hours', value: '24h' },
  { label: 'Last 72 Hours', value: '72h' },
  { label: 'Last Week', value: 'week' },
];

const rangeOptions = [
  { label: '1km', value: '1km' },
  { label: '5km', value: '5km' },
  { label: '10km', value: '10km' },
];

const legendItems = [
  { label: 'High Risk', color: '#EF4444' },
  { label: 'Moderate', color: '#FB923C' },
];

const breakdownRows = [
  { id: 'measles', label: 'Measles', valueText: '124 Cases', progress: 45, barColor: '#0003B8' },
  { id: 'dengue', label: 'Dengue', valueText: '89 Cases', progress: 35, barColor: '#0003B8' },
  { id: 'influenza', label: 'Influenza', valueText: '312 Cases', progress: 85, barColor: '#0003B8' },
  { id: 'pertussis', label: 'Pertussis', valueText: '12 Cases', progress: 10, barColor: '#0003B8' },
  { id: 'covid-like-illness', label: 'COVID-like Illness', valueText: '245 Cases', progress: 65, barColor: '#0003B8' },
];

const breakdownSummary = [
  { label: 'Total Cases Analysed', value: '782' },
  { label: 'Growth vs Prev. Week', value: '+12.4%', valueColor: '#DC2626' },
];

const zoneDetails: AnalyticsZoneDetail[] = [
  {
    id: 'west-district',
    name: 'West District Cluster',
    risk: 'High',
    disease: 'Influenza-like illness',
    radius: '3.2 km',
    priority: 'Immediate monitoring',
    trend: 'Case density has risen steadily over the last 24 hours with concentrated respiratory complaints around the western corridor.',
    note: 'This hotspot is the most active cluster in the current radar window.',
  },
  {
    id: 'south-east-corridor',
    name: 'South-East Corridor',
    risk: 'Moderate',
    disease: 'Dengue',
    radius: '1.8 km',
    priority: 'Field review recommended',
    trend: 'Mosquito-borne symptom reports increased near the corridor, but growth remains slower than the west cluster.',
    note: 'Moderate risk area with vector-borne activity requiring prevention follow-up.',
  },
];

const diseaseDetails: AnalyticsDiseaseDetail[] = [
  {
    id: 'measles',
    name: 'Measles',
    cases: '124 current cases',
    weeklyGrowth: '+6.8%',
    riskLevel: 'Moderate',
    affectedZones: 'North and central neighborhoods',
    trend: 'Vaccination gap pockets are driving a moderate but steady increase this week.',
  },
  {
    id: 'dengue',
    name: 'Dengue',
    cases: '89 current cases',
    weeklyGrowth: '+9.4%',
    riskLevel: 'Moderate',
    affectedZones: 'South-East corridor',
    trend: 'Localized vector activity is producing a contained but meaningful rise in suspected dengue cases.',
  },
  {
    id: 'influenza',
    name: 'Influenza',
    cases: '312 current cases',
    weeklyGrowth: '+12.4%',
    riskLevel: 'High',
    affectedZones: 'West district and nearby wards',
    trend: 'Influenza-like illness is the dominant growth signal and the strongest contributor to current regional pressure.',
  },
  {
    id: 'pertussis',
    name: 'Pertussis',
    cases: '12 current cases',
    weeklyGrowth: '+2.1%',
    riskLevel: 'Low',
    affectedZones: 'Scattered low-density pockets',
    trend: 'Case volume remains small with only isolated pediatric reporting.',
  },
  {
    id: 'covid-like-illness',
    name: 'COVID-like Illness',
    cases: '245 current cases',
    weeklyGrowth: '+10.2%',
    riskLevel: 'High',
    affectedZones: 'Central transit belt',
    trend: 'Respiratory symptom clusters are increasing near high-mobility areas and should be closely monitored.',
  },
];

export interface AnalyticsScreenProps {
  active?: SidebarItemKey;
  sectionLabel?: string;
  searchPlaceholder?: string;
  userName?: string;
  userId?: string;
  avatarText?: string;
  links?: Partial<Record<SidebarItemKey, string>>;
  sidebarItems?: SidebarNavItem[];
}

export function AnalyticsScreen({
  active = 'analytics',
  sectionLabel = 'Analytics',
  searchPlaceholder = 'Search medical records...',
  userName = 'Dr. Sarah Chen',
  userId = 'ID: 442910',
  avatarText = 'SC',
  links = doctorNavigationLinks,
  sidebarItems,
}: AnalyticsScreenProps) {
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState('24h');
  const [range, setRange] = useState('5km');
  const [selectedZone, setSelectedZone] = useState<AnalyticsZoneDetail | null>(null);
  const [selectedDisease, setSelectedDisease] = useState<AnalyticsDiseaseDetail | null>(null);
  const [isExpandedMapOpen, setIsExpandedMapOpen] = useState(false);

  const mapPins = [
    {
      id: 'west-district',
      top: '30%',
      left: '40%',
      borderColor: '#FFFFFF',
      fillColor: '#EF4444',
      onPress: () => setSelectedZone(zoneDetails[0]),
    },
    {
      id: 'south-east-corridor',
      top: '48%',
      left: '65%',
      borderColor: '#FFFFFF',
      fillColor: '#FB923C',
      onPress: () => setSelectedZone(zoneDetails[1]),
    },
  ];

  return (
    <DashboardLayout
      active={active}
      sectionLabel={sectionLabel}
      searchPlaceholder={searchPlaceholder}
      userName={userName}
      userId={userId}
      avatarText={avatarText}
      links={links}
      sidebarItems={sidebarItems}
      onLogout={() => router.replace('/')}
    >
      <>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
        <View style={styles.filtersRow}>
          <View style={styles.timeTabsShell}>
            {timeFilterOptions.map((option) => {
              const active = option.value === timeFilter;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.timeTab, active && styles.timeTabActive]}
                  onPress={() => setTimeFilter(option.value)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.timeTabText, active && styles.timeTabTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.rangeBlock}>
            <Text style={styles.rangeLabel}>Radar Range:</Text>
            <View style={styles.rangeButtons}>
              {rangeOptions.map((option) => {
                const active = option.value === range;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.rangeButton, active && styles.rangeButtonActive]}
                    onPress={() => setRange(option.value)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.rangeButtonText, active && styles.rangeButtonTextActive]}>
                      {option.label}
                    </Text>
                    <Feather
                      name="chevron-down"
                      size={14}
                      color={active ? '#FFFFFF' : '#334155'}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.mainRow}>
          <View style={styles.mapColumn}>
            <RadarMapCard
              title="Geographic Disease Radar"
              legendItems={legendItems}
              mapImageUri={MAP_IMAGE_URI}
              showHeader
              showFooter={false}
              mapHeight={508}
              pins={mapPins}
              bottomRightActionLabel="Expand"
              onBottomRightActionPress={() => setIsExpandedMapOpen(true)}
              style={styles.mapCard}
            />

            <DetectionBanner
              message="Recent Detection: Significant increase in influenza-like cases in West District (Radius: 3.2km)"
              actionLabel="Details"
              style={styles.banner}
            />
          </View>

          <DiseaseBreakdownCard
            title="Disease Breakdown"
            rows={breakdownRows.map((row) => ({
              ...row,
              onPress: () =>
                setSelectedDisease(
                  diseaseDetails.find((item) => item.id === row.id) ?? null
                ),
            }))}
            summaryItems={breakdownSummary}
            buttonLabel="Export Full Report"
            style={styles.breakdownCard}
          />
        </View>

        <View style={styles.statsRow}>
          <SummaryCountCard
            title="Population Density"
            value="14.2k"
            caption="/sq km"
            variant="info"
            icon={<Feather name="users" size={14} color="#0003B8" />}
            style={styles.statCard}
          />

          <SummaryCountCard
            title="Facility Capacity"
            value="82%"
            caption="utilised"
            variant="info"
            icon={<Feather name="plus-square" size={14} color="#0003B8" />}
            style={styles.statCard}
          />

          <SummaryCountCard
            title="Immunity Rate"
            value="68.4%"
            valueAccent={<Text style={styles.positiveAccent}>↑</Text>}
            variant="info"
            icon={<MaterialCommunityIcons name="shield-plus-outline" size={14} color="#0003B8" />}
            style={styles.statCard}
          />

          <SummaryCountCard
            title="Risk Index"
            value="Low-Med"
            variant="info"
            icon={<Feather name="radio" size={14} color="#0003B8" />}
            style={styles.statCard}
          />

          <SummaryCountCard
            title="Testing Coverage"
            value="76%"
            caption="region wide"
            variant="info"
            icon={<MaterialCommunityIcons name="test-tube" size={14} color="#0003B8" />}
            style={styles.statCard}
          />
        </View>
        </View>
      </ScrollView>
      <ZoneDetailOverlay
        visible={selectedZone !== null}
        zone={selectedZone}
        onClose={() => setSelectedZone(null)}
      />
      <DiseaseDetailOverlay
        visible={selectedDisease !== null}
        disease={selectedDisease}
        onClose={() => setSelectedDisease(null)}
      />
      <ExpandedMapOverlay
        visible={isExpandedMapOpen}
        title="Geographic Disease Radar"
        mapImageUri={MAP_IMAGE_URI}
        legendItems={legendItems}
        pins={mapPins}
        onClose={() => setIsExpandedMapOpen(false)}
      />
      </>
    </DashboardLayout>
  );
}

export function DoctorAnalytics() {
  return <AnalyticsScreen />;
}

export default DoctorAnalytics;

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 32,
  },
  container: {
    padding: 32,
    gap: 24,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeTabsShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    backgroundColor: '#EEF2F7',
    borderRadius: 14,
    padding: 4,
  },
  timeTab: {
    minWidth: 132,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  timeTabText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#64748B',
  },
  timeTabTextActive: {
    color: '#0003B8',
  },
  rangeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rangeLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#94A3B8',
  },
  rangeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 3, 184, 0.18)',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    minWidth: 76,
    justifyContent: 'center',
  },
  rangeButtonActive: {
    backgroundColor: '#0003B8',
    borderColor: '#0003B8',
    shadowColor: '#0003B8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 4,
  },
  rangeButtonText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: '#0F172A',
  },
  rangeButtonTextActive: {
    color: '#FFFFFF',
  },
  mainRow: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'stretch',
  },
  mapColumn: {
    flex: 1,
    gap: 20,
  },
  mapCard: {
    minWidth: 0,
  },
  banner: {
    borderRadius: 12,
  },
  breakdownCard: {
    width: 304,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 3, 184, 0.05)',
    paddingTop: 25,
    paddingHorizontal: 25,
    paddingBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-start',
  },
  positiveAccent: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: '#22C55E',
  },
});
