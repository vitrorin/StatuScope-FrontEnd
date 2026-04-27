import React, { useMemo, useState } from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { adminNavigationLinks, adminSidebarItems } from '@/components/dashboard/adminNavigation';
import { Button } from '@/components/foundation/Button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CardBase } from '@/components/patterns/CardBase';
import { MetaInfoRow } from '@/components/recommendations/MetaInfoRow';
import { SeverityBadge, SeverityLevel } from '@/components/recommendations/SeverityBadge';

type RecommendationTab = 'active' | 'high' | 'scheduled' | 'archive';
type RecommendationImageMode = 'heatmap' | 'chart' | 'supply';

interface RecommendationFeedItem {
  severity: SeverityLevel;
  category: string;
  title: string;
  description: string;
  metaItems: { label: string; icon?: React.ReactNode }[];
  imageMode: RecommendationImageMode;
  accentColor: string;
  actions: { label: string; variant: 'primary' | 'secondary' | 'ghost' }[];
}

const tabs = [
  { label: 'Active Alerts', value: 'active' as const, badge: 12 },
  { label: 'High Urgency', value: 'high' as const },
  { label: 'Scheduled', value: 'scheduled' as const },
  { label: 'Archive', value: 'archive' as const },
];

const recommendations: RecommendationFeedItem[] = [
  {
    severity: 'high',
    category: 'Respiratory Surge Alert',
    title: 'Increased asthma cases detected in Northeast sector',
    description:
      'Projection: 30% increase in respiratory patients tonight. Recommendation: Prepare 3 additional beds in Ward 4 and ensure supplementary oxygen inventory is verified.',
    metaItems: [
      { label: '14 mins ago', icon: <Feather name="clock" size={13} color="#7C8CA4" /> },
      { label: 'Resource Team B', icon: <Feather name="briefcase" size={13} color="#7C8CA4" /> },
    ],
    imageMode: 'heatmap',
    accentColor: '#F7C9CC',
    actions: [
      { label: 'Assign task', variant: 'primary' },
      { label: 'Notify staff', variant: 'secondary' },
      { label: 'Order supplies', variant: 'secondary' },
    ],
  },
  {
    severity: 'medium',
    category: 'Staffing Optimization',
    title: 'Optimized shift redistribution for Pediatric ICU',
    description:
      'Projection: Lower intake expected in general medicine. Recommendation: Redistribute 2 RNs from Med-Surg to PICU for the 19:00 - 07:00 shift to maintain optimal nurse-to-patient ratios.',
    metaItems: [
      { label: '1 hour ago', icon: <Feather name="clock" size={13} color="#7C8CA4" /> },
      { label: 'Nursing Admin', icon: <Feather name="briefcase" size={13} color="#7C8CA4" /> },
    ],
    imageMode: 'chart',
    accentColor: '#F2E5C1',
    actions: [
      { label: 'Assign task', variant: 'primary' },
      { label: 'Notify staff', variant: 'secondary' },
    ],
  },
  {
    severity: 'low',
    category: 'Inventory Insight',
    title: 'Predicted shortage of specific surgical sutures',
    description:
      'Insight: Usage trends suggest a stockout of size 3-0 absorbable sutures within 5 days. Recommendation: Proactively reorder 20 units ahead of the standard replenishment cycle.',
    metaItems: [
      { label: '3 hours ago', icon: <Feather name="clock" size={13} color="#7C8CA4" /> },
      { label: 'Supply Chain', icon: <Feather name="truck" size={13} color="#7C8CA4" /> },
    ],
    imageMode: 'supply',
    accentColor: '#E3E8F0',
    actions: [
      { label: 'Order supplies', variant: 'primary' },
      { label: 'Dismiss', variant: 'secondary' },
    ],
  },
];

export function AdminRecommendations() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<RecommendationTab>('active');

  const visibleRecommendations = useMemo(() => {
    if (activeTab === 'high') {
      return recommendations.filter((item) => item.severity === 'high');
    }
    if (activeTab === 'scheduled' || activeTab === 'archive') {
      return [];
    }
    return recommendations;
  }, [activeTab]);

  return (
    <DashboardLayout
      active="recommendations"
      sectionLabel="Recommendations"
      searchPlaceholder="Search models, alerts..."
      userName="Dr. Sarah Chen"
      userId="ID: 442910"
      avatarText="SC"
      links={adminNavigationLinks}
      sidebarItems={adminSidebarItems}
      onLogout={() => router.replace('/')}
    >
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.heroRow}>
            <View>
              <View style={styles.eyebrowRow}>
                <MaterialCommunityIcons name="brain" size={15} color="#1718C7" />
                <Text style={styles.eyebrow}>Intelligence Core</Text>
              </View>
              <Text style={styles.heroTitle}>AI Operational Recommendations</Text>
              <Text style={styles.heroSubtitle}>
                Predictive resource management based on real-time clinical data streams.
              </Text>
            </View>

            <Button
              label="Refresh Models"
              variant="secondary"
              size="md"
              leadingIcon={<Feather name="refresh-cw" size={14} color="#475569" />}
              style={styles.refreshButton}
            />
          </View>

          <View style={styles.tabsRow}>
            {tabs.map((tab) => {
              const isActive = tab.value === activeTab;
              return (
                <TouchableOpacity
                  key={tab.value}
                  style={[styles.tabItem, isActive && styles.tabItemActive]}
                  onPress={() => setActiveTab(tab.value)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
                  {tab.badge ? (
                    <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                      <Text style={styles.tabBadgeText}>{tab.badge}</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>

          {visibleRecommendations.length > 0 ? (
            <View style={styles.feed}>
              {visibleRecommendations.map((item) => (
                <AdminRecommendationCard key={item.title} item={item} />
              ))}
            </View>
          ) : (
            <CardBase style={styles.emptyCard}>
              <View style={styles.emptyIconWrap}>
                <MaterialCommunityIcons name="progress-clock" size={22} color="#1718C7" />
              </View>
              <Text style={styles.emptyTitle}>No recommendations yet</Text>
              <Text style={styles.emptySubtitle}>
                This section will show items here próximamente.
              </Text>
            </CardBase>
          )}
        </View>
      </ScrollView>
    </DashboardLayout>
  );
}

function AdminRecommendationCard({ item }: { item: RecommendationFeedItem }) {
  const isHigh = item.severity === 'high';

  return (
    <CardBase style={[styles.recommendationCard, isHigh && styles.recommendationCardHigh]}>
      <View style={styles.recommendationMedia}>
        <RecommendationVisual mode={item.imageMode} severity={item.severity} />
        <View style={styles.mediaBadge}>
          <SeverityBadge label={item.severity.toUpperCase()} severity={item.severity} />
        </View>
      </View>

      <View style={styles.recommendationBody}>
        <View style={styles.categoryRow}>
          <Feather
            name={item.severity === 'high' ? 'alert-triangle' : item.severity === 'medium' ? 'settings' : 'archive'}
            size={14}
            color={item.severity === 'high' ? '#F04B4B' : item.severity === 'medium' ? '#F59E0B' : '#7C8CA4'}
          />
          <Text
            style={[
              styles.category,
              {
                color:
                  item.severity === 'high'
                    ? '#F04B4B'
                    : item.severity === 'medium'
                      ? '#D7860E'
                      : '#7C8CA4',
              },
            ]}
          >
            {item.category}
          </Text>
        </View>

        <Text style={styles.recommendationTitle}>{item.title}</Text>
        <Text style={styles.recommendationDescription}>{item.description}</Text>

        <View style={styles.cardFooter}>
          <MetaInfoRow items={item.metaItems} style={styles.metaRow} />

          <View style={styles.cardActions}>
            {item.actions.map((action) => (
              <Button
                key={action.label}
                label={action.label}
                variant={action.variant}
                size="sm"
                style={action.variant === 'primary'
                  ? { ...styles.cardActionButton, ...styles.cardActionPrimary }
                  : styles.cardActionButton}
                labelStyle={action.variant === 'primary'
                  ? { ...styles.cardActionLabel, ...styles.cardActionLabelPrimary }
                  : styles.cardActionLabel}
              />
            ))}
          </View>
        </View>
      </View>
    </CardBase>
  );
}

function RecommendationVisual({
  mode,
  severity,
}: {
  mode: RecommendationImageMode;
  severity: SeverityLevel;
}) {
  if (mode === 'heatmap') {
    return (
      <View style={[styles.visualFrame, styles.visualHeatmap]}>
        <View style={styles.heatAuraOuter} />
        <View style={styles.heatAuraMiddle} />
        <View style={styles.heatFace} />
      </View>
    );
  }

  if (mode === 'chart') {
    return (
      <View style={[styles.visualFrame, styles.visualChart]}>
        <View style={styles.chartGrid} />
        <View style={styles.chartBars}>
          {[18, 22, 30, 40, 52, 66, 78, 92].map((value, index) => (
            <View key={index} style={[styles.chartBar, { height: value }]} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.visualFrame, styles.visualSupply]}>
      <View style={styles.supplyCurve} />
      <View style={styles.supplyBars}>
        {[26, 34, 42, 56, 62, 78].map((value, index) => (
          <View key={index} style={[styles.supplyBar, { height: value }]} />
        ))}
      </View>
      <View style={[styles.supplyBadge, severity === 'low' && styles.supplyBadgeLow]}>
        <Text style={styles.supplyBadgeText}>LOW</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 32,
  },
  container: {
    padding: 26,
    gap: 24,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 20,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  eyebrow: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#1718C7',
  },
  heroTitle: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '900',
    color: '#0F172A',
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 22,
    color: '#64748B',
  },
  refreshButton: {
    minHeight: 40,
    paddingHorizontal: 16,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5EAF3',
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#1718C7',
  },
  tabLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#6B7C93',
  },
  tabLabelActive: {
    color: '#1718C7',
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 6,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },
  tabBadgeActive: {
    backgroundColor: '#1718C7',
  },
  tabBadgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  feed: {
    gap: 18,
  },
  emptyCard: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderStyle: 'dashed',
    borderColor: '#DCE5F2',
  },
  emptyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: '#1F2937',
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: '#70839B',
  },
  recommendationCard: {
    flexDirection: 'row',
    padding: 0,
    overflow: 'hidden',
    borderColor: '#E8EDF5',
    backgroundColor: '#FFFFFF',
  },
  recommendationCardHigh: {
    borderColor: '#F5D3D5',
  },
  recommendationMedia: {
    width: 192,
    padding: 16,
    borderRightWidth: 1,
    borderRightColor: '#EDF2F7',
    backgroundColor: '#FAFCFF',
  },
  mediaBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
  },
  visualFrame: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DDE6F2',
  },
  visualHeatmap: {
    backgroundColor: '#8BE4E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heatAuraOuter: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 221, 87, 0.55)',
  },
  heatAuraMiddle: {
    position: 'absolute',
    width: 116,
    height: 116,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 107, 53, 0.58)',
  },
  heatFace: {
    width: 62,
    height: 92,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 72, 72, 0.64)',
    borderWidth: 2,
    borderColor: 'rgba(129, 25, 25, 0.22)',
  },
  visualChart: {
    backgroundColor: '#0C1D18',
    justifyContent: 'flex-end',
    padding: 14,
  },
  chartGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
    borderWidth: 1,
    borderColor: '#B4C8D8',
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
    height: 104,
  },
  chartBar: {
    flex: 1,
    borderRadius: 3,
    backgroundColor: '#6AA1D8',
  },
  visualSupply: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    justifyContent: 'flex-end',
  },
  supplyCurve: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: 46,
    height: 44,
    borderTopWidth: 5,
    borderTopColor: '#8FB3D8',
    borderRadius: 30,
    transform: [{ rotate: '9deg' }],
    opacity: 0.75,
  },
  supplyBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 92,
  },
  supplyBar: {
    flex: 1,
    borderRadius: 3,
    backgroundColor: '#A8C4DB',
  },
  supplyBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 6,
    backgroundColor: '#64748B',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  supplyBadgeLow: {
    backgroundColor: '#64748B',
  },
  supplyBadgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  recommendationBody: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  category: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  recommendationTitle: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 8,
  },
  recommendationDescription: {
    fontSize: 14,
    lineHeight: 24,
    color: '#67788F',
    marginBottom: 18,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  metaRow: {
    flex: 1,
    marginTop: 0,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  cardActionButton: {
    minHeight: 40,
    borderRadius: 10,
    paddingHorizontal: 16,
  },
  cardActionPrimary: {
    backgroundColor: '#1718C7',
    borderColor: '#1718C7',
  },
  cardActionLabel: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
  },
  cardActionLabelPrimary: {
    color: '#FFFFFF',
  },
});

export default AdminRecommendations;
