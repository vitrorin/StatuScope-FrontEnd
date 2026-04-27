import React, { useMemo, useState } from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { adminNavigationLinks, adminSidebarItems } from '@/components/dashboard/adminNavigation';
import { Button } from '@/components/foundation/Button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CardBase } from '@/components/patterns/CardBase';
import { MetaInfoRow } from '@/components/recommendations/MetaInfoRow';
import { SeverityBadge } from '@/components/recommendations/SeverityBadge';
import { RecommendationDetailOverlay } from '@/components/views/admin/recommendations/Sub-funcionalidades/RecommendationDetailOverlay';
import { RecommendationDismissOverlay } from '@/components/views/admin/recommendations/Sub-funcionalidades/RecommendationDismissOverlay';
import { RecommendationNotifyOverlay } from '@/components/views/admin/recommendations/Sub-funcionalidades/RecommendationNotifyOverlay';
import { RecommendationSupplyOverlay } from '@/components/views/admin/recommendations/Sub-funcionalidades/RecommendationSupplyOverlay';
import { RecommendationTaskOverlay } from '@/components/views/admin/recommendations/Sub-funcionalidades/RecommendationTaskOverlay';
import {
  RecommendationFeedItem,
  RecommendationImageMode,
  RecommendationStatus,
  RecommendationTab,
} from '@/components/views/admin/recommendations/Sub-funcionalidades/types';

const tabs = [
  { label: 'Active Alerts', value: 'active' as const, badge: 12 },
  { label: 'High Urgency', value: 'high' as const },
  { label: 'In Progress', value: 'inProgress' as const },
  { label: 'Archive', value: 'archive' as const },
];

const initialRecommendations: RecommendationFeedItem[] = [
  {
    id: 'respiratory-surge',
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
    confidenceScore: 94,
    expectedImpact: 'High respiratory inflow',
    urgencyWindow: 'Next 6 hours',
    affectedDepartments: ['ICU', 'Ward 4', 'Respiratory Unit'],
    affectedResources: ['Supplementary oxygen', 'Emergency beds', 'Respiratory staff'],
    rationale: [
      'Regional disease model detected a sharp rise in asthma-like respiratory signals near the Northeast corridor.',
      'Hospital intake data shows a correlated increase in triage respiratory complaints over the last 2 hours.',
      'Current oxygen reserve and ward bed capacity indicate potential saturation if the trend continues into the evening.',
    ],
    recommendedActions: [
      'Open three additional monitored beds in Ward 4.',
      'Pre-stage supplementary oxygen for all respiratory observation bays.',
      'Place the respiratory response team on elevated operational readiness.',
    ],
    status: 'new',
    auditTrail: [{ timestamp: '14 mins ago', label: 'AI generated the recommendation from regional respiratory data.' }],
  },
  {
    id: 'staffing-optimization',
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
    confidenceScore: 87,
    expectedImpact: 'Staffing stability',
    urgencyWindow: 'Tonight shift',
    affectedDepartments: ['PICU', 'Med-Surg'],
    affectedResources: ['Registered nurses', 'Shift coordination'],
    rationale: [
      'Projected intake in general medicine is lower than the weekly average for the upcoming overnight window.',
      'PICU acuity is trending upward and will require tighter nurse-to-patient coverage.',
    ],
    recommendedActions: [
      'Reassign two registered nurses to PICU for the overnight rotation.',
      'Update handoff sheets before 19:00 to avoid transition gaps.',
    ],
    status: 'new',
    auditTrail: [{ timestamp: '1 hour ago', label: 'AI proposed a staffing redistribution based on overnight volume forecasting.' }],
  },
  {
    id: 'inventory-insight',
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
    confidenceScore: 79,
    expectedImpact: 'Inventory continuity',
    urgencyWindow: 'Next 5 days',
    affectedDepartments: ['Surgery', 'Central Supply'],
    affectedResources: ['Absorbable sutures 3-0', 'OR consumables'],
    rationale: [
      'Inventory burn rate over the last 10 procedures is 18% above expected baseline.',
      'Next supplier delivery window does not align with the projected usage spike.',
    ],
    recommendedActions: [
      'Issue an early reorder request for 20 additional units.',
      'Reserve remaining stock for priority surgical cases.',
    ],
    status: 'new',
    auditTrail: [{ timestamp: '3 hours ago', label: 'AI flagged a procurement risk based on operating room consumption trends.' }],
  },
];

export function AdminRecommendations() {
  const router = useRouter();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<RecommendationTab>('active');
  const [recommendations, setRecommendations] = useState<RecommendationFeedItem[]>(initialRecommendations);
  const [selectedRecommendationId, setSelectedRecommendationId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [notifyId, setNotifyId] = useState<string | null>(null);
  const [supplyId, setSupplyId] = useState<string | null>(null);
  const [dismissId, setDismissId] = useState<string | null>(null);

  const detailRecommendation = recommendations.find((item) => item.id === detailId) ?? null;
  const taskRecommendation = recommendations.find((item) => item.id === taskId) ?? null;
  const notifyRecommendation = recommendations.find((item) => item.id === notifyId) ?? null;
  const supplyRecommendation = recommendations.find((item) => item.id === supplyId) ?? null;
  const dismissRecommendation = recommendations.find((item) => item.id === dismissId) ?? null;

  const visibleRecommendations = useMemo(() => {
    if (activeTab === 'high') {
      return recommendations.filter((item) => item.severity === 'high' && !isArchived(item.status));
    }
    if (activeTab === 'inProgress') {
      return recommendations.filter((item) => item.status === 'accepted' || item.status === 'assigned');
    }
    if (activeTab === 'archive') {
      return recommendations.filter((item) => isArchived(item.status));
    }
    return recommendations.filter((item) => !isArchived(item.status));
  }, [activeTab, recommendations]);

  const updateRecommendation = (
    id: string,
    updater: (current: RecommendationFeedItem) => RecommendationFeedItem
  ) => {
    setRecommendations((current) => current.map((item) => (item.id === id ? updater(item) : item)));
  };

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
      onLogout={async () => { await logout(); router.replace('/login'); }}
    >
      <>
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

            <View style={styles.summaryRow}>
              <SummaryTile label="Active Queue" value={String(recommendations.filter((item) => !isArchived(item.status)).length)} />
              <SummaryTile label="In Progress" value={String(recommendations.filter((item) => item.status === 'accepted' || item.status === 'assigned').length)} />
              <SummaryTile label="Completed" value={String(recommendations.filter((item) => item.status === 'completed').length)} />
              <SummaryTile label="Rejected" value={String(recommendations.filter((item) => item.status === 'rejected').length)} />
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
                  <AdminRecommendationCard
                    key={item.id}
                    item={item}
                    isSelected={selectedRecommendationId === item.id}
                    onOpenDetail={() => {
                      setSelectedRecommendationId(item.id);
                      setDetailId(item.id);
                    }}
                    onSelectStatus={() => setSelectedRecommendationId(item.id)}
                    onStatusChange={(status) =>
                      updateRecommendation(item.id, (current) => ({
                        ...current,
                        status,
                        auditTrail: [
                          { timestamp: 'Now', label: `Administrator changed status to ${formatStatusLabel(status)}.` },
                          ...current.auditTrail,
                        ],
                      }))
                    }
                    onAction={(actionLabel) => {
                      setSelectedRecommendationId(item.id);
                      if (actionLabel === 'Assign task') setTaskId(item.id);
                      if (actionLabel === 'Notify staff') setNotifyId(item.id);
                      if (actionLabel === 'Order supplies') setSupplyId(item.id);
                      if (actionLabel === 'Dismiss') setDismissId(item.id);
                    }}
                  />
                ))}
              </View>
            ) : (
              <CardBase style={styles.emptyCard}>
                <View style={styles.emptyIconWrap}>
                  <MaterialCommunityIcons name="progress-clock" size={22} color="#1718C7" />
                </View>
                <Text style={styles.emptyTitle}>No recommendations yet</Text>
                <Text style={styles.emptySubtitle}>This section will show items here proximamente.</Text>
              </CardBase>
            )}
          </View>
        </ScrollView>

        <RecommendationDetailOverlay visible={detailRecommendation !== null} item={detailRecommendation} onClose={() => setDetailId(null)} />
        <RecommendationTaskOverlay
          visible={taskRecommendation !== null}
          item={taskRecommendation}
          onClose={() => setTaskId(null)}
          onSave={(payload) => {
            if (!taskRecommendation) return;
            updateRecommendation(taskRecommendation.id, (current) => ({
              ...current,
              status: 'assigned',
              assignee: payload.owner,
              auditTrail: [
                { timestamp: 'Now', label: `Assigned to ${payload.owner} for ${payload.area} with deadline ${payload.deadline}.` },
                ...current.auditTrail,
              ],
            }));
            setTaskId(null);
          }}
        />
        <RecommendationNotifyOverlay
          visible={notifyRecommendation !== null}
          item={notifyRecommendation}
          onClose={() => setNotifyId(null)}
          onSend={(payload) => {
            if (!notifyRecommendation) return;
            updateRecommendation(notifyRecommendation.id, (current) => ({
              ...current,
              status: current.status === 'new' ? 'accepted' : current.status,
              auditTrail: [
                { timestamp: 'Now', label: `Notice sent to ${payload.audience}.` },
                ...current.auditTrail,
              ],
            }));
            setNotifyId(null);
          }}
        />
        <RecommendationSupplyOverlay
          visible={supplyRecommendation !== null}
          item={supplyRecommendation}
          onClose={() => setSupplyId(null)}
          onSubmit={(payload) => {
            if (!supplyRecommendation) return;
            updateRecommendation(supplyRecommendation.id, (current) => ({
              ...current,
              status: 'accepted',
              auditTrail: [
                { timestamp: 'Now', label: `Supply request created for ${payload.quantity} units of ${payload.supplyType} to ${payload.destination}.` },
                ...current.auditTrail,
              ],
            }));
            setSupplyId(null);
          }}
        />
        <RecommendationDismissOverlay
          visible={dismissRecommendation !== null}
          item={dismissRecommendation}
          onClose={() => setDismissId(null)}
          onConfirm={() => {
            if (!dismissRecommendation) return;
            updateRecommendation(dismissRecommendation.id, (current) => ({
              ...current,
              status: 'rejected',
              auditTrail: [{ timestamp: 'Now', label: 'Recommendation rejected by administrator.' }, ...current.auditTrail],
            }));
            setDismissId(null);
          }}
        />
      </>
    </DashboardLayout>
  );
}

function AdminRecommendationCard({
  item,
  isSelected,
  onOpenDetail,
  onAction,
  onStatusChange,
  onSelectStatus,
}: {
  item: RecommendationFeedItem;
  isSelected: boolean;
  onOpenDetail: () => void;
  onAction: (actionLabel: string) => void;
  onStatusChange: (status: RecommendationStatus) => void;
  onSelectStatus: () => void;
}) {
  const isHigh = item.severity === 'high';

  return (
    <CardBase style={[styles.recommendationCard, isHigh && styles.recommendationCardHigh]}>
      <TouchableOpacity style={styles.recommendationMedia} activeOpacity={0.85} onPress={onOpenDetail}>
        <RecommendationVisual mode={item.imageMode} severity={item.severity} />
        <View style={styles.mediaBadge}>
          <SeverityBadge label={item.severity.toUpperCase()} severity={item.severity} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.recommendationBody} activeOpacity={0.92} onPress={onOpenDetail}>
        <View style={styles.topRow}>
          <View style={styles.categoryWrap}>
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
          </View>

          <TouchableOpacity
            style={[styles.statusPill, isSelected && styles.statusPillSelected]}
            onPress={onSelectStatus}
            activeOpacity={0.8}
          >
            <Text style={styles.statusPillLabel}>{formatStatusLabel(item.status)}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.recommendationDescription}>{item.description}</Text>
        <Text style={styles.insightLine}>
          Confidence {item.confidenceScore}% · Impact: {item.expectedImpact} · Window: {item.urgencyWindow}
        </Text>

        <View style={styles.cardFooter}>
          <MetaInfoRow items={item.metaItems} style={styles.metaRow} />

          <View style={styles.cardActions}>
            {item.actions.map((action) => (
              <Button
                key={action.label}
                label={action.label}
                variant={action.variant}
                size="sm"
                style={
                  action.variant === 'primary'
                    ? { ...styles.cardActionButton, ...styles.cardActionPrimary }
                    : styles.cardActionButton
                }
                labelStyle={
                  action.variant === 'primary'
                    ? { ...styles.cardActionLabel, ...styles.cardActionLabelPrimary }
                    : styles.cardActionLabel
                }
                onPress={() => onAction(action.label)}
              />
            ))}
          </View>
        </View>

        <View style={styles.statusRow}>
          {(['accepted', 'rejected', 'completed'] as RecommendationStatus[]).map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.statusChip, item.status === status && styles.statusChipActive]}
              onPress={() => onStatusChange(status)}
              activeOpacity={0.75}
            >
              <Text style={[styles.statusChipText, item.status === status && styles.statusChipTextActive]}>
                {formatStatusLabel(status)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </CardBase>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <CardBase style={styles.summaryTile}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </CardBase>
  );
}

function RecommendationVisual({
  mode,
  severity,
}: {
  mode: RecommendationImageMode;
  severity: 'high' | 'medium' | 'low';
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

function isArchived(status: RecommendationStatus) {
  return status === 'completed' || status === 'rejected';
}

function formatStatusLabel(status: RecommendationStatus) {
  switch (status) {
    case 'new':
      return 'New';
    case 'accepted':
      return 'Accepted';
    case 'rejected':
      return 'Rejected';
    case 'completed':
      return 'Completed';
    case 'assigned':
      return 'Assigned';
  }
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
  summaryRow: {
    flexDirection: 'row',
    gap: 14,
  },
  summaryTile: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
  },
  summaryLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: '#8A9AAF',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
    color: '#1718C7',
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  categoryWrap: {
    flex: 1,
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
    marginBottom: 10,
  },
  insightLine: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: '#526174',
    marginBottom: 16,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  statusPillSelected: {
    backgroundColor: '#EEF1FF',
    borderColor: '#C9D1FF',
  },
  statusPillLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: '#1718C7',
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
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 14,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F6F8FC',
    borderWidth: 1,
    borderColor: '#E8EDF5',
  },
  statusChipActive: {
    backgroundColor: '#EEF1FF',
    borderColor: '#C9D1FF',
  },
  statusChipText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#70839B',
  },
  statusChipTextActive: {
    color: '#1718C7',
  },
});

export default AdminRecommendations;
