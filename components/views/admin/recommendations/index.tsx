import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { adminNavigationLinks, getAdminSidebarItems } from '@/components/dashboard/adminNavigation';
import { Button } from '@/components/foundation/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { SkeletonLine } from '@/components/feedback/SkeletonLine';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CardBase } from '@/components/patterns/CardBase';
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
  getAdminResourceDepartments,
  getAdminRecommendationDetail,
  HospitalDepartmentResourceResponse,
  listOperationalContacts,
  listAdminRecommendations,
  OperationalContactResponse,
  OperationalRecommendationResponse,
  OperationalRecommendationTranslation,
  refreshAdminRecommendations,
  updateAdminRecommendationStatus,
} from '@/lib/adminOperational';
import { useTranslation } from '@/i18n';
import { AppColors, withAlpha } from '@/constants/theme';
import {
  formatRelativeDate,
  getHospitalAdminLabel,
  getRecommendationStatusLabel,
  isSpanish,
} from '@/components/views/admin/localization';

type AdminRecommendationsTranslator = (key: string, params?: Record<string, string | number | null | undefined>) => string;

const tabs: RecommendationTab[] = ['active', 'high', 'assigned', 'unassigned', 'archive'];

type LoadState = 'idle' | 'loading' | 'success' | 'error';

export function AdminRecommendations() {
  const router = useRouter();
  const params = useLocalSearchParams<{ focus?: string }>();
  const { logout, profile } = useAuth();
  const { language, t } = useTranslation();
  const scrollRef = useRef<ScrollView | null>(null);
  const itemOffsetsRef = useRef<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<RecommendationTab>('active');
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [refreshing, setRefreshing] = useState(false);
  const [, setActionBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'warning' | 'error' } | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationFeedItem[]>([]);
  const [operationalContacts, setOperationalContacts] = useState<OperationalContactResponse[]>([]);
  const [departments, setDepartments] = useState<HospitalDepartmentResourceResponse[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [notifyId, setNotifyId] = useState<string | null>(null);
  const [supplyId, setSupplyId] = useState<string | null>(null);
  const [dismissId, setDismissId] = useState<string | null>(null);

  const loadRecommendations = useCallback(async () => {
    setLoadState((current) => (current === 'success' ? 'success' : 'loading'));
    setError(null);
    setToast(null);
    try {
      const data = await listAdminRecommendations();
      setRecommendations(data.map((item) => mapRecommendation(item, language, t)));
      setLoadState('success');
    } catch (nextError) {
      setLoadState('error');
      setError(nextError instanceof Error ? nextError.message : isSpanish(language) ? 'No se pudieron cargar las recomendaciones.' : 'Unable to load recommendations.');
    }
  }, [language, t]);

  const loadOperationalContacts = useCallback(async () => {
    try {
      const data = await listOperationalContacts();
      setOperationalContacts(data.filter((contact) => contact.availabilityStatus !== 'INACTIVE'));
    } catch {
      setOperationalContacts([]);
    }
  }, []);

  const loadDepartments = useCallback(async () => {
    try {
      const response = await getAdminResourceDepartments();
      setDepartments(response.data ?? []);
    } catch {
      setDepartments([]);
    }
  }, []);

  useEffect(() => {
    void loadRecommendations();
    void loadOperationalContacts();
    void loadDepartments();
  }, [loadDepartments, loadOperationalContacts, loadRecommendations]);

  const showToast = useCallback((message: string, tone: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ message, tone });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 4200);
  }, []);

  const refreshRecommendation = useCallback(async (id: string) => {
    const detail = await getAdminRecommendationDetail(id);
    const mapped = mapRecommendation(detail, language, t);
    setRecommendations((current) => current.map((item) => (item.id === id ? mapped : item)));
    return { detail, mapped };
  }, [language, t]);

  const handleStatusChange = useCallback(async (id: string, status: RecommendationStatus) => {
    setActionBusyId(id);
    setError(null);
    setToast(null);
    try {
      await updateAdminRecommendationStatus(id, toApiStatus(status));
      await refreshRecommendation(id);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : isSpanish(language) ? 'No se pudo actualizar el estado de la recomendacion.' : 'Unable to update the recommendation status.');
    } finally {
      setActionBusyId(null);
    }
  }, [language, refreshRecommendation]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    setToast(null);
    try {
      await refreshAdminRecommendations();
      await loadRecommendations();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : isSpanish(language) ? 'No se pudieron actualizar las recomendaciones.' : 'Unable to refresh recommendations.');
    } finally {
      setRefreshing(false);
    }
  }, [language, loadRecommendations]);

  const detailRecommendation = recommendations.find((item) => item.id === detailId) ?? null;
  const taskRecommendation = recommendations.find((item) => item.id === taskId) ?? null;
  const notifyRecommendation = recommendations.find((item) => item.id === notifyId) ?? null;
  const supplyRecommendation = recommendations.find((item) => item.id === supplyId) ?? null;
  const dismissRecommendation = recommendations.find((item) => item.id === dismissId) ?? null;
  const assignableContacts = useMemo(() => operationalContacts.filter((contact) => contact.assignable), [operationalContacts]);
  const notifiableContacts = useMemo(() => operationalContacts.filter((contact) => contact.notifiable), [operationalContacts]);
  const focusedRecommendationId = typeof params.focus === 'string' ? params.focus : undefined;
  const sidebarItems = useMemo(() => getAdminSidebarItems(language), [language]);
  const archivedKeys = useMemo(
    () => new Set(recommendations.filter((item) => isArchived(item.status)).map(recommendationDisplayKey)),
    [recommendations],
  );
  const nonArchivedRecommendations = useMemo(
    () => recommendations.filter((item) => !isArchived(item.status) && !archivedKeys.has(recommendationDisplayKey(item))),
    [archivedKeys, recommendations],
  );

  const visibleRecommendations = useMemo(() => {
    if (activeTab === 'high') {
      return nonArchivedRecommendations.filter((item) => isHighUrgency(item));
    }
    if (activeTab === 'assigned') {
      return nonArchivedRecommendations.filter((item) => item.status === 'accepted' || item.status === 'assigned');
    }
    if (activeTab === 'unassigned') {
      return nonArchivedRecommendations.filter((item) => item.status === 'new');
    }
    if (activeTab === 'archive') {
      return recommendations.filter((item) => isArchived(item.status));
    }
    return nonArchivedRecommendations;
  }, [activeTab, nonArchivedRecommendations, recommendations]);

  const tabBadges = useMemo(() => ({
    active: nonArchivedRecommendations.length,
    high: nonArchivedRecommendations.filter((item) => isHighUrgency(item)).length,
    assigned: nonArchivedRecommendations.filter((item) => item.status === 'accepted' || item.status === 'assigned').length,
    unassigned: nonArchivedRecommendations.filter((item) => item.status === 'new').length,
    archive: recommendations.filter((item) => isArchived(item.status)).length,
  }), [nonArchivedRecommendations, recommendations]);

  useEffect(() => {
    if (!focusedRecommendationId || recommendations.length === 0) return;
    const target = recommendations.find((item) => item.id === focusedRecommendationId);
    if (!target) return;
    if (isArchived(target.status)) {
      setActiveTab('archive');
    } else if (target.status === 'accepted' || target.status === 'assigned') {
      setActiveTab('assigned');
    } else if (target.status === 'new') {
      setActiveTab('unassigned');
    } else {
      setActiveTab('active');
    }
  }, [focusedRecommendationId, recommendations]);

  useEffect(() => {
    if (!focusedRecommendationId || visibleRecommendations.length === 0) return;
    const targetVisible = visibleRecommendations.some((item) => item.id === focusedRecommendationId);
    if (!targetVisible) return;
    const timeout = setTimeout(() => {
      const y = itemOffsetsRef.current[focusedRecommendationId] ?? 0;
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 180), animated: true });
    }, 180);
    return () => clearTimeout(timeout);
  }, [focusedRecommendationId, visibleRecommendations]);

  return (
    <DashboardLayout
      active="recommendations"
      sectionLabel={isSpanish(language) ? 'Recomendaciones' : 'Recommendations'}
      userName={profile?.fullName ?? getHospitalAdminLabel(language)}
      userId={profile?.email ?? undefined}
      avatarText={initialsFromName(profile?.fullName)}
      links={adminNavigationLinks}
      sidebarItems={sidebarItems}
      onLogout={async () => { await logout(); router.replace('/login'); }}
    >
      <>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <View style={styles.heroStrip}>
              <View style={styles.heroCopy}>
                <Text style={styles.heroEyebrow}>{isSpanish(language) ? 'Nucleo de inteligencia' : 'Intelligence Core'}</Text>
                <Text style={styles.heroTitle}>{isSpanish(language) ? 'Recomendaciones operativas de IA' : 'AI Operational Recommendations'}</Text>
                <Text style={styles.heroDescription}>
                  {isSpanish(language)
                    ? 'Orientacion en tiempo real basada en la actividad epidemiologica en vivo y la capacidad actual de recursos hospitalarios.'
                    : 'Real-time guidance grounded in live epidemiological activity and current hospital resource capacity.'}
                </Text>
              </View>

              <Button
                label={refreshing ? (isSpanish(language) ? 'Actualizando...' : 'Refreshing...') : (isSpanish(language) ? 'Actualizar modelos' : 'Refresh Models')}
                variant="secondary"
                size="md"
                leadingIcon={
                  refreshing
                    ? <ActivityIndicator size="small" color={AppColors.text.body} />
                    : <Feather name="refresh-cw" size={14} color={AppColors.text.body} />
                }
                style={styles.refreshButton}
                onPress={() => void handleRefresh()}
              />
            </View>

            {error ? (
              <CardBase style={styles.errorCard}>
                <Text style={styles.errorTitle}>{isSpanish(language) ? 'Accion requerida' : 'Action needed'}</Text>
                <Text style={styles.errorText}>{error}</Text>
              </CardBase>
            ) : null}

            <View style={styles.summaryRow}>
              <SummaryTile label={isSpanish(language) ? 'Cola activa' : 'Active Queue'} value={String(tabBadges.active)} />
              <SummaryTile label={isSpanish(language) ? 'Asignado' : 'Assigned'} value={String(tabBadges.assigned)} />
              <SummaryTile label={isSpanish(language) ? 'Completadas' : 'Completed'} value={String(recommendations.filter((item) => item.status === 'completed').length)} />
              <SummaryTile label={isSpanish(language) ? 'Descartadas' : 'Rejected'} value={String(recommendations.filter((item) => item.status === 'rejected').length)} />
            </View>

            <View style={styles.tabsRow}>
              {tabs.map((tab) => {
                const isActive = tab === activeTab;
                const badgeValue = tabBadges[tab];
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.tabItem, isActive && styles.tabItemActive]}
                    onPress={() => setActiveTab(tab)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{localizeTabLabel(tab, t)}</Text>
                    <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                      <Text style={[styles.tabBadgeText, !isActive && styles.tabBadgeTextInactive]}>{badgeValue}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {loadState === 'loading' && recommendations.length === 0 ? (
              <RecommendationsSkeleton />
            ) : visibleRecommendations.length > 0 ? (
              <View style={styles.feed}>
                {visibleRecommendations.map((item) => (
                  <View
                    key={item.id}
                    onLayout={(event) => {
                      itemOffsetsRef.current[item.id] = event.nativeEvent.layout.y;
                    }}
                    style={item.id === focusedRecommendationId ? styles.focusedRecommendationShell : null}
                  >
                    <AdminRecommendationCard
                      item={item}
                      language={language}
                      translator={t}
                      onOpenDetail={async () => {
                        setDetailId(item.id);
                        try {
                          await refreshRecommendation(item.id);
                        } catch {
                          return;
                        }
                      }}
                      onAction={(actionLabel) => {
                        const actionLabels = adminRecommendationActionLabels(t);
                        if (actionLabel === actionLabels.assignTask || actionLabel === actionLabels.reassignTask) setTaskId(item.id);
                        if (actionLabel === actionLabels.notifyStaff) setNotifyId(item.id);
                        if (actionLabel === actionLabels.orderSupplies) setSupplyId(item.id);
                        if (actionLabel === actionLabels.complete) void handleStatusChange(item.id, 'completed');
                        if (actionLabel === actionLabels.dismiss) setDismissId(item.id);
                      }}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <EmptyState
                style={styles.emptyCard}
                icon={(
                  <View style={styles.emptyIconWrap}>
                    <MaterialCommunityIcons name="progress-clock" size={22} color={AppColors.brand.action} />
                  </View>
                )}
                title={isSpanish(language) ? 'No se encontraron recomendaciones' : 'No recommendations found'}
                message={isSpanish(language) ? 'El filtro actual todavia no tiene registros de recomendaciones.' : 'The current filter does not have any recommendation records yet.'}
              />
            )}
          </View>
        </ScrollView>

        {toast ? (
          <View style={[styles.toast, toast.tone === 'warning' && styles.toastWarning, toast.tone === 'error' && styles.toastError]}>
            <Feather
              name={toast.tone === 'success' ? 'check-circle' : toast.tone === 'warning' ? 'alert-triangle' : 'x-circle'}
              size={16}
              color={toast.tone === 'success' ? AppColors.status.success : toast.tone === 'warning' ? AppColors.clinicalSeverity.high.accent : AppColors.status.danger}
            />
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        ) : null}

        <RecommendationDetailOverlay visible={detailRecommendation !== null} item={detailRecommendation} onClose={() => setDetailId(null)} />
        <RecommendationTaskOverlay
          visible={taskRecommendation !== null}
          item={taskRecommendation}
          contacts={assignableContacts}
          onClose={() => setTaskId(null)}
          onSave={async (payload) => {
            if (!taskRecommendation) return;
            setActionBusyId(taskRecommendation.id);
            setError(null);
            setToast(null);
            try {
              await createAdminRecommendationTask(taskRecommendation.id, {
                ownerContactId: payload.ownerContactId,
                ownerLabel: payload.owner,
                departmentLabel: payload.area,
                deadlineAt: toIsoDeadline(payload.deadline),
                notes: payload.notes,
                language,
              });
              const { detail } = await refreshRecommendation(taskRecommendation.id);
              showToast(deliveryNotice(detail, language, 'task'), deliveryToastTone(detail));
              setTaskId(null);
            } catch (nextError) {
              setError(nextError instanceof Error ? nextError.message : isSpanish(language) ? 'No se pudo crear la tarea.' : 'Unable to create the task.');
            } finally {
              setActionBusyId(null);
            }
          }}
        />
        <RecommendationNotifyOverlay
          visible={notifyRecommendation !== null}
          item={notifyRecommendation}
          contacts={notifiableContacts}
          departments={departments}
          onClose={() => setNotifyId(null)}
          onSend={async (payload) => {
            if (!notifyRecommendation) return;
            setActionBusyId(notifyRecommendation.id);
            setError(null);
            setToast(null);
            try {
              await createAdminRecommendationNotification(notifyRecommendation.id, {
                audienceType: payload.audienceType,
                audienceContactId: payload.audienceContactId,
                audienceDepartmentCode: payload.audienceDepartmentCode,
                audienceLabel: payload.audience,
                message: payload.message,
                language,
              });
              const { detail } = await refreshRecommendation(notifyRecommendation.id);
              showToast(deliveryNotice(detail, language, 'notification'), deliveryToastTone(detail));
              setNotifyId(null);
            } catch (nextError) {
              setError(nextError instanceof Error ? nextError.message : isSpanish(language) ? 'No se pudo enviar la notificacion.' : 'Unable to send the notification.');
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
              setError(nextError instanceof Error ? nextError.message : isSpanish(language) ? 'No se pudo crear la solicitud de insumos.' : 'Unable to create the supply request.');
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

function RecommendationsSkeleton() {
  return (
    <View style={styles.feed}>
      {[0, 1, 2].map((item) => (
        <CardBase key={item} style={styles.recommendationSkeletonCard}>
          <View style={styles.recommendationSkeletonHeader}>
            <View style={styles.skeletonCategoryRow}>
              <View style={styles.skeletonIcon} />
              <SkeletonLine width={96} height={14} />
            </View>
            <View style={styles.skeletonPill} />
          </View>
          <SkeletonLine width={item === 1 ? '48%' : '62%'} height={20} />
          <View style={styles.skeletonParagraph}>
            <SkeletonLine width="92%" />
            <SkeletonLine width="74%" />
          </View>
          <View style={styles.skeletonSignalGrid}>
            <View style={styles.skeletonSignalCard} />
            <View style={styles.skeletonSignalCard} />
            <View style={styles.skeletonSignalCard} />
          </View>
          <View style={styles.skeletonFooterRow}>
            <SkeletonLine width={118} />
            <View style={styles.skeletonButtonRow}>
              <View style={styles.skeletonButton} />
              <View style={styles.skeletonButton} />
              <View style={styles.skeletonButton} />
            </View>
          </View>
        </CardBase>
      ))}
    </View>
  );
}

function AdminRecommendationCard({
  item,
  language,
  translator,
  onOpenDetail,
  onAction,
}: {
  item: RecommendationFeedItem;
  language: 'en' | 'es';
  translator: AdminRecommendationsTranslator;
  onOpenDetail: () => void;
  onAction: (actionLabel: string) => void;
}) {
  const tone = recommendationCategoryTone(item.type);
  const priorityTone = recommendationPriorityTone(item.backendSeverity);
  const archiveTone = archivedStatusTone(item.status);
  const statusTone = recommendationStatusTone(item.status);
  const displayTone = archiveTone ?? tone;
  const displayPriorityTone = archiveTone ?? priorityTone;
  const createdMeta = item.metaItems[0];
  const actionIconByLabel = (label: string): React.ComponentProps<typeof Feather>['name'] => {
    const normalized = label.toLowerCase();
    if (normalized.includes('tarea') || normalized.includes('task')) return 'check-square';
    if (normalized.includes('notificar') || normalized.includes('notify')) return 'send';
    if (normalized.includes('insumo') || normalized.includes('suppl')) return 'package';
    if (normalized.includes('descartar') || normalized.includes('dismiss')) return 'x-circle';
    return 'arrow-right';
  };

  return (
    <CardBase style={[
      styles.recommendationCard,
      { borderColor: archiveTone?.border ?? tone.border },
      archiveTone ? { backgroundColor: archiveTone.soft } : null,
    ]}>
      <View style={[styles.recommendationAccent, { backgroundColor: displayTone.accent }]} />
      <TouchableOpacity style={styles.recommendationBody} activeOpacity={0.92} onPress={onOpenDetail}>
        <View style={styles.topRow}>
          <View style={styles.categoryWrap}>
            <View style={styles.categoryRow}>
              <View style={[styles.categoryIcon, { backgroundColor: displayTone.soft }]}>
                <Feather name={tone.icon} size={15} color={displayTone.accent} />
              </View>
              <Text style={[styles.category, { color: displayTone.accent }]}>{item.category.toUpperCase()}</Text>
            </View>
            <Text style={styles.recommendationTitle}>{item.title}</Text>
          </View>

          <View style={styles.headerIndicators}>
            <View style={[styles.statusPill, { borderColor: statusTone.border, backgroundColor: statusTone.soft }]}>
              <Text style={[styles.statusPillLabel, { color: statusTone.accent }]}>{getRecommendationStatusLabel(item.status, language)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.recommendationDescription}>{item.description}</Text>

        <View style={styles.signalGrid}>
          <View style={[styles.signalCard, styles.prioritySignalCard, archiveTone ? styles.archivedSignalCard : { backgroundColor: displayPriorityTone.soft, borderColor: displayPriorityTone.border }]}>
            <Text style={styles.signalLabel}>{language === 'es' ? 'Prioridad calculada' : 'Calculated priority'}</Text>
            <Text style={[styles.signalValue, { color: displayPriorityTone.accent }]}>{getSeverityLabel(item.backendSeverity, translator)}</Text>
          </View>
          <View style={[styles.signalCard, archiveTone && styles.archivedSignalCard]}>
            <Text style={styles.signalLabel}>{language === 'es' ? 'Ventana' : 'Window'}</Text>
            <Text style={styles.signalValue}>{item.urgencyWindow}</Text>
          </View>
          <View style={[styles.signalCard, styles.signalCardWide, archiveTone && styles.archivedSignalCard]}>
            <Text style={styles.signalLabel}>{language === 'es' ? 'Impacto esperado' : 'Expected impact'}</Text>
            <Text style={styles.signalValue} numberOfLines={2}>{item.expectedImpact}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.contextSource}>
            {createdMeta?.icon ?? <Feather name="clock" size={14} color={AppColors.text.secondary} />}
            <Text style={styles.contextLine}>{createdMeta?.label}</Text>
          </View>
          <View style={styles.cardActions}>
            {item.actions.map((action) => (
              <Button
                key={action.label}
                label={action.label}
                variant={action.variant}
                size="sm"
                leadingIcon={<Feather name={actionIconByLabel(action.label)} size={14} color={action.variant === 'primary' ? AppColors.surface.card : AppColors.text.body} />}
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

function recommendationCategoryTone(type: string) {
  const normalized = type.toUpperCase();
  if (normalized === 'BED_CAPACITY') {
    return {
      accent: AppColors.resourceStatus.info.accent,
      soft: AppColors.resourceStatus.info.background,
      border: AppColors.recommendationCategory.medical.border,
      icon: 'activity' as const,
    };
  }
  if (normalized === 'STAFFING') {
    return {
      accent: AppColors.recommendationCategory.logistics.accent,
      soft: AppColors.recommendationCategory.logistics.soft,
      border: AppColors.recommendationCategory.logistics.border,
      icon: 'users' as const,
    };
  }
  if (normalized === 'SUPPLY') {
    return {
      accent: AppColors.recommendationCategory.staffing.accent,
      soft: AppColors.recommendationCategory.staffing.soft,
      border: AppColors.recommendationCategory.staffing.border,
      icon: 'package' as const,
    };
  }
  if (normalized === 'LOCAL_EPIDEMIOLOGY' || normalized.startsWith('EPIDEMIOLOGY')) {
    return {
      accent: AppColors.clinicalSeverity.critical.text,
      soft: AppColors.status.dangerPanel,
      border: AppColors.recommendationCategory.critical.border,
      icon: 'map-pin' as const,
    };
  }
  return {
    accent: AppColors.text.body,
    soft: AppColors.surface.subtle,
    border: withAlpha(AppColors.text.body, 0.22),
    icon: 'briefcase' as const,
  };
}

function recommendationPriorityTone(severity: string) {
  const normalized = severity.toUpperCase();
  if (normalized === 'CRITICAL') {
    return { accent: AppColors.status.danger, soft: AppColors.status.dangerSoft, border: AppColors.status.dangerBorder };
  }
  if (normalized === 'HIGH') {
    return { accent: AppColors.clinicalSeverity.high.accent, soft: AppColors.status.warningPanel, border: AppColors.clinicalSeverity.high.border };
  }
  if (normalized === 'MEDIUM' || normalized === 'MODERATE') {
    return { accent: AppColors.status.info, soft: AppColors.status.infoSoft, border: AppColors.status.infoSoft };
  }
  return { accent: AppColors.status.success, soft: AppColors.status.successWash, border: AppColors.status.successBorder };
}

function archivedStatusTone(status: RecommendationStatus) {
  if (status === 'completed') {
    return { accent: AppColors.status.success, soft: AppColors.status.successWash, border: AppColors.status.successBorder };
  }
  if (status === 'rejected') {
    return { accent: AppColors.status.danger, soft: AppColors.status.dangerSoft, border: AppColors.status.dangerBorder };
  }
  return null;
}

function recommendationStatusTone(status: RecommendationStatus) {
  if (status === 'new') return { accent: AppColors.brand.action, soft: AppColors.surface.brandSoft, border: AppColors.border.brandSubtle };
  if (status === 'assigned' || status === 'accepted' || status === 'completed') {
    return { accent: AppColors.status.success, soft: AppColors.status.successWash, border: AppColors.status.successBorder };
  }
  if (status === 'rejected') return { accent: AppColors.status.danger, soft: AppColors.status.dangerSoft, border: AppColors.status.dangerBorder };
  return { accent: AppColors.text.body, soft: AppColors.surface.subtle, border: AppColors.border.default };
}

const recommendationTitleKeys: Record<string, string> = {
  'Expand Monitored Bed Capacity': 'admin.recommendations.fallbacks.titles.expandMonitoredBedCapacity',
  'Monitor Bed Occupancy Trend': 'admin.recommendations.fallbacks.titles.monitorBedOccupancyTrend',
  'Increase Emergency Physician Staffing': 'admin.recommendations.fallbacks.titles.increaseEmergencyPhysicianStaffing',
  'ICU Capacity Critical - Activate Surge Protocol': 'admin.recommendations.fallbacks.titles.activateIcuSurgeProtocol',
  'Review Local Epidemiology Response': 'admin.recommendations.fallbacks.titles.reviewLocalEpidemiologyResponse',
  'Implement Respiratory Isolation Measures': 'admin.recommendations.fallbacks.titles.implementRespiratoryIsolation',
  'Replenish Critical Protective and Respiratory Supplies': 'admin.recommendations.fallbacks.titles.replenishCriticalRespiratorySupplies',
  'Review PPE Stock Levels': 'admin.recommendations.fallbacks.titles.reviewPpeStockLevels',
};

const recommendationDescriptionKeys: Record<string, string> = {
  'Expand Monitored Bed Capacity': 'admin.recommendations.fallbacks.descriptions.expandMonitoredBedCapacity',
  'Monitor Bed Occupancy Trend': 'admin.recommendations.fallbacks.descriptions.monitorBedOccupancyTrend',
  'Increase Emergency Physician Staffing': 'admin.recommendations.fallbacks.descriptions.increaseEmergencyPhysicianStaffing',
  'ICU Capacity Critical - Activate Surge Protocol': 'admin.recommendations.fallbacks.descriptions.activateIcuSurgeProtocol',
  'Review Local Epidemiology Response': 'admin.recommendations.fallbacks.descriptions.reviewLocalEpidemiologyResponse',
  'Implement Respiratory Isolation Measures': 'admin.recommendations.fallbacks.descriptions.implementRespiratoryIsolation',
  'Replenish Critical Protective and Respiratory Supplies': 'admin.recommendations.fallbacks.descriptions.replenishCriticalRespiratorySupplies',
  'Review PPE Stock Levels': 'admin.recommendations.fallbacks.descriptions.reviewPpeStockLevels',
};

const recommendationImpactKeys: Record<string, string> = {
  'Reduce patient wait times and prevent diversion': 'admin.recommendations.fallbacks.impacts.reducePatientWaitTimes',
  'Prevent critical bed shortage': 'admin.recommendations.fallbacks.impacts.preventCriticalBedShortage',
  'Improve patient throughput during outbreak surge': 'admin.recommendations.fallbacks.impacts.improvePatientThroughput',
  'Prevent ICU overflow and ensure critical care availability': 'admin.recommendations.fallbacks.impacts.preventIcuOverflow',
  'Reduce risk of influenza transmission to staff and patients within the hospital': 'admin.recommendations.fallbacks.impacts.reduceRespiratoryTransmission',
  'Ensure uninterrupted staff protection and maintain readiness for respiratory surge': 'admin.recommendations.fallbacks.impacts.ensureStaffProtection',
  'Avoid PPE stockout during active outbreak period': 'admin.recommendations.fallbacks.impacts.avoidPpeStockout',
};

const recommendationUrgencyKeys: Record<string, string> = {
  Immediately: 'admin.recommendations.fallbacks.urgency.immediately',
  'Within 12 hours': 'admin.recommendations.fallbacks.urgency.within12Hours',
  'Within 24 hours': 'admin.recommendations.fallbacks.urgency.within24Hours',
  'Within 48 hours': 'admin.recommendations.fallbacks.urgency.within48Hours',
};

const recommendationCategoryKeys: Record<string, string> = {
  SUPPLY: 'admin.recommendations.categories.supply',
  'BED CAPACITY': 'admin.recommendations.categories.bedCapacity',
  BED_CAPACITY: 'admin.recommendations.categories.bedCapacity',
  STAFFING: 'admin.recommendations.categories.staffing',
  ISOLATION: 'admin.recommendations.categories.localEpidemiology',
  LOCAL_EPIDEMIOLOGY: 'admin.recommendations.categories.localEpidemiology',
  EPIDEMIOLOGY_HOSPITAL: 'admin.recommendations.categories.hospitalEpidemiology',
  EPIDEMIOLOGY_MUNICIPAL: 'admin.recommendations.categories.municipalEpidemiology',
};

const recommendationListKeys: Record<string, string> = {
  'General Ward': 'admin.recommendations.fallbacks.list.generalWard',
  ICU: 'admin.recommendations.fallbacks.list.icu',
  'Intensive Care Unit': 'admin.recommendations.fallbacks.list.intensiveCareUnit',
  'Emergency Department': 'admin.recommendations.fallbacks.list.emergencyDepartment',
  'Respiratory Ward': 'admin.recommendations.fallbacks.list.respiratoryWard',
  'Isolation Rooms': 'admin.recommendations.fallbacks.list.isolationRooms',
  'N95 Respirator Masks': 'admin.recommendations.fallbacks.list.n95RespiratorMasks',
  'Isolation Gowns': 'admin.recommendations.fallbacks.list.isolationGowns',
  'Central Supply': 'admin.recommendations.fallbacks.list.centralSupply',
  'Emergency Physicians': 'admin.recommendations.fallbacks.list.emergencyPhysicians',
  'Open additional monitored beds to prevent capacity overflow.': 'admin.recommendations.fallbacks.list.openMonitoredBeds',
  'Reconfirm discharge readiness for stable patients': 'admin.recommendations.fallbacks.list.reconfirmDischargeReadiness',
  'Activate ICU surge protocol': 'admin.recommendations.fallbacks.list.activateIcuSurgeProtocol',
  'Assign respiratory-capable overflow beds': 'admin.recommendations.fallbacks.list.assignRespiratoryOverflowBeds',
  'Expedite eligible ICU discharges': 'admin.recommendations.fallbacks.list.expediteIcuDischarges',
  'Replenish PPE and respiratory supplies': 'admin.recommendations.fallbacks.list.replenishPpeAndRespiratorySupplies',
  'Notify central supply coordinator': 'admin.recommendations.fallbacks.list.notifyCentralSupplyCoordinator',
  'Prepare 48-hour consumption buffer': 'admin.recommendations.fallbacks.list.prepareConsumptionBuffer',
  'Establish respiratory isolation zones': 'admin.recommendations.fallbacks.list.establishRespiratoryIsolationZones',
  'Assign dedicated staff flow for suspected respiratory cases': 'admin.recommendations.fallbacks.list.assignDedicatedStaffFlow',
  'Review PPE burn rate before next shift': 'admin.recommendations.fallbacks.list.reviewPpeBurnRate',
};

function translateLookup(
  t: AdminRecommendationsTranslator,
  keys: Record<string, string>,
  value: string,
  fallback: string,
) {
  const key = keys[value];
  if (!key) return fallback;
  const translated = t(key);
  return translated === key ? fallback : translated;
}

function adminRecommendationActionLabels(t: AdminRecommendationsTranslator) {
  return {
    assignTask: t('admin.recommendations.actions.assignTask'),
    reassignTask: t('admin.recommendations.actions.reassignTask'),
    notifyStaff: t('admin.recommendations.actions.notifyStaff'),
    orderSupplies: t('admin.recommendations.actions.orderSupplies'),
    complete: t('admin.recommendations.actions.complete'),
    dismiss: t('admin.recommendations.actions.dismiss'),
  };
}

function mapRecommendation(
  item: OperationalRecommendationResponse,
  language: 'en' | 'es',
  t: AdminRecommendationsTranslator,
): RecommendationFeedItem {
  const severity = mapSeverity(item.severity);
  const status = mapStatus(item.status);
  const content = selectRecommendationContent(item, language, t);
  const activeTask = (item.tasks ?? []).find((task) => task.status !== 'COMPLETED' && task.status !== 'CANCELLED') ?? item.tasks?.[0];
  return {
    id: item.id,
    type: item.type,
    severity,
    backendSeverity: normalizeBackendSeverity(item.severity),
    category: localizeRecommendationCategory(item.category || item.type.replace(/_/g, ' '), item.type, t),
    title: content.title,
    description: content.description,
    createdByMode: item.createdByMode,
    metaItems: [
      { label: formatLastUpdatedLabel(item.updatedAt ?? item.createdAt, language), icon: <Feather name="clock" size={13} color={AppColors.text.soft} /> },
    ],
    accentColor: severity === 'high' ? AppColors.clinicalSeverity.critical.border : severity === 'medium' ? AppColors.severityTone.mediumBorder : AppColors.severityTone.neutralBorder,
    actions: buildActions(item.type, status, t, Boolean(activeTask)),
    confidenceScore: formatCalculatedPriority(item.confidenceScore),
    expectedImpact: content.expectedImpact,
    urgencyWindow: content.urgencyWindow,
    affectedDepartments: localizeList(item.affectedDepartments ?? [], t),
    affectedResources: localizeList(item.affectedResources ?? [], t),
    rationale: content.rationale,
    recommendedActions: content.recommendedActions,
    status,
    assignee: activeTask?.ownerLabel ?? undefined,
    activeTask: activeTask ? {
      id: activeTask.id,
      ownerContactId: activeTask.ownerContactId,
      ownerLabel: activeTask.ownerLabel,
      departmentLabel: activeTask.departmentLabel,
      deadlineAt: activeTask.deadlineAt,
      notes: activeTask.notes,
      priority: activeTask.priority,
    } : undefined,
    auditTrail: (item.auditTrail ?? []).map((audit) => ({
      timestamp: formatDateTime(audit.createdAt),
      label: audit.eventLabel,
    })),
  };
}

function selectRecommendationContent(
  item: OperationalRecommendationResponse,
  language: 'en' | 'es',
  t: AdminRecommendationsTranslator,
) {
  const localized = item.translations?.[language] ?? item.translations?.en ?? null;
  return {
    title: localizedText(localized?.title, localizeRecommendationTitle(item.title, t)),
    description: localizedText(localized?.description, localizeRecommendationDescription(item, t)),
    expectedImpact: localizedText(localized?.expectedImpact, localizeExpectedImpact(item.expectedImpact, t)),
    urgencyWindow: localizedText(localized?.urgencyWindow, localizeUrgencyWindow(item.urgencyWindow, t)),
    rationale: localizedList(localized?.rationale, item.rationale ?? [], t),
    recommendedActions: localizedList(localized?.recommendedActions, item.recommendedActions ?? [], t),
  };
}

function localizedText(value: string | null | undefined, fallback: string) {
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

function localizedList(value: OperationalRecommendationTranslation['rationale'], fallback: string[], t: AdminRecommendationsTranslator) {
  const source = value && value.length > 0 ? value : fallback;
  return localizeList(source ?? [], t);
}

function formatLastUpdatedLabel(value: string, language: 'en' | 'es') {
  const relative = formatRelativeDate(value, language);
  if (language === 'es') {
    const normalized = relative.replace(/^Hace/, 'hace').replace(/^Justo ahora$/, 'justo ahora');
    return `Ultima actualizacion ${normalized}`;
  }
  return `Last update ${relative}`;
}

function formatCalculatedPriority(value: number | string | null | undefined) {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return 0;
  return Math.round(numeric <= 1 ? numeric * 100 : numeric);
}

function localizeRecommendationTitle(title: string, t: AdminRecommendationsTranslator) {
  return translateLookup(t, recommendationTitleKeys, title, title);
}

function localizeRecommendationDescription(item: OperationalRecommendationResponse, t: AdminRecommendationsTranslator) {
  return translateLookup(t, recommendationDescriptionKeys, item.title, item.description);
}

function localizeExpectedImpact(value: string, t: AdminRecommendationsTranslator) {
  return translateLookup(t, recommendationImpactKeys, value, value);
}

function localizeUrgencyWindow(value: string, t: AdminRecommendationsTranslator) {
  return translateLookup(t, recommendationUrgencyKeys, value, value);
}

function localizeRecommendationCategory(category: string, type: string, t: AdminRecommendationsTranslator) {
  return translateLookup(t, recommendationCategoryKeys, category, translateLookup(t, recommendationCategoryKeys, type, category));
}

function localizeList(values: string[], t: AdminRecommendationsTranslator) {
  return values.map((value) => translateLookup(t, recommendationListKeys, value.trim(), value));
}

function buildActions(type: string, status: RecommendationStatus, t: AdminRecommendationsTranslator, hasActiveTask: boolean): RecommendationFeedItem['actions'] {
  const actions: RecommendationFeedItem['actions'] = [];
  const actionLabels = adminRecommendationActionLabels(t);
  if (!isArchived(status)) {
    actions.push({ label: hasActiveTask ? actionLabels.reassignTask : actionLabels.assignTask, variant: 'primary' });
    actions.push({ label: actionLabels.notifyStaff, variant: 'secondary' });
    actions.push({ label: actionLabels.complete, variant: 'secondary' });
    actions.push({ label: actionLabels.dismiss, variant: 'secondary' });
  }
  return actions;
}

function mapSeverity(value: string): RecommendationFeedItem['severity'] {
  if (value === 'CRITICAL' || value === 'HIGH') return 'high';
  if (value === 'MEDIUM') return 'medium';
  return 'low';
}

function normalizeBackendSeverity(value: string) {
  const normalized = value.toUpperCase();
  if (normalized === 'CRITICAL' || normalized === 'HIGH' || normalized === 'MEDIUM' || normalized === 'LOW') {
    return normalized;
  }
  return 'LOW';
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

function getSeverityLabel(severity: string, t: AdminRecommendationsTranslator) {
  const normalized = severity.toUpperCase();
  if (normalized === 'CRITICAL') return t('admin.recommendations.severity.critical');
  if (normalized === 'HIGH') return t('admin.recommendations.severity.high');
  if (normalized === 'MEDIUM') return t('admin.recommendations.severity.medium');
  return t('admin.recommendations.severity.low');
}

function deliveryNotice(
  detail: OperationalRecommendationResponse,
  language: 'en' | 'es',
  kind: 'task' | 'notification',
) {
  const emailNotification = [...(detail.notifications ?? [])]
    .filter((notification) => notification.deliveryChannel === 'EMAIL')
    .sort((left, right) => String(right.sentAt ?? '').localeCompare(String(left.sentAt ?? '')))[0];

  if (!emailNotification) {
    return language === 'es'
      ? kind === 'task' ? 'Tarea creada. No se encontro evidencia de envio por correo.' : 'Notificacion registrada. No se encontro evidencia de envio por correo.'
      : kind === 'task' ? 'Task created. No email delivery evidence was found.' : 'Notification recorded. No email delivery evidence was found.';
  }

  const summary = emailNotification.recipientSummary;
  const summaryText = summary && summary.total > 0
    ? language === 'es'
      ? ` ${summary.sent}/${summary.total} correos enviados.`
      : ` ${summary.sent}/${summary.total} emails sent.`
    : '';

  if (emailNotification.status === 'SENT') {
    return language === 'es'
      ? kind === 'task' ? `Tarea asignada y correo enviado.${summaryText}` : `Aviso enviado por correo.${summaryText}`
      : kind === 'task' ? `Task assigned and email sent.${summaryText}` : `Notice sent by email.${summaryText}`;
  }

  if (emailNotification.status === 'PARTIAL') {
    return language === 'es'
      ? `Aviso enviado parcialmente.${summaryText}`
      : `Notice partially delivered.${summaryText}`;
  }

  const detailText = emailNotification.deliveryStatusDetail ? ` ${emailNotification.deliveryStatusDetail}` : '';
  return language === 'es'
    ? kind === 'task' ? `Tarea creada, pero el correo fallo.${detailText}` : `Notificacion registrada, pero el correo fallo.${detailText}`
    : kind === 'task' ? `Task created, but email delivery failed.${detailText}` : `Notification recorded, but email delivery failed.${detailText}`;
}

function deliveryToastTone(detail: OperationalRecommendationResponse): 'success' | 'warning' | 'error' {
  const emailNotification = [...(detail.notifications ?? [])]
    .filter((notification) => notification.deliveryChannel === 'EMAIL')
    .sort((left, right) => String(right.sentAt ?? '').localeCompare(String(left.sentAt ?? '')))[0];
  if (!emailNotification) return 'warning';
  if (emailNotification.status === 'SENT') return 'success';
  if (emailNotification.status === 'PARTIAL') return 'warning';
  return 'error';
}

function isArchived(status: RecommendationStatus) {
  return status === 'completed' || status === 'rejected';
}

function isHighUrgency(item: RecommendationFeedItem) {
  return item.backendSeverity === 'CRITICAL';
}

function recommendationDisplayKey(item: RecommendationFeedItem) {
  const normalizedTitle = item.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return `${item.type.toUpperCase()}:${normalizedTitle}`;
}

function localizeTabLabel(tab: RecommendationTab, t: AdminRecommendationsTranslator) {
  return t(`admin.recommendations.tabs.${tab}`);
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 32,
  },
  container: {
    padding: 24,
    gap: 24,
  },
  heroStrip: {
    paddingHorizontal: 24,
    paddingVertical: 22,
    borderRadius: 24,
    backgroundColor: AppColors.surface.raised,
    borderWidth: 1,
    borderColor: withAlpha(AppColors.brand.primary, 0.08),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: AppColors.shadow.blue,
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
    color: AppColors.brand.primary,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '700',
    color: AppColors.text.primary,
    marginBottom: 8,
    maxWidth: 720,
  },
  heroDescription: {
    fontSize: 15,
    lineHeight: 24,
    color: AppColors.text.body,
    maxWidth: 760,
  },
  refreshButton: {
    minHeight: 40,
    paddingHorizontal: 16,
  },
  errorCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: AppColors.status.dangerSoft,
    borderColor: AppColors.status.dangerBorder,
  },
  errorTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: AppColors.status.dangerDeep,
  },
  errorText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: AppColors.status.dangerDark,
  },
  toast: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    maxWidth: 420,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.status.successBorder,
    backgroundColor: AppColors.status.successWash,
    shadowColor: AppColors.text.primary,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  toastWarning: { borderColor: AppColors.clinicalSeverity.high.border, backgroundColor: AppColors.status.warningPanel },
  toastError: { borderColor: AppColors.status.dangerBorder, backgroundColor: AppColors.status.dangerSoft },
  toastText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '800',
    color: AppColors.text.primary,
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
    color: AppColors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
    color: AppColors.brand.action,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 24,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border.divider,
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
    borderBottomColor: AppColors.brand.action,
  },
  tabLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: AppColors.table.muted,
  },
  tabLabelActive: {
    color: AppColors.brand.action,
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 8,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.surface.brandSoft,
  },
  tabBadgeActive: {
    backgroundColor: AppColors.brand.action,
  },
  tabBadgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '800',
    color: AppColors.surface.card,
  },
  tabBadgeTextInactive: {
    color: AppColors.brand.action,
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
    color: AppColors.text.body,
  },
  feed: {
    gap: 18,
  },
  focusedRecommendationShell: {
    borderRadius: 22,
    shadowColor: AppColors.brand.action,
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  recommendationSkeletonCard: {
    padding: 18,
    borderColor: AppColors.resourceStatus.stable.track,
    gap: 14,
  },
  recommendationSkeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  skeletonCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skeletonIcon: {
    width: 18,
    height: 18,
    borderRadius: 6,
    backgroundColor: AppColors.surface.brandSoft,
  },
  skeletonPill: {
    width: 68,
    height: 26,
    borderRadius: 999,
    backgroundColor: AppColors.border.soft,
  },
  skeletonParagraph: {
    gap: 8,
  },
  skeletonSignalGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  skeletonSignalCard: {
    flex: 1,
    minWidth: 180,
    height: 74,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.border.divider,
    backgroundColor: AppColors.surface.subtle,
  },
  skeletonFooterRow: {
    borderTopWidth: 1,
    borderTopColor: AppColors.border.soft,
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  skeletonButtonRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  skeletonButton: {
    width: 116,
    height: 38,
    borderRadius: 12,
    backgroundColor: AppColors.chart.grid,
  },
  emptyCard: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.surface.card,
    borderStyle: 'dashed',
    borderColor: AppColors.border.default,
  },
  emptyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.surface.brandSoft,
    marginBottom: 14,
  },
  recommendationCard: {
    padding: 0,
    overflow: 'hidden',
    borderColor: AppColors.resourceStatus.stable.track,
    backgroundColor: AppColors.surface.card,
    borderRadius: 16,
    shadowColor: AppColors.text.primary,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 4,
  },
  recommendationAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  recommendationBody: {
    flex: 1,
    paddingHorizontal: 22,
    paddingVertical: 16,
    paddingLeft: 26,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  categoryWrap: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 10,
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  category: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  recommendationTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
    color: AppColors.text.strong,
  },
  headerIndicators: {
    alignItems: 'flex-end',
    gap: 10,
  },
  recommendationDescription: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 22,
    color: AppColors.text.soft,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: AppColors.surface.raised,
    borderWidth: 1,
    borderColor: AppColors.border.brandSoft,
  },
  statusPillLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: AppColors.brand.action,
  },
  signalGrid: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  signalCard: {
    minWidth: 150,
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.resourceStatus.stable.track,
    backgroundColor: AppColors.surface.subtle,
  },
  archivedSignalCard: {
    backgroundColor: AppColors.modal.glassSubtle,
    borderColor: AppColors.modal.glassBorder,
  },
  signalCardWide: {
    flexBasis: 280,
  },
  prioritySignalCard: {
    maxWidth: 210,
  },
  signalLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    color: AppColors.text.soft,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  signalValue: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
    color: AppColors.text.body,
  },
  contextStrip: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: AppColors.border.soft,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 12,
  },
  contextSource: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flexShrink: 1,
  },
  contextLine: {
    fontSize: 12,
    lineHeight: 17,
    color: AppColors.text.secondary,
  },
  cardFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: AppColors.border.soft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  cardActionButton: {
    minHeight: 40,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  cardActionPrimary: {
    backgroundColor: AppColors.brand.action,
    borderColor: AppColors.brand.action,
  },
  cardActionLabel: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
  },
  cardActionLabelPrimary: {
    color: AppColors.surface.card,
  },
});

export default AdminRecommendations;
export const heroStripStylesForTesting = styles;
