import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { adminNavigationLinks, getAdminSidebarItems } from '@/components/dashboard/adminNavigation';
import { Button } from '@/components/foundation/Button';
import { ProgressBar } from '@/components/foundation/ProgressBar';
import { SkeletonLine } from '@/components/feedback/SkeletonLine';
import { StatusBadge } from '@/components/feedback/StatusBadge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CardBase } from '@/components/patterns/CardBase';
import { DataTable } from '@/components/resources/DataTable';
import { InventoryProgressCard } from '@/components/resources/InventoryProgressCard';
import { StaffingStatusCard } from '@/components/resources/StaffingStatusCard';
import { DepartmentManageOverlay } from '@/components/views/admin/resources/Sub-funcionalidades/DepartmentManageOverlay';
import { EditConfigurationOverlay } from '@/components/views/admin/resources/Sub-funcionalidades/EditConfigurationOverlay';
import { InventoryActionOverlay } from '@/components/views/admin/resources/Sub-funcionalidades/InventoryActionOverlay';
import { InventoryMapOverlay } from '@/components/views/admin/resources/Sub-funcionalidades/InventoryMapOverlay';
import { StaffingManageOverlay } from '@/components/views/admin/resources/Sub-funcionalidades/StaffingManageOverlay';
import { SupplyRequestOverlay } from '@/components/views/admin/resources/Sub-funcionalidades/SupplyRequestOverlay';
import {
  DepartmentResourceItem,
  InventoryResourceItem,
  ResourceConfiguration,
  StaffingProfileItem,
} from '@/components/views/admin/resources/Sub-funcionalidades/types';
import {
  createAdminResourceDepartment,
  createAdminResourceInventory,
  createAdminResourceSupplyRequest,
  createAdminResourceStaffing,
  deleteAdminResourceDepartment,
  deleteAdminResourceInventory,
  deleteAdminResourceStaffing,
  getAdminResourceInventoryMovements,
  getAdminResourceDepartments,
  getAdminResourceInventory,
  getAdminResourceStaffing,
  getAdminResourceSummary,
  HospitalInventoryMovementResponse,
  HospitalDepartmentResourceResponse,
  HospitalInventoryItemResponse,
  HospitalResourceSummaryResponse,
  HospitalStaffingProfileResponse,
  listAdminRecommendations,
  OperationalRecommendationResponse,
  updateAdminResourceDepartment,
  updateAdminResourceInventory,
  updateAdminResourceStaffing,
  updateAdminResourceSummary,
} from '@/lib/adminOperational';
import { initialsFromName } from '@/lib/format';
import { useTranslation } from '@/i18n';
import type { AppLanguage } from '@/i18n/language';
import { getHospitalAdminLabel, isSpanish } from '@/components/views/admin/localization';
import { AppColors, withAlpha } from '@/constants/theme';

type LoadState = 'idle' | 'loading' | 'success' | 'error';
type ResourceKpiTone = 'critical' | 'warning' | 'normal' | 'info';

interface ResourceKpi {
  id: string;
  label: string;
  value: string;
  suffix?: string;
  helper: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  tone: ResourceKpiTone;
  actionable?: boolean;
}

export function AdminResources() {
  const router = useRouter();
  const { logout, profile } = useAuth();
  const { language } = useTranslation();
  const sidebarItems = useMemo(() => getAdminSidebarItems(language), [language]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditConfigurationOpen, setIsEditConfigurationOpen] = useState(false);
  const [isStaffingManageOpen, setIsStaffingManageOpen] = useState(false);
  const [isInventoryMapOpen, setIsInventoryMapOpen] = useState(false);
  const [isInventoryCatalogOpen, setIsInventoryCatalogOpen] = useState(false);
  const [departmentMode, setDepartmentMode] = useState<'create' | 'edit'>('edit');
  const [inventoryMode, setInventoryMode] = useState<'create' | 'edit'>('edit');
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentResourceItem | null>(null);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryResourceItem | null>(null);
  const [selectedSupplyItem, setSelectedSupplyItem] = useState<InventoryResourceItem | null>(null);
  const [summary, setSummary] = useState<HospitalResourceSummaryResponse | null>(null);
  const [departmentsRaw, setDepartmentsRaw] = useState<HospitalDepartmentResourceResponse[]>([]);
  const [staffingRaw, setStaffingRaw] = useState<HospitalStaffingProfileResponse[]>([]);
  const [inventoryRaw, setInventoryRaw] = useState<HospitalInventoryItemResponse[]>([]);
  const [recommendationsRaw, setRecommendationsRaw] = useState<OperationalRecommendationResponse[]>([]);
  const [inventoryMovements, setInventoryMovements] = useState<HospitalInventoryMovementResponse[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [savingSupplyRequest, setSavingSupplyRequest] = useState(false);

  const loadResources = useCallback(async () => {
    setLoadState((current) => (current === 'success' ? 'success' : 'loading'));
    setError(null);
    try {
      const [
        summaryResponse,
        departmentsResponse,
        staffingResponse,
        inventoryResponse,
        recommendationsResponse,
      ] = await Promise.all([
        getAdminResourceSummary(),
        getAdminResourceDepartments(),
        getAdminResourceStaffing(),
        getAdminResourceInventory(),
        listAdminRecommendations(),
      ]);
      setSummary(summaryResponse.data);
      setDepartmentsRaw(departmentsResponse.data);
      setStaffingRaw(staffingResponse.data);
      setInventoryRaw(inventoryResponse.data);
      setRecommendationsRaw(recommendationsResponse);
      setLoadState('success');
    } catch (nextError) {
      setLoadState('error');
      setError(nextError instanceof Error ? nextError.message : isSpanish(language) ? 'No se pudieron cargar los recursos hospitalarios.' : 'Unable to load hospital resources.');
    }
  }, [language]);

  useEffect(() => {
    void loadResources();
  }, [loadResources]);

  const departments = useMemo(() => departmentsRaw.map(mapDepartment), [departmentsRaw]);
  const staffingProfiles = useMemo(() => staffingRaw.map(mapStaffingProfile), [staffingRaw]);
  const inventoryItems = useMemo(() => inventoryRaw.map((item) => mapInventoryItem(item, language)), [inventoryRaw, language]);
  const sortedInventoryItems = useMemo(
    () => [...inventoryItems].sort((a, b) => inventoryUrgencyScore(a) - inventoryUrgencyScore(b)),
    [inventoryItems],
  );
  const priorityInventoryItems = useMemo(() => sortedInventoryItems.slice(0, 2), [sortedInventoryItems]);
  const inventoryOverflowItems = useMemo(() => sortedInventoryItems.slice(2), [sortedInventoryItems]);
  const resourceConfiguration = useMemo(
    () => buildResourceConfiguration(summary, staffingRaw, departmentsRaw),
    [summary, staffingRaw, departmentsRaw],
  );

  const totalBeds = summary?.totalBeds ?? 0;
  const availableBeds = summary?.availableBeds ?? 0;
  const availableBedPercentage = totalBeds > 0 ? Number(((availableBeds / totalBeds) * 100).toFixed(1)) : 0;
  const totalSpecialists = staffingRaw.reduce((sum, profile) => sum + profile.headcount, 0);
  const activeStaffCount = (summary?.doctorsOnShift ?? 0) + (summary?.nursesOnShift ?? 0);
  const criticalDepartmentsCount = departmentsRaw.filter(
    (department) => department.status.toUpperCase().includes('CRITICAL'),
  ).length;
  const criticalInventoryCount = inventoryItems.filter((item) => item.tone === 'critical').length;
  const lowInventoryCount = inventoryItems.filter((item) => item.tone === 'low').length;
  const activeRecommendations = useMemo(
    () => recommendationsRaw.filter((recommendation) => !['COMPLETED', 'REJECTED'].includes(recommendation.status)),
    [recommendationsRaw],
  );
  const resourceKpis = useMemo<ResourceKpi[]>(() => {
    const es = isSpanish(language);
    const bedTone: ResourceKpiTone = availableBedPercentage <= 15 ? 'critical' : availableBedPercentage <= 30 ? 'warning' : 'normal';
    const icuAvailable = summary?.icuAvailableBeds ?? 0;
    const icuTone: ResourceKpiTone = icuAvailable <= 3 ? 'critical' : icuAvailable <= 5 ? 'warning' : 'normal';
    const departmentTone: ResourceKpiTone = criticalDepartmentsCount > 0 ? 'critical' : 'normal';
    const inventoryTone: ResourceKpiTone = criticalInventoryCount > 0 ? 'critical' : lowInventoryCount > 0 ? 'warning' : 'normal';

    return [
      {
        id: 'available-beds',
        label: es ? 'Camas disponibles' : 'Available Beds',
        value: String(availableBeds),
        suffix: es ? 'camas' : 'beds',
        helper: es ? `${availableBedPercentage}% de capacidad libre` : `${availableBedPercentage}% free capacity`,
        icon: 'bed-outline',
        tone: bedTone,
      },
      {
        id: 'icu',
        label: es ? 'UCI disponible' : 'ICU Available',
        value: String(icuAvailable),
        suffix: es ? 'camas' : 'beds',
        helper: es ? 'Unidad de Cuidados Intensivos' : 'Intensive Care Unit',
        icon: 'heart-pulse',
        tone: icuTone,
      },
      {
        id: 'active-staff',
        label: es ? 'Personal en turno' : 'Active Staff',
        value: String(activeStaffCount),
        suffix: es ? 'miembros' : 'members',
        helper: es ? 'Doctores y enfermeras' : 'Doctors and nurses',
        icon: 'account-group-outline',
        tone: 'info',
      },
      {
        id: 'critical-inventory',
        label: es ? 'Inventario crítico' : 'Critical Inventory',
        value: String(criticalInventoryCount),
        suffix: es ? 'artículos' : 'items',
        helper: lowInventoryCount > 0
          ? (es ? `${lowInventoryCount} adicionales en nivel bajo` : `${lowInventoryCount} additional low-stock`)
          : (es ? 'Insumos dentro del rango' : 'Supplies within range'),
        icon: 'package-variant-closed',
        tone: inventoryTone,
      },
      {
        id: 'critical-areas',
        label: es ? 'Áreas críticas' : 'Critical Areas',
        value: String(criticalDepartmentsCount),
        suffix: es ? 'áreas' : 'areas',
        helper: es ? `${departmentsRaw.length} departamentos monitoreados` : `${departmentsRaw.length} monitored departments`,
        icon: 'hospital-building',
        tone: departmentTone,
      },
      {
        id: 'recommendations',
        label: es ? 'Recomendaciones disponibles' : 'Available Recommendations',
        value: String(activeRecommendations.length),
        helper: es ? 'Abrir recomendaciones operativas' : 'Open operational recommendations',
        icon: 'clipboard-text-outline',
        tone: activeRecommendations.length > 0 ? 'info' : 'normal',
        actionable: true,
      },
    ];
  }, [
    activeStaffCount,
    activeRecommendations.length,
    availableBedPercentage,
    availableBeds,
    criticalDepartmentsCount,
    criticalInventoryCount,
    departmentsRaw.length,
    language,
    lowInventoryCount,
    summary?.icuAvailableBeds,
  ]);

  const openSupplyRequest = useCallback(async (item: InventoryResourceItem) => {
    setSelectedSupplyItem(item);
    setInventoryMovements([]);
    setLoadingMovements(true);
    try {
      const response = await getAdminResourceInventoryMovements(item.id);
      setInventoryMovements(response.data);
    } catch {
      setInventoryMovements([]);
    } finally {
      setLoadingMovements(false);
    }
  }, []);

  const handleInventoryAction = useCallback((item: InventoryResourceItem) => {
    if (item.actionType === 'order' || item.actionType === 'refill') {
      void openSupplyRequest(item);
      return;
    }
    setInventoryMode('edit');
    setSelectedInventoryItem(item);
  }, [openSupplyRequest]);

  const columns = [
    { key: 'department', label: isSpanish(language) ? 'Departamento' : 'Department' },
    { key: 'utilization', label: isSpanish(language) ? 'Ocupación' : 'Utilization' },
    { key: 'status', label: isSpanish(language) ? 'Estado' : 'Status', align: 'center' as const },
    { key: 'action', label: isSpanish(language) ? 'Acción' : 'Action', align: 'right' as const },
  ];
  const rows = departments.map((department) => {
    const departmentTotalBeds = parseInteger(department.totalBeds);
    const departmentOccupiedBeds = parseInteger(department.occupiedBeds);
    const utilization = departmentTotalBeds > 0 ? Math.round((departmentOccupiedBeds / departmentTotalBeds) * 100) : 0;

    return {
      department: (
        <View>
          <Text style={styles.departmentName}>{department.name}</Text>
          <Text style={styles.departmentLevel}>{department.level || department.code} | {department.occupiedBeds}/{department.totalBeds}</Text>
        </View>
      ),
      utilization: (
        <UtilizationCell
          value={`${utilization}%`}
          progress={utilization}
          color={department.status === 'Critical' ? AppColors.status.dangerAccent : department.status === 'Stable' ? AppColors.brand.action : AppColors.status.warningText}
        />
      ),
      status: (
        <View style={styles.centeredStatusCell}>
          <StatusBadge
            label={isSpanish(language)
              ? (department.status === 'Critical' ? 'Crítico' : department.status === 'High Demand' ? 'Alta demanda' : 'Estable')
              : department.status}
            variant={mapDepartmentStatus(department.status)}
          />
        </View>
      ),
      action: (
        <TouchableOpacity
          onPress={() => {
            setDepartmentMode('edit');
            setSelectedDepartment(department);
          }}
          activeOpacity={0.75}
        >
          <Text style={styles.manageLink}>{isSpanish(language) ? 'Administrar' : 'Manage'}</Text>
        </TouchableOpacity>
      ),
    };
  });
  const staffingRows = staffingProfiles.map((profile) => {
    const headcount = parseInteger(profile.headcount);
    const onShift = parseInteger(profile.onShiftCount);
    const coverage = headcount > 0 ? Math.round((onShift / headcount) * 100) : 0;

    return {
      role: (
        <View>
          <Text style={styles.departmentName}>{profile.roleName}</Text>
          <Text style={styles.departmentLevel}>{profile.roleCode}</Text>
        </View>
      ),
      coverage: (
        <UtilizationCell
          value={`${onShift}/${headcount}`}
          progress={coverage}
          color={coverage < 35 ? AppColors.status.dangerAccent : coverage < 55 ? AppColors.status.warning : AppColors.brand.action}
        />
      ),
      onCall: profile.onCallCount,
      standby: profile.standbyCount,
    };
  });
  return (
    <DashboardLayout
      active="resources"
      sectionLabel={isSpanish(language) ? 'Recursos' : 'Resources'}
      userName={profile?.fullName ?? getHospitalAdminLabel(language)}
      userId={profile?.email ?? undefined}
      avatarText={initialsFromName(profile?.fullName)}
      links={adminNavigationLinks}
      sidebarItems={sidebarItems}
      onLogout={async () => {
        await logout();
        router.replace('/login');
      }}
    >
      <>
        <ScrollView testID="admin-resources-screen" contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <View style={styles.heroStrip}>
              <View style={styles.heroCopy}>
                <Text style={styles.heroEyebrow}>{isSpanish(language) ? 'Operaciones hospitalarias' : 'Hospital Operations'}</Text>
                <Text style={styles.heroTitle}>{isSpanish(language) ? 'Gestión de recursos' : 'Resource Management'}</Text>
                <Text style={styles.heroDescription}>
                  {isSpanish(language)
                    ? 'Monitorea y administra la capacidad hospitalaria, el personal y el estado del inventario.'
                    : 'Monitor and manage hospital capacity, staffing, and inventory status.'}
                </Text>
              </View>
              <Button
                label={saving ? (isSpanish(language) ? 'Guardando...' : 'Saving...') : (isSpanish(language) ? 'Editar configuración' : 'Edit Configuration')}
                variant="secondary"
                size="sm"
                onPress={() => setIsEditConfigurationOpen(true)}
              />
            </View>

            {error ? (
              <CardBase style={styles.errorCard}>
                <Text style={styles.errorTitle}>{isSpanish(language) ? 'Problema del servicio de recursos' : 'Resource service issue'}</Text>
                <Text style={styles.errorText}>{error}</Text>
              </CardBase>
            ) : null}

            {loadState === 'loading' && !summary ? (
              <ResourceScreenSkeleton language={language} />
            ) : (
              <>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionTitle}>{isSpanish(language) ? 'Resumen operativo' : 'Operational Summary'}</Text>
                  </View>
                </View>

                <View style={styles.compactKpiGrid}>
                  {resourceKpis.map((item) => (
                    <ResourceKpiCard
                      key={item.id}
                      item={item}
                      onPress={item.actionable ? () => router.push('/admin/recommendations') : undefined}
                    />
                  ))}
                </View>

                <View style={styles.resourceColumnsRow}>
                  <View style={styles.resourceColumn}>
                  <CardBase style={styles.staffingPanel}>
                    <View style={styles.panelHeader}>
                      <View style={styles.panelHeaderTitle}>
                        <MaterialCommunityIcons name="account-group-outline" size={18} color={AppColors.brand.action} />
                        <Text style={styles.panelTitle}>{isSpanish(language) ? 'Personal (Turno activo)' : 'Staffing (Active Shift)'}</Text>
                      </View>
                      <View style={styles.tableActions}>
                        <View style={styles.liveBadge}>
                        <Text style={styles.liveBadgeText}>{isSpanish(language) ? 'DIRECTORIO' : 'DIRECTORY'}</Text>
                        </View>
                        <Button label={isSpanish(language) ? 'Administrar' : 'Manage'} variant="ghost" size="sm" onPress={() => setIsStaffingManageOpen(true)} />
                      </View>
                    </View>

                    <View style={styles.panelBody}>
                      <StaffingStatusCard
                        title={isSpanish(language) ? 'Doctores en turno' : 'Doctors on Shift'}
                        subtitle={isSpanish(language) ? `${resourceConfiguration.doctors} doctores configurados` : `${resourceConfiguration.doctors} total doctors configured`}
                        value={String(summary?.doctorsOnShift ?? 0)}
                        variant="doctor"
                        valueColor={AppColors.text.primary}
                        icon={<MaterialCommunityIcons name="stethoscope" size={16} color={AppColors.roleTone.doctor.accent} />}
                        iconBackgroundColor={AppColors.roleTone.doctor.background}
                        style={styles.staffingItem}
                      />
                      <StaffingStatusCard
                        title={isSpanish(language) ? 'Enfermeras en turno' : 'Nurses on Shift'}
                        subtitle={isSpanish(language) ? `${resourceConfiguration.nurses} personal de enfermería configurado` : `${resourceConfiguration.nurses} nursing staff configured`}
                        value={String(summary?.nursesOnShift ?? 0)}
                        variant="nurse"
                        valueColor={AppColors.text.primary}
                        icon={<MaterialCommunityIcons name="medical-bag" size={16} color={AppColors.roleTone.nurse.accent} />}
                        iconBackgroundColor={AppColors.roleTone.nurse.background}
                        style={styles.staffingItem}
                      />
                      <StaffingStatusCard
                        title={isSpanish(language) ? 'Especialistas disponibles' : 'Available Specialists'}
                        subtitle={isSpanish(language) ? `${staffingRaw.length} perfiles de especialidad monitoreados` : `${staffingRaw.length} specialty profiles tracked`}
                        value={String(totalSpecialists).padStart(2, '0')}
                        variant="specialist"
                        highlightColor={AppColors.status.warning}
                        valueColor={AppColors.text.primary}
                        icon={<MaterialCommunityIcons name="sprout" size={16} color={AppColors.status.warningText} />}
                        iconBackgroundColor={AppColors.status.warningSoft}
                        style={styles.staffingItem}
                      />
                    </View>
                  </CardBase>

                  <CardBase style={styles.tablePanel}>
                    <View style={styles.tableHeader}>
                      <View style={styles.tableHeaderTitle}>
                        <MaterialCommunityIcons name="account-badge-outline" size={17} color={AppColors.brand.action} />
                        <Text style={styles.tableTitle} numberOfLines={1}>{isSpanish(language) ? 'Perfiles de personal' : 'Staffing Profiles'}</Text>
                      </View>
                    </View>
                    <DataTable
                      compact
                      style={styles.table}
                      columns={[
                        { key: 'role', label: isSpanish(language) ? 'Rol' : 'Role' },
                        { key: 'coverage', label: isSpanish(language) ? 'En turno' : 'On Shift' },
                        { key: 'onCall', label: isSpanish(language) ? 'En guardia' : 'On Call', align: 'center' as const },
                        { key: 'standby', label: isSpanish(language) ? 'En reserva' : 'Standby', align: 'center' as const },
                      ]}
                      rows={staffingRows}
                    />
                  </CardBase>
                  </View>

                  <View style={styles.resourceColumn}>
                  <CardBase style={styles.inventoryPanel}>
                    <View style={styles.panelHeader}>
                      <View style={styles.panelHeaderTitle}>
                        <MaterialCommunityIcons name="clipboard-pulse-outline" size={18} color={AppColors.brand.action} />
                        <Text style={styles.panelTitle}>{isSpanish(language) ? 'Inventario crítico' : 'Critical Inventory'}</Text>
                      </View>
                      <View style={styles.tableActions}>
                        <Button
                          label={isSpanish(language) ? 'Agregar artículo' : 'Add Item'}
                          variant="ghost"
                          size="sm"
                          labelStyle={styles.inventoryAction}
                          onPress={() => {
                            setInventoryMode('create');
                            setSelectedInventoryItem(null);
                          }}
                        />
                        <Button
                          label={isSpanish(language) ? 'Ubicaciones de inventario' : 'Inventory Locations'}
                          variant="ghost"
                          size="sm"
                          labelStyle={styles.inventoryAction}
                          onPress={() => setIsInventoryMapOpen(true)}
                        />
                      </View>
                    </View>

                    <View style={styles.inventoryList}>
                      {priorityInventoryItems.map((item) => (
                        <InventoryProgressCard
                          key={item.id}
                          title={item.title}
                          valueText={item.valueText}
                          valueTextColor={item.tone === 'critical' ? AppColors.status.dangerAccent : undefined}
                          progress={item.progress}
                          variant={item.tone === 'critical' ? 'critical' : item.tone === 'low' ? 'warning' : 'normal'}
                          icon={
                            <MaterialCommunityIcons
                              name={item.category.toLowerCase().includes('oxygen') ? 'molecule' : item.category.toLowerCase().includes('vaccine') ? 'needle' : 'medical-bag'}
                              size={14}
                              color={item.tone === 'critical' ? AppColors.status.dangerAccent : item.tone === 'low' ? AppColors.status.warning : AppColors.brand.action}
                            />
                          }
                          actionLabel={isSpanish(language)
                            ? (item.tone === 'critical' ? 'Pedir ahora' : item.tone === 'low' ? 'Reordenar' : 'Administrar')
                            : (item.tone === 'critical' ? 'Order More Now' : item.tone === 'low' ? 'Order Refill' : 'Manage Item')}
                          actionPlacement="below"
                          actionVariant="secondary"
                          progressFillColor={item.tone === 'critical' ? AppColors.status.dangerAccent : item.tone === 'low' ? AppColors.status.warning : AppColors.brand.action}
                          progressTrackColor={item.tone === 'critical' ? AppColors.resourceStatus.critical.trackSoft : item.tone === 'low' ? AppColors.status.warningSoft : AppColors.resourceStatus.stable.track}
                          onAction={() => handleInventoryAction(item)}
                          style={styles.inventoryItem}
                        />
                      ))}
                      {inventoryOverflowItems.length > 0 ? (
                        <Button
                          label={isSpanish(language)
                            ? `Ver más productos (${inventoryOverflowItems.length})`
                            : `View More Items (${inventoryOverflowItems.length})`}
                          variant="surface"
                          size="sm"
                          style={styles.inventoryMoreButton}
                          onPress={() => setIsInventoryCatalogOpen(true)}
                        />
                      ) : null}
                    </View>
                  </CardBase>

                  <CardBase style={styles.tablePanel}>
                    <View style={styles.tableHeader}>
                      <View style={styles.tableHeaderTitle}>
                        <MaterialCommunityIcons name="bed-outline" size={17} color={AppColors.brand.action} />
                        <Text style={styles.tableTitle} numberOfLines={1}>{isSpanish(language) ? 'Disponibilidad de camas por departamento' : 'Bed Availability by Department'}</Text>
                      </View>
                      <View style={styles.tableActions}>
                        <Button
                          label={isSpanish(language) ? 'Agregar departamento' : 'Add Department'}
                          variant="ghost"
                          size="sm"
                          onPress={() => {
                            setDepartmentMode('create');
                            setSelectedDepartment(null);
                          }}
                        />
                        <Button
                          variant="secondary"
                          size="icon"
                          leadingIcon={<Feather name="refresh-cw" size={14} color={AppColors.text.muted} />}
                          style={styles.iconButton}
                          onPress={() => void loadResources()}
                        />
                      </View>
                    </View>

                    <DataTable columns={columns} rows={rows} compact style={styles.table} />
                  </CardBase>
                  </View>
                </View>

              </>
            )}
          </View>
        </ScrollView>

        <EditConfigurationOverlay
          visible={isEditConfigurationOpen}
          value={resourceConfiguration}
          departments={departments}
          onClose={() => setIsEditConfigurationOpen(false)}
          onSave={async (nextValue) => {
            if (!summary) return;
            setSaving(true);
            setError(null);
            try {
              await updateAdminResourceSummary({
                ...summary,
                totalBeds: parseInteger(nextValue.totalBeds),
                doctorsOnShift: parseInteger(nextValue.doctors),
                nursesOnShift: parseInteger(nextValue.nurses),
                specialistsOnShift: Math.max(parseInteger(nextValue.emergencyPhysicians), summary.specialistsOnShift),
              });
              await Promise.all(
                staffingRaw.map((profile) => {
                  const nextHeadcount = parseInteger(readResourceConfigField(nextValue, profile.roleName, profile.headcount));
                  if (nextHeadcount === profile.headcount) return Promise.resolve(profile);
                  return updateAdminResourceStaffing(profile.id, { ...profile, headcount: nextHeadcount });
                }),
              );
              await loadResources();
              setIsEditConfigurationOpen(false);
            } catch (nextError) {
              setError(nextError instanceof Error ? nextError.message : isSpanish(language) ? 'No se pudo guardar la configuración de recursos.' : 'Unable to save the resource configuration.');
            } finally {
              setSaving(false);
            }
          }}
        />

        <DepartmentManageOverlay
          visible={selectedDepartment !== null || departmentMode === 'create'}
          department={selectedDepartment}
          mode={departmentMode}
          saving={saving}
          deleting={deleting}
          onClose={() => {
            setSelectedDepartment(null);
            setDepartmentMode('edit');
          }}
          onSave={async (nextDepartment) => {
            setSaving(true);
            setError(null);
            try {
              if (departmentMode === 'create') {
                await createAdminResourceDepartment({
                  departmentCode: nextDepartment.code,
                  departmentName: nextDepartment.name,
                  levelLabel: nextDepartment.level,
                  totalBeds: parseInteger(nextDepartment.totalBeds),
                  occupiedBeds: parseInteger(nextDepartment.occupiedBeds),
                  status: nextDepartment.status.toUpperCase().replace(/\s+/g, '_'),
                  notes: nextDepartment.notes,
                });
              } else {
                await updateAdminResourceDepartment(nextDepartment.id, {
                  id: nextDepartment.id,
                  departmentCode: nextDepartment.code,
                  departmentName: nextDepartment.name,
                  levelLabel: nextDepartment.level,
                  totalBeds: parseInteger(nextDepartment.totalBeds),
                  occupiedBeds: parseInteger(nextDepartment.occupiedBeds),
                  availableBeds: Math.max(parseInteger(nextDepartment.totalBeds) - parseInteger(nextDepartment.occupiedBeds), 0),
                  status: nextDepartment.status.toUpperCase().replace(/\s+/g, '_'),
                  notes: nextDepartment.notes,
                });
              }
              await loadResources();
              setSelectedDepartment(null);
              setDepartmentMode('edit');
            } catch (nextError) {
              setError(nextError instanceof Error ? nextError.message : isSpanish(language) ? 'No se pudo guardar el departamento.' : 'Unable to save the department.');
            } finally {
              setSaving(false);
            }
          }}
          onDelete={async (department) => {
            setDeleting(true);
            setError(null);
            try {
              await deleteAdminResourceDepartment(department.id);
              await loadResources();
              setSelectedDepartment(null);
              setDepartmentMode('edit');
            } catch (nextError) {
              setError(nextError instanceof Error ? nextError.message : isSpanish(language) ? 'No se pudo eliminar el departamento.' : 'Unable to delete the department.');
            } finally {
              setDeleting(false);
            }
          }}
        />

        <StaffingManageOverlay
          visible={isStaffingManageOpen}
          profiles={staffingProfiles}
          saving={saving}
          deleting={deleting}
          onClose={() => setIsStaffingManageOpen(false)}
          onSave={async (profile, mode) => {
            setSaving(true);
            setError(null);
            try {
              const payload = {
                roleCode: profile.roleCode,
                roleName: profile.roleName,
                headcount: parseInteger(profile.headcount),
                onShiftCount: parseInteger(profile.onShiftCount),
                onCallCount: parseInteger(profile.onCallCount),
                standbyCount: parseInteger(profile.standbyCount),
              };
              if (mode === 'create') {
                await createAdminResourceStaffing(payload);
              } else {
                await updateAdminResourceStaffing(profile.id, { id: profile.id, ...payload });
              }
              await loadResources();
            } catch (nextError) {
              setError(nextError instanceof Error ? nextError.message : isSpanish(language) ? 'No se pudo guardar el perfil de personal.' : 'Unable to save the staffing profile.');
            } finally {
              setSaving(false);
            }
          }}
          onDelete={async (profile) => {
            setDeleting(true);
            setError(null);
            try {
              await deleteAdminResourceStaffing(profile.id);
              await loadResources();
            } catch (nextError) {
              setError(nextError instanceof Error ? nextError.message : isSpanish(language) ? 'No se pudo eliminar el perfil de personal.' : 'Unable to delete the staffing profile.');
            } finally {
              setDeleting(false);
            }
          }}
        />

        <InventoryMapOverlay visible={isInventoryMapOpen} inventory={inventoryItems} onClose={() => setIsInventoryMapOpen(false)} />

        <InventoryCatalogOverlay
          visible={isInventoryCatalogOpen}
          language={language}
          items={inventoryOverflowItems}
          onClose={() => setIsInventoryCatalogOpen(false)}
          onAction={(item) => {
            setIsInventoryCatalogOpen(false);
            handleInventoryAction(item);
          }}
        />

        <InventoryActionOverlay
          visible={selectedInventoryItem !== null || inventoryMode === 'create'}
          inventoryItem={selectedInventoryItem}
          mode={inventoryMode}
          saving={saving}
          deleting={deleting}
          onClose={() => {
            setSelectedInventoryItem(null);
            setInventoryMode('edit');
          }}
          onSave={async (item) => {
            setSaving(true);
            setError(null);
            try {
              const payload = {
                itemCode: item.itemCode,
                itemName: item.title,
                category: item.category,
                location: item.location,
                currentQuantity: parseInteger(item.currentQuantity),
                capacityQuantity: parseInteger(item.capacityQuantity),
                unit: item.unit,
                criticalThreshold: parseInteger(item.criticalThreshold),
                targetQuantity: parseInteger(item.targetQuantity),
                status: item.status.toUpperCase().replace(/[^A-Z_]/g, '_'),
              };
              if (inventoryMode === 'create') {
                await createAdminResourceInventory(payload);
              } else {
                await updateAdminResourceInventory(item.id, {
                  id: item.id,
                  ...payload,
                });
              }
              await loadResources();
              setSelectedInventoryItem(null);
              setInventoryMode('edit');
            } catch (nextError) {
              setError(nextError instanceof Error ? nextError.message : isSpanish(language) ? 'No se pudo guardar el artículo de inventario.' : 'Unable to save the inventory item.');
            } finally {
              setSaving(false);
            }
          }}
          onDelete={async (item) => {
            setDeleting(true);
            setError(null);
            try {
              await deleteAdminResourceInventory(item.id);
              await loadResources();
              setSelectedInventoryItem(null);
              setInventoryMode('edit');
            } catch (nextError) {
              setError(nextError instanceof Error ? nextError.message : isSpanish(language) ? 'No se pudo eliminar el artículo de inventario.' : 'Unable to delete the inventory item.');
            } finally {
              setDeleting(false);
            }
          }}
        />

        <SupplyRequestOverlay
          visible={selectedSupplyItem !== null}
          inventoryItem={selectedSupplyItem}
          movements={inventoryMovements}
          loadingMovements={loadingMovements}
          saving={savingSupplyRequest}
          onClose={() => {
            setSelectedSupplyItem(null);
            setInventoryMovements([]);
          }}
          onSubmit={async (draft) => {
            if (!selectedSupplyItem) return;
            setSavingSupplyRequest(true);
            setError(null);
            try {
              await createAdminResourceSupplyRequest(selectedSupplyItem.id, {
                supplyTypeLabel: selectedSupplyItem.title,
                quantity: Math.max(parseInteger(draft.quantity), 1),
                unit: selectedSupplyItem.unit,
                destination: draft.destination || selectedSupplyItem.location,
                suggestedSupplier: draft.suggestedSupplier || undefined,
                priority: draft.priority,
                requestedNeededBy: draft.requestedNeededBy || null,
              });
              await loadResources();
              setSelectedSupplyItem(null);
              setInventoryMovements([]);
            } catch (nextError) {
              setError(nextError instanceof Error ? nextError.message : isSpanish(language) ? 'No se pudo crear la solicitud de insumos.' : 'Unable to create the supply request.');
            } finally {
              setSavingSupplyRequest(false);
            }
          }}
        />
      </>
    </DashboardLayout>
  );
}

function ResourceKpiCard({ item, onPress }: { item: ResourceKpi; onPress?: () => void }) {
  const tone = resourceKpiTone(item.tone);
  const content = (
    <CardBase style={[styles.compactKpiCard, { borderLeftColor: tone.accent }]}>
      <View style={[styles.compactKpiIcon, { backgroundColor: tone.background }]}>
        <MaterialCommunityIcons name={item.icon} size={18} color={tone.accent} />
      </View>
      <View style={styles.compactKpiContent}>
        <Text style={styles.compactKpiLabel}>{item.label}</Text>
        <View style={styles.compactKpiValueRow}>
          <Text style={styles.compactKpiValue}>{item.value}</Text>
          {item.suffix ? <Text style={styles.compactKpiSuffix}>{item.suffix}</Text> : null}
        </View>
        <Text style={styles.compactKpiHelper} numberOfLines={1}>{item.helper}</Text>
      </View>
    </CardBase>
  );

  if (!onPress) return content;

  return (
    <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={styles.compactKpiAction}>
      {content}
    </TouchableOpacity>
  );
}

function InventoryCatalogOverlay({
  visible,
  language,
  items,
  onClose,
  onAction,
}: {
  visible: boolean;
  language: AppLanguage;
  items: InventoryResourceItem[];
  onClose: () => void;
  onAction: (item: InventoryResourceItem) => void;
}) {
  const es = isSpanish(language);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.inventoryCatalogModal}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalEyebrow}>{es ? 'Inventario hospitalario' : 'Hospital Inventory'}</Text>
              <Text style={styles.modalTitle}>{es ? 'Productos por prioridad de reposición' : 'Items by Refill Priority'}</Text>
            </View>
            <TouchableOpacity style={styles.modalCloseButton} activeOpacity={0.75} onPress={onClose}>
              <Feather name="x" size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.inventoryCatalogScroll}
            contentContainerStyle={styles.inventoryCatalogList}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item) => {
              const tone = inventoryCatalogTone(item);
              return (
                <View key={item.id} style={[styles.inventoryCatalogItem, { borderLeftColor: tone.color }]}>
                  <View style={styles.inventoryCatalogHeader}>
                    <View style={styles.inventoryCatalogItemMain}>
                      <View style={[styles.inventoryCatalogIcon, { backgroundColor: tone.background }]}>
                        <MaterialCommunityIcons
                          name={item.category.toLowerCase().includes('oxygen') ? 'molecule' : item.category.toLowerCase().includes('vaccine') ? 'needle' : 'medical-bag'}
                          size={16}
                          color={tone.color}
                        />
                      </View>
                      <View style={styles.inventoryCatalogCopy}>
                        <Text style={styles.inventoryCatalogTitle}>{item.title}</Text>
                        <Text style={styles.inventoryCatalogMeta}>{item.location || item.category}</Text>
                      </View>
                    </View>
                    <Text style={[styles.inventoryCatalogQuantity, { color: tone.color }]}>{item.valueText}</Text>
                  </View>
                  <ProgressBar
                    value={item.progress}
                    color={tone.color}
                    trackColor={tone.track}
                    style={styles.inventoryCatalogProgress}
                  />
                  <View style={styles.inventoryCatalogAction}>
                    <Button
                      label={es
                        ? (item.tone === 'critical' ? 'Pedir ahora' : item.tone === 'low' ? 'Reordenar' : 'Administrar')
                        : (item.tone === 'critical' ? 'Order Now' : item.tone === 'low' ? 'Refill' : 'Manage')}
                      variant={item.tone === 'critical' ? 'primary' : 'secondary'}
                      size="sm"
                      onPress={() => onAction(item)}
                    />
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ResourceScreenSkeleton({ language }: { language: AppLanguage }) {
  const es = isSpanish(language);
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{es ? 'Resumen operativo' : 'Operational Summary'}</Text>
      </View>
      <View style={styles.compactKpiGrid}>
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <CardBase key={item} style={[styles.compactKpiCard, styles.compactKpiSkeletonCard]}>
            <View style={styles.skeletonKpiIcon} />
            <View style={styles.compactKpiContent}>
              <SkeletonLine width="64%" height={10} />
              <SkeletonLine width={58} height={22} style={styles.skeletonKpiValue} />
              <SkeletonLine width="78%" height={9} />
            </View>
          </CardBase>
        ))}
      </View>
      <View style={styles.resourceColumnsRow}>
        {[0, 1].map((column) => (
          <View key={column} style={styles.resourceColumn}>
            <CardBase style={[styles.staffingPanel, styles.skeletonPanel]}>
              <SkeletonLine width="44%" height={16} />
              <SkeletonLine width="88%" style={styles.skeletonSpaced} />
              <SkeletonLine width="76%" />
              <SkeletonLine width="64%" />
            </CardBase>
            <CardBase style={[styles.tablePanel, styles.skeletonPanel]}>
              <SkeletonLine width="52%" height={16} />
              <SkeletonLine width="100%" style={styles.skeletonSpaced} />
              <SkeletonLine width="92%" />
              <SkeletonLine width="96%" />
            </CardBase>
          </View>
        ))}
      </View>
    </>
  );
}

function alertInventoryRank(item: InventoryResourceItem) {
  return item.tone === 'critical' ? 0 : item.tone === 'low' ? 1 : 2;
}

function inventoryUrgencyScore(item: InventoryResourceItem) {
  const current = parseInteger(item.currentQuantity);
  const critical = parseInteger(item.criticalThreshold);
  const target = parseInteger(item.targetQuantity);
  const base = alertInventoryRank(item) * 100000;
  if (item.tone === 'critical') return base + Math.max(current - critical, 0);
  if (item.tone === 'low') return base + Math.max(current - target, 0);
  return base + current;
}

function inventoryCatalogTone(item: InventoryResourceItem): { color: string; background: string; track: string } {
  if (item.tone === 'critical') return { color: AppColors.status.dangerBright, background: AppColors.status.dangerSoft, track: AppColors.status.dangerBorder };
  if (item.tone === 'low') return { color: AppColors.status.warning, background: AppColors.status.warningWash, track: AppColors.status.warningBorder };
  return { color: AppColors.brand.action, background: AppColors.surface.brandSoft, track: AppColors.resourceStatus.stable.track };
}

function resourceKpiTone(tone: ResourceKpiTone): { accent: string; background: string } {
  if (tone === 'critical') return { accent: AppColors.status.dangerBright, background: AppColors.status.dangerSoft };
  if (tone === 'warning') return { accent: AppColors.status.warningBright, background: AppColors.status.warningPanel };
  if (tone === 'info') return { accent: AppColors.resourceStatus.info.accent, background: AppColors.resourceStatus.info.background };
  return { accent: AppColors.status.successBright, background: AppColors.status.successWash };
}

function mapDepartment(item: HospitalDepartmentResourceResponse): DepartmentResourceItem {
  return {
    id: item.id,
    code: item.departmentCode,
    name: item.departmentName,
    level: item.levelLabel,
    totalBeds: String(item.totalBeds),
    occupiedBeds: String(item.occupiedBeds),
    status: normalizeDepartmentStatus(item.status),
    notes: item.notes,
  };
}

function mapStaffingProfile(item: HospitalStaffingProfileResponse): StaffingProfileItem {
  return {
    id: item.id,
    roleCode: item.roleCode,
    roleName: item.roleName,
    headcount: String(item.headcount),
    onShiftCount: String(item.onShiftCount),
    onCallCount: String(item.onCallCount),
    standbyCount: String(item.standbyCount),
  };
}

function mapInventoryItem(item: HospitalInventoryItemResponse, language: AppLanguage): InventoryResourceItem {
  const progress = item.capacityQuantity > 0 ? Math.round((item.currentQuantity / item.capacityQuantity) * 100) : 0;
  const critical = item.currentQuantity <= item.criticalThreshold || item.status.toUpperCase().includes('CRITICAL');
  const low = !critical && item.currentQuantity < item.targetQuantity;
  const es = isSpanish(language);
  const actionLabel = critical
    ? (es ? 'Pedir ahora' : 'Order More Now')
    : low
      ? (es ? 'Reordenar' : 'Order Refill')
      : (es ? 'Administrar' : 'Manage Supply');
  const actionType = critical ? 'order' : low ? 'refill' : 'manage';
  return {
    id: item.id,
    itemCode: item.itemCode,
    title: item.itemName,
    category: item.category,
    currentQuantity: String(item.currentQuantity),
    capacityQuantity: String(item.capacityQuantity),
    unit: item.unit,
    criticalThreshold: String(item.criticalThreshold),
    targetQuantity: String(item.targetQuantity),
    status: item.status,
    valueText: `${item.currentQuantity}${item.unit ? ` ${item.unit}` : ''} / ${item.capacityQuantity}${item.unit ? ` ${item.unit}` : ''}`,
    progress,
    tone: critical ? 'critical' : low ? 'low' : 'normal',
    actionLabel,
    actionType,
    location: item.location,
    targetLevel: `${item.targetQuantity}${item.unit ? ` ${item.unit}` : ''}`,
  };
}

function buildResourceConfiguration(
  summary: HospitalResourceSummaryResponse | null,
  staffing: HospitalStaffingProfileResponse[],
  departments: HospitalDepartmentResourceResponse[],
): ResourceConfiguration {
  const profileByKey = new Map(staffing.map((profile) => [normalizeRoleKey(profile.roleName), profile]));
  return {
    totalBeds: String(summary?.totalBeds ?? departments.reduce((sum, department) => sum + department.totalBeds, 0)),
    totalPersonnel: String(staffing.reduce((sum, profile) => sum + profile.headcount, 0)),
    doctors: String(summary?.doctorsOnShift ?? 0),
    nurses: String(summary?.nursesOnShift ?? 0),
    neurologists: String(profileByKey.get('neurologist')?.headcount ?? 0),
    cardiologists: String(profileByKey.get('cardiologist')?.headcount ?? 0),
    pediatricians: String(profileByKey.get('pediatrician')?.headcount ?? 0),
    surgeons: String(profileByKey.get('surgeon')?.headcount ?? 0),
    anesthesiologists: String(profileByKey.get('anesthesiologist')?.headcount ?? 0),
    radiologists: String(profileByKey.get('radiologist')?.headcount ?? 0),
    pulmonologists: String(profileByKey.get('pulmonologist')?.headcount ?? 0),
    infectiousDiseaseSpecialists: String(profileByKey.get('infectious disease specialist')?.headcount ?? 0),
    emergencyPhysicians: String(profileByKey.get('emergency physician')?.headcount ?? summary?.specialistsOnShift ?? 0),
  };
}

function normalizeRoleKey(value: string) {
  return value.trim().toLowerCase();
}

function readResourceConfigField(
  configuration: ResourceConfiguration,
  roleName: string,
  fallback: number,
) {
  const key = normalizeRoleKey(roleName);
  if (key === 'neurologist') return configuration.neurologists;
  if (key === 'cardiologist') return configuration.cardiologists;
  if (key === 'pediatrician') return configuration.pediatricians;
  if (key === 'surgeon') return configuration.surgeons;
  if (key === 'anesthesiologist') return configuration.anesthesiologists;
  if (key === 'radiologist') return configuration.radiologists;
  if (key === 'pulmonologist') return configuration.pulmonologists;
  if (key === 'infectious disease specialist') return configuration.infectiousDiseaseSpecialists;
  if (key === 'emergency physician') return configuration.emergencyPhysicians;
  return String(fallback);
}

function normalizeDepartmentStatus(status: string): DepartmentResourceItem['status'] {
  const value = status.toUpperCase();
  if (value.includes('CRITICAL')) return 'Critical';
  if (value.includes('HIGH')) return 'High Demand';
  return 'Stable';
}

function mapDepartmentStatus(status: DepartmentResourceItem['status']) {
  if (status === 'Critical') return 'critical' as const;
  if (status === 'High Demand') return 'warning' as const;
  return 'info' as const;
}

function parseInteger(value: string) {
  const parsedValue = Number.parseInt(value || '0', 10);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function UtilizationCell({
  value,
  progress,
  color,
}: {
  value: string;
  progress: number;
  color: string;
}) {
  return (
    <View style={styles.utilizationCell}>
      <ProgressBar value={progress} color={color} trackColor={AppColors.resourceStatus.stable.track} style={styles.utilizationBar} />
      <Text style={styles.utilizationValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 36,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
    color: AppColors.text.primary,
  },
  sectionAction: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: AppColors.brand.action,
  },
  errorCard: {
    borderColor: AppColors.status.dangerBorder,
    backgroundColor: AppColors.clinicalSeverity.critical.card,
  },
  errorTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    color: AppColors.status.dangerDeep,
  },
  errorText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: AppColors.status.dangerDark,
  },
  loadingCard: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 28,
  },
  loadingText: {
    fontSize: 13,
    lineHeight: 18,
    color: AppColors.text.body,
  },
  skeletonIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: AppColors.border.default,
  },
  skeletonKpiIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: AppColors.border.default,
  },
  skeletonKpiValue: {
    marginTop: 8,
    marginBottom: 5,
  },
  skeletonSpaced: {
    marginTop: 16,
  },
  skeletonSpacedSmall: {
    marginTop: 10,
  },
  skeletonPanel: {
    padding: 18,
    gap: 10,
  },
  compactKpiGrid: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 10,
  },
  compactKpiAction: {
    flex: 1,
    minWidth: 0,
  },
  compactKpiCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 86,
    padding: 11,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderColor: AppColors.border.default,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactKpiSkeletonCard: {
    borderLeftColor: AppColors.border.default,
  },
  compactKpiIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactKpiContent: {
    flex: 1,
    minWidth: 0,
  },
  compactKpiLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: AppColors.text.secondary,
  },
  compactKpiValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    marginTop: 4,
  },
  compactKpiValue: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '900',
    color: AppColors.text.primary,
  },
  compactKpiSuffix: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: AppColors.text.secondary,
    marginBottom: 3,
  },
  compactKpiHelper: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    color: AppColors.text.secondary,
  },
  alertsColumn: {
    gap: 12,
  },
  resourceColumnsRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'stretch',
  },
  resourceColumn: {
    flex: 1,
    gap: 16,
    minWidth: 0,
  },
  staffingPanel: {
    padding: 0,
    overflow: 'hidden',
    height: 404,
  },
  inventoryPanel: {
    padding: 0,
    overflow: 'hidden',
    height: 404,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    minHeight: 48,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.modal.headerBorder,
  },
  panelHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  panelTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    color: AppColors.text.primary,
  },
  liveBadge: {
    borderRadius: 8,
    backgroundColor: AppColors.surface.brandSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveBadgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '800',
    color: AppColors.brand.action,
  },
  panelBody: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 16,
    flex: 1,
    gap: 12,
  },
  staffingItem: {
    minHeight: 92,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.border.default,
  },
  inventoryAction: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: AppColors.brand.action,
  },
  inventoryList: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    gap: 12,
    flex: 1,
  },
  inventoryItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: AppColors.border.default,
    borderRadius: 12,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: AppColors.surface.cardSoft,
  },
  inventoryMoreButton: {
    minHeight: 38,
  },
  tablePanel: {
    padding: 0,
    overflow: 'hidden',
    height: 440,
    borderColor: AppColors.modal.border,
    shadowColor: AppColors.text.primary,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    paddingHorizontal: 16,
    paddingVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.modal.headerBorder,
    backgroundColor: AppColors.surface.card,
  },
  tableTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    color: AppColors.text.primary,
  },
  tableHeaderTitle: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tableActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 32,
    minWidth: 32,
    minHeight: 32,
    borderRadius: 10,
  },
  table: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    borderRadius: 0,
  },
  departmentName: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: AppColors.text.primary,
  },
  departmentLevel: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 14,
    color: AppColors.text.muted,
  },
  utilizationCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 120,
  },
  utilizationBar: {
    flex: 1,
  },
  utilizationValue: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: AppColors.text.primary,
  },
  centeredStatusCell: {
    width: '100%',
    alignItems: 'center',
  },
  manageLink: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: AppColors.brand.action,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: AppColors.modal.darkBackdrop,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  inventoryCatalogModal: {
    width: '100%',
    maxWidth: 820,
    maxHeight: '86%',
    borderRadius: 18,
    backgroundColor: AppColors.surface.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AppColors.modal.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.modal.headerBorder,
  },
  modalEyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
    color: AppColors.brand.action,
    textTransform: 'uppercase',
  },
  modalTitle: {
    marginTop: 4,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '900',
    color: AppColors.text.primary,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.modal.border,
    backgroundColor: AppColors.surface.card,
  },
  inventoryCatalogScroll: {
    maxHeight: 560,
  },
  inventoryCatalogList: {
    padding: 18,
    gap: 12,
  },
  inventoryCatalogItem: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: AppColors.border.default,
    borderRadius: 14,
    padding: 14,
    backgroundColor: AppColors.surface.cardSoft,
    gap: 10,
  },
  inventoryCatalogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  inventoryCatalogItemMain: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inventoryCatalogIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inventoryCatalogCopy: {
    flex: 1,
    minWidth: 0,
  },
  inventoryCatalogTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    color: AppColors.text.primary,
  },
  inventoryCatalogMeta: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: AppColors.text.secondary,
  },
  inventoryCatalogProgressRow: {
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inventoryCatalogProgress: {
    width: '100%',
  },
  inventoryCatalogQuantity: {
    minWidth: 86,
    textAlign: 'right',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: AppColors.text.body,
  },
  inventoryCatalogAction: {
    alignItems: 'flex-end',
  },
});

export default AdminResources;
export const heroStripStylesForTesting = styles;
