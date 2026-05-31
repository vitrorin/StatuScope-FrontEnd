import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
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
  RecommendationStatus,
  RecommendationTab,
} from '@/components/views/admin/recommendations/Sub-funcionalidades/types';
import { initialsFromName } from '@/lib/format';
import {
  AdminRecommendationStatus,
  createAdminRecommendationNotification,
  createAdminRecommendationTask,
  createAdminSupplyRequest,
  getAdminRecommendationDetail,
  listAdminRecommendations,
  OperationalRecommendationResponse,
  refreshAdminRecommendations,
  updateAdminRecommendationStatus,
} from '@/lib/adminOperational';

const tabs: { label: string; value: RecommendationTab }[] = [
  { label: 'Active Alerts', value: 'active' },
  { label: 'High Urgency', value: 'high' },
  { label: 'In Progress', value: 'inProgress' },
  { label: 'Archive', value: 'archive' },
];

type LoadState = 'idle' | 'loading' | 'success' | 'error';

export function AdminRecommendations() {
  const router = useRouter();
  const { logout, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<RecommendationTab>('active');
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [refreshing, setRefreshing] = useState(false);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationFeedItem[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [notifyId, setNotifyId] = useState<string | null>(null);
  const [supplyId, setSupplyId] = useState<string | null>(null);
  const [dismissId, setDismissId] = useState<string | null>(null);

  const loadRecommendations = useCallback(async () => {
    setLoadState((current) => (current === 'success' ? 'success' : 'loading'));
    setError(null);
    try {
      const data = await listAdminRecommendations();
      setRecommendations(data.map(mapRecommendation));
      setLoadState('success');
    } catch (nextError) {
      setLoadState('error');
      setError(nextError instanceof Error ? nextError.message : 'Unable to load recommendations.');
    }
  }, []);

  useEffect(() => {
    void loadRecommendations();
  }, [loadRecommendations]);

  const refreshRecommendation = useCallback(async (id: string) => {
    const detail = await getAdminRecommendationDetail(id);
    const mapped = mapRecommendation(detail);
    setRecommendations((current) => current.map((item) => (item.id === id ? mapped : item)));
    return mapped;
  }, []);

  const handleStatusChange = useCallback(async (id: string, status: RecommendationStatus) => {
    setActionBusyId(id);
    setError(null);
    try {
      await updateAdminRecommendationStatus(id, toApiStatus(status));
      await refreshRecommendation(id);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to update the recommendation status.');
    } finally {
      setActionBusyId(null);
    }
  }, [refreshRecommendation]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      await refreshAdminRecommendations();
      await loadRecommendations();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to refresh recommendations.');
    } finally {
      setRefreshing(false);
    }
  }, [loadRecommendations]);

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

  const tabBadges = useMemo(() => ({
    active: recommendations.filter((item) => !isArchived(item.status)).length,
    high: recommendations.filter((item) => item.severity === 'high' && !isArchived(item.status)).length,
    inProgress: recommendations.filter((item) => item.status === 'accepted' || item.status === 'assigned').length,
    archive: recommendations.filter((item) => isArchived(item.status)).length,
  }), [recommendations]);

  return (
    <DashboardLayout
      active="recommendations"
      sectionLabel="Recommendations"
      searchPlaceholder="Search models, alerts..."
      userName={profile?.fullName ?? 'Hospital Admin'}
      userId={profile?.email ?? undefined}
      avatarText={initialsFromName(profile?.fullName)}
      links={adminNavigationLinks}
      sidebarItems={adminSidebarItems}
      onLogout={async () => { await logout(); router.replace('/login'); }}
    >
      <>
        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <View style={styles.heroStrip}>
              <View style={styles.heroCopy}>
                <Text style={styles.heroEyebrow}>Intelligence Core</Text>
                <Text style={styles.heroTitle}>AI Operational Recommendations</Text>
                <Text style={styles.heroDescription}>
                  Real-time guidance grounded in live epidemiological activity and current hospital resource capacity.
                </Text>
              </View>

              <Button
                label={refreshing ? 'Refreshing...' : 'Refresh Models'}
                variant="secondary"
                size="md"
                leadingIcon={
                  refreshing
                    ? <ActivityIndicator size="small" color="#475569" />
                    : <Feather name="refresh-cw" size={14} color="#475569" />
                }
                style={styles.refreshButton}
                onPress={() => void handleRefresh()}
              />
            </View>

            {error ? (
              <CardBase style={styles.errorCard}>
                <Text style={styles.errorTitle}>Action needed</Text>
                <Text style={styles.errorText}>{error}</Text>
              </CardBase>
            ) : null}

            <View style={styles.summaryRow}>
              <SummaryTile label="Active Queue" value={String(tabBadges.active)} />
              <SummaryTile label="In Progress" value={String(tabBadges.inProgress)} />
              <SummaryTile label="Completed" value={String(recommendations.filter((item) => item.status === 'completed').length)} />
              <SummaryTile label="Rejected" value={String(recommendations.filter((item) => item.status === 'rejected').length)} />
            </View>

            <View style={styles.tabsRow}>
              {tabs.map((tab) => {
                const isActive = tab.value === activeTab;
                const badgeValue = tabBadges[tab.value];
                return (
                  <TouchableOpacity
                    key={tab.value}
                    style={[styles.tabItem, isActive && styles.tabItemActive]}
                    onPress={() => setActiveTab(tab.value)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
                    <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                      <Text style={[styles.tabBadgeText, !isActive && styles.tabBadgeTextInactive]}>{badgeValue}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {loadState === 'loading' && recommendations.length === 0 ? (
              <CardBase style={styles.loadingCard}>
                <ActivityIndicator color="#1718C7" />
                <Text style={styles.loadingText}>Loading recommendation feed...</Text>
              </CardBase>
            ) : visibleRecommendations.length > 0 ? (
              <View style={styles.feed}>
                {visibleRecommendations.map((item) => (
                  <AdminRecommendationCard
                    key={item.id}
                    item={item}
                    isBusy={actionBusyId === item.id}
                    onOpenDetail={async () => {
                      setDetailId(item.id);
                      try {
                        await refreshRecommendation(item.id);
                      } catch {
                        return;
                      }
                    }}
                    onStatusChange={(status) => void handleStatusChange(item.id, status)}
                    onAction={(actionLabel) => {
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
                <Text style={styles.emptyTitle}>No recommendations found</Text>
                <Text style={styles.emptySubtitle}>The current filter does not have any recommendation records yet.</Text>
              </CardBase>
            )}
          </View>
        </ScrollView>

        <RecommendationDetailOverlay visible={detailRecommendation !== null} item={detailRecommendation} onClose={() => setDetailId(null)} />
        <RecommendationTaskOverlay
          visible={taskRecommendation !== null}
          item={taskRecommendation}
          onClose={() => setTaskId(null)}
          onSave={async (payload) => {
            if (!taskRecommendation) return;
            setActionBusyId(taskRecommendation.id);
            setError(null);
            try {
              await createAdminRecommendationTask(taskRecommendation.id, {
                ownerLabel: payload.owner,
                departmentLabel: payload.area,
                deadlineAt: toIsoDeadline(payload.deadline),
                priority: payload.priority.toUpperCase(),
                notes: payload.notes,
              });
              await refreshRecommendation(taskRecommendation.id);
              setTaskId(null);
            } catch (nextError) {
              setError(nextError instanceof Error ? nextError.message : 'Unable to create the task.');
            } finally {
              setActionBusyId(null);
            }
          }}
        />
        <RecommendationNotifyOverlay
          visible={notifyRecommendation !== null}
          item={notifyRecommendation}
          onClose={() => setNotifyId(null)}
          onSend={async (payload) => {
            if (!notifyRecommendation) return;
            setActionBusyId(notifyRecommendation.id);
            setError(null);
            try {
              await createAdminRecommendationNotification(notifyRecommendation.id, {
                audienceLabel: payload.audience,
                message: payload.message,
              });
              await refreshRecommendation(notifyRecommendation.id);
              setNotifyId(null);
            } catch (nextError) {
              setError(nextError instanceof Error ? nextError.message : 'Unable to send the notification.');
            } finally {
              setActionBusyId(null);
            }
          }}
        />
        <RecommendationSupplyOverlay
          visible={supplyRecommendation !== null}
          item={supplyRecommendation}
          onClose={() => setSupplyId(null)}
          onSubmit={async (payload) => {
            if (!supplyRecommendation) return;
            setActionBusyId(supplyRecommendation.id);
            setError(null);
            try {
              await createAdminSupplyRequest(supplyRecommendation.id, {
                supplyTypeLabel: payload.supplyType,
                quantity: Number.parseInt(payload.quantity || '0', 10) || 0,
                unit: 'units',
                destination: payload.destination,
                suggestedSupplier: payload.supplier,
              });
              await refreshRecommendation(supplyRecommendation.id);
              setSupplyId(null);
            } catch (nextError) {
              setError(nextError instanceof Error ? nextError.message : 'Unable to create the supply request.');
            } finally {
              setActionBusyId(null);
            }
          }}
        />
        <RecommendationDismissOverlay
          visible={dismissRecommendation !== null}
          item={dismissRecommendation}
          onClose={() => setDismissId(null)}
          onConfirm={async () => {
            if (!dismissRecommendation) return;
            await handleStatusChange(dismissRecommendation.id, 'rejected');
            setDismissId(null);
          }}
        />
      </>
    </DashboardLayout>
  );
}

function AdminRecommendationCard({
  item,
  isBusy,
  onOpenDetail,
  onAction,
  onStatusChange,
}: {
  item: RecommendationFeedItem;
  isBusy: boolean;
  onOpenDetail: () => void;
  onAction: (actionLabel: string) => void;
  onStatusChange: (status: RecommendationStatus) => void;
}) {
  return (
    <CardBase style={[styles.recommendationCard, item.severity === 'high' && styles.recommendationCardHigh]}>
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

          <View style={styles.headerIndicators}>
            <SeverityBadge label={item.severity.toUpperCase()} severity={item.severity} />
            <View style={styles.statusPill}>
              <Text style={styles.statusPillLabel}>{formatStatusLabel(item.status)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.recommendationDescription}>{item.description}</Text>
        <Text style={styles.insightLine}>
          Confidence {item.confidenceScore}% | Impact: {item.expectedImpact} | Window: {item.urgencyWindow}
        </Text>
        <Text style={styles.contextLine}>{formatRecommendationSource(item.createdByMode)}</Text>

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
          {(['accepted', 'assigned', 'completed', 'rejected'] as RecommendationStatus[]).map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.statusChip, item.status === status && styles.statusChipActive, isBusy && styles.statusChipDisabled]}
              onPress={() => onStatusChange(status)}
              activeOpacity={0.75}
              disabled={isBusy}
            >
              <Text style={[styles.statusChipText, item.status === status && styles.statusChipTextActive]}>
                {formatStatusLabel(status)}
              </Text>
            </TouchableOpacity>
          ))}
          {isBusy ? <ActivityIndicator size="small" color="#1718C7" style={styles.statusSpinner} /> : null}
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

function mapRecommendation(item: OperationalRecommendationResponse): RecommendationFeedItem {
  const severity = mapSeverity(item.severity);
  const status = mapStatus(item.status);
  return {
    id: item.id,
    severity,
    category: item.category || item.type.replace(/_/g, ' '),
    title: item.title,
    description: item.description,
    createdByMode: item.createdByMode,
    metaItems: [
      { label: formatRelativeDate(item.createdAt), icon: <Feather name="clock" size={13} color="#7C8CA4" /> },
      { label: item.type.replace(/_/g, ' '), icon: <Feather name="briefcase" size={13} color="#7C8CA4" /> },
    ],
    accentColor: severity === 'high' ? '#F7C9CC' : severity === 'medium' ? '#F2E5C1' : '#E3E8F0',
    actions: buildActions(item.type, status),
    confidenceScore: Math.round(Number(item.confidenceScore ?? 0)),
    expectedImpact: item.expectedImpact,
    urgencyWindow: item.urgencyWindow,
    affectedDepartments: item.affectedDepartments ?? [],
    affectedResources: item.affectedResources ?? [],
    rationale: item.rationale ?? [],
    recommendedActions: item.recommendedActions ?? [],
    status,
    assignee: item.tasks?.[0]?.ownerLabel ?? undefined,
    auditTrail: (item.auditTrail ?? []).map((audit) => ({
      timestamp: formatDateTime(audit.createdAt),
      label: audit.eventLabel,
    })),
  };
}

function buildActions(type: string, status: RecommendationStatus): RecommendationFeedItem['actions'] {
  const actions: RecommendationFeedItem['actions'] = [];
  if (!isArchived(status)) {
    actions.push({ label: 'Assign task', variant: 'primary' });
    actions.push({ label: 'Notify staff', variant: 'secondary' });
    if (type === 'SUPPLY' || type === 'BED_CAPACITY' || type === 'ISOLATION') {
      actions.push({ label: 'Order supplies', variant: 'secondary' });
    }
    actions.push({ label: 'Dismiss', variant: 'secondary' });
  }
  return actions;
}

function mapSeverity(value: string): RecommendationFeedItem['severity'] {
  if (value === 'HIGH') return 'high';
  if (value === 'MEDIUM') return 'medium';
  return 'low';
}

function mapStatus(value: string): RecommendationStatus {
  if (value === 'ACCEPTED') return 'accepted';
  if (value === 'ASSIGNED') return 'assigned';
  if (value === 'COMPLETED') return 'completed';
  if (value === 'REJECTED') return 'rejected';
  return 'new';
}

function toApiStatus(status: RecommendationStatus): AdminRecommendationStatus {
  if (status === 'accepted') return 'ACCEPTED';
  if (status === 'assigned') return 'ASSIGNED';
  if (status === 'completed') return 'COMPLETED';
  if (status === 'rejected') return 'REJECTED';
  return 'NEW';
}

function formatRelativeDate(value: string) {
  const timestamp = new Date(value).getTime();
  const diffMinutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toIsoDeadline(value: string) {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
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

function formatRecommendationSource(createdByMode?: string) {
  if (createdByMode === 'LLM_ASSISTED') {
    return 'Grounded in live outbreaks and hospital resource signals.';
  }
  if (createdByMode === 'RULE_ENGINE') {
    return 'Generated from live hospital and outbreak rules.';
  }
  return 'Generated from current operational context.';
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 32,
  },
  container: {
    padding: 26,
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
  refreshButton: {
    minHeight: 40,
    paddingHorizontal: 16,
  },
  errorCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  errorTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: '#991B1B',
  },
  errorText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: '#B91C1C',
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
  tabBadgeTextInactive: {
    color: '#1718C7',
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
    paddingHorizontal: 20,
    paddingVertical: 18,
    overflow: 'hidden',
    borderColor: '#E8EDF5',
    backgroundColor: '#FFFFFF',
  },
  recommendationCardHigh: {
    borderColor: '#F5D3D5',
  },
  recommendationBody: {
    flex: 1,
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
  headerIndicators: {
    alignItems: 'flex-end',
    gap: 10,
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
    marginBottom: 8,
  },
  contextLine: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
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
    flexWrap: 'wrap',
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
    alignItems: 'center',
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
  statusChipDisabled: {
    opacity: 0.65,
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
  statusSpinner: {
    marginLeft: 4,
  },
});

export default AdminRecommendations;
export const heroStripStylesForTesting = styles;
