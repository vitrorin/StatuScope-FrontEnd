import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { adminNavigationLinks, adminSidebarItems } from '@/components/dashboard/adminNavigation';
import { Button } from '@/components/foundation/Button';
import { InlineWarningBanner } from '@/components/feedback/InlineWarningBanner';
import { ProgressBar } from '@/components/foundation/ProgressBar';
import { StatusBadge } from '@/components/feedback/StatusBadge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CardBase } from '@/components/patterns/CardBase';
import { BedCapacitySummaryCard } from '@/components/resources/BedCapacitySummaryCard';
import { DataTable } from '@/components/resources/DataTable';
import { InventoryProgressCard } from '@/components/resources/InventoryProgressCard';
import { StaffingStatusCard } from '@/components/resources/StaffingStatusCard';
import { DepartmentManageOverlay } from '@/components/views/admin/resources/Sub-funcionalidades/DepartmentManageOverlay';
import { EditConfigurationOverlay } from '@/components/views/admin/resources/Sub-funcionalidades/EditConfigurationOverlay';
import { FullRosterOverlay } from '@/components/views/admin/resources/Sub-funcionalidades/FullRosterOverlay';
import { InventoryActionOverlay } from '@/components/views/admin/resources/Sub-funcionalidades/InventoryActionOverlay';
import { InventoryMapOverlay } from '@/components/views/admin/resources/Sub-funcionalidades/InventoryMapOverlay';
import { StaffingManageOverlay } from '@/components/views/admin/resources/Sub-funcionalidades/StaffingManageOverlay';
import {
  DepartmentResourceItem,
  InventoryResourceItem,
  ResourceConfiguration,
  StaffRosterItem,
  StaffingProfileItem,
} from '@/components/views/admin/resources/Sub-funcionalidades/types';
import {
  createAdminResourceDepartment,
  createAdminResourceInventory,
  createAdminResourceStaffing,
  deleteAdminResourceDepartment,
  deleteAdminResourceInventory,
  deleteAdminResourceStaffing,
  getAdminOperationalRoster,
  getAdminResourceDepartments,
  getAdminResourceInventory,
  getAdminResourceStaffing,
  getAdminResourceSummary,
  HospitalDepartmentResourceResponse,
  HospitalInventoryItemResponse,
  HospitalResourceSummaryResponse,
  HospitalStaffingProfileResponse,
  OperationalContactResponse,
  updateAdminResourceDepartment,
  updateAdminResourceInventory,
  updateAdminResourceStaffing,
  updateAdminResourceSummary,
} from '@/lib/adminOperational';
import { initialsFromName } from '@/lib/format';
import { useTranslation } from '@/i18n';
import { getHospitalAdminLabel, isSpanish } from '@/components/views/admin/localization';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

export function AdminResources() {
  const router = useRouter();
  const { logout, profile } = useAuth();
  const { language } = useTranslation();
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditConfigurationOpen, setIsEditConfigurationOpen] = useState(false);
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [isStaffingManageOpen, setIsStaffingManageOpen] = useState(false);
  const [isInventoryMapOpen, setIsInventoryMapOpen] = useState(false);
  const [departmentMode, setDepartmentMode] = useState<'create' | 'edit'>('edit');
  const [inventoryMode, setInventoryMode] = useState<'create' | 'edit'>('edit');
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentResourceItem | null>(null);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryResourceItem | null>(null);
  const [summary, setSummary] = useState<HospitalResourceSummaryResponse | null>(null);
  const [departmentsRaw, setDepartmentsRaw] = useState<HospitalDepartmentResourceResponse[]>([]);
  const [staffingRaw, setStaffingRaw] = useState<HospitalStaffingProfileResponse[]>([]);
  const [inventoryRaw, setInventoryRaw] = useState<HospitalInventoryItemResponse[]>([]);
  const [rosterRaw, setRosterRaw] = useState<OperationalContactResponse[]>([]);

  const loadResources = useCallback(async () => {
    setLoadState((current) => (current === 'success' ? 'success' : 'loading'));
    setError(null);
    try {
      const [
        summaryResponse,
        departmentsResponse,
        staffingResponse,
        inventoryResponse,
        rosterResponse,
      ] = await Promise.all([
        getAdminResourceSummary(),
        getAdminResourceDepartments(),
        getAdminResourceStaffing(),
        getAdminResourceInventory(),
        getAdminOperationalRoster(),
      ]);
      setSummary(summaryResponse.data);
      setDepartmentsRaw(departmentsResponse.data);
      setStaffingRaw(staffingResponse.data);
      setInventoryRaw(inventoryResponse.data);
      setRosterRaw(rosterResponse.data);
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
  const inventoryItems = useMemo(() => inventoryRaw.map(mapInventoryItem), [inventoryRaw]);
  const roster = useMemo(() => rosterRaw.map(mapOperationalContactToRoster), [rosterRaw]);
  const resourceConfiguration = useMemo(
    () => buildResourceConfiguration(summary, staffingRaw, departmentsRaw),
    [summary, staffingRaw, departmentsRaw],
  );

  const totalBeds = summary?.totalBeds ?? 0;
  const occupiedBeds = totalBeds - (summary?.availableBeds ?? 0);
  const availableBeds = summary?.availableBeds ?? 0;
  const availableBedPercentage = totalBeds > 0 ? Number(((availableBeds / totalBeds) * 100).toFixed(1)) : 0;
  const totalSpecialists = staffingRaw.reduce((sum, profile) => sum + profile.headcount, 0);
  const criticalInventoryCount = inventoryRaw.filter(
    (item) => item.currentQuantity <= item.criticalThreshold || item.status.toUpperCase().includes('CRITICAL'),
  ).length;
  const criticalDepartmentsCount = departmentsRaw.filter(
    (department) => department.status.toUpperCase().includes('CRITICAL'),
  ).length;

  const columns = [
    { key: 'department', label: 'Department' },
    { key: 'total', label: 'Total', align: 'center' as const },
    { key: 'occupied', label: 'Occupied', align: 'center' as const },
    { key: 'utilization', label: 'Utilization' },
    { key: 'status', label: 'Status', align: 'center' as const },
    { key: 'action', label: 'Action', align: 'right' as const },
  ];

  const rows = departments.map((department) => {
    const departmentTotalBeds = parseInteger(department.totalBeds);
    const departmentOccupiedBeds = parseInteger(department.occupiedBeds);
    const utilization = departmentTotalBeds > 0 ? Math.round((departmentOccupiedBeds / departmentTotalBeds) * 100) : 0;

    return {
      department: (
        <View>
          <Text style={styles.departmentName}>{department.name}</Text>
          <Text style={styles.departmentLevel}>{department.level || department.code}</Text>
        </View>
      ),
      total: department.totalBeds,
      occupied: department.occupiedBeds,
      utilization: (
        <UtilizationCell
          value={`${utilization}%`}
          progress={utilization}
          color={department.status === 'Critical' ? '#F04B4B' : department.status === 'Stable' ? '#1718C7' : '#F2B300'}
        />
      ),
      status: <StatusBadge label={department.status} variant={mapDepartmentStatus(department.status)} />,
      action: (
        <TouchableOpacity
          onPress={() => {
            setDepartmentMode('edit');
            setSelectedDepartment(department);
          }}
          activeOpacity={0.75}
        >
          <Text style={styles.manageLink}>Manage</Text>
        </TouchableOpacity>
      ),
    };
  });

  const staffingRows = staffingProfiles.map((profile) => ({
    role: (
      <View>
        <Text style={styles.departmentName}>{profile.roleName}</Text>
        <Text style={styles.departmentLevel}>{profile.roleCode}</Text>
      </View>
    ),
    headcount: profile.headcount,
    onShift: profile.onShiftCount,
    onCall: profile.onCallCount,
    standby: profile.standbyCount,
  }));

  return (
    <DashboardLayout
      active="resources"
      sectionLabel={isSpanish(language) ? 'Recursos' : 'Resources'}
      userName={profile?.fullName ?? getHospitalAdminLabel(language)}
      userId={profile?.email ?? undefined}
      avatarText={initialsFromName(profile?.fullName)}
      links={adminNavigationLinks}
      sidebarItems={adminSidebarItems}
      onLogout={async () => {
        await logout();
        router.replace('/login');
      }}
    >
      <>
        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <View style={styles.heroStrip}>
              <View style={styles.heroCopy}>
                <Text style={styles.heroEyebrow}>{isSpanish(language) ? 'Operaciones hospitalarias' : 'Hospital Operations'}</Text>
                <Text style={styles.heroTitle}>{isSpanish(language) ? 'Gestion de recursos' : 'Resource Management'}</Text>
                <Text style={styles.heroDescription}>
                  {isSpanish(language)
                    ? 'Monitorea y administra la capacidad hospitalaria, el personal y el estado del inventario.'
                    : 'Monitor and manage hospital capacity, staffing, and inventory status.'}
                </Text>
              </View>
              <Button
                label={saving ? (isSpanish(language) ? 'Guardando...' : 'Saving...') : (isSpanish(language) ? 'Editar configuracion' : 'Edit Configuration')}
                variant="secondary"
                size="sm"
                onPress={() => setIsEditConfigurationOpen(true)}
              />
            </View>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>{isSpanish(language) ? 'Estado de capacidad' : 'Capacity Status'}</Text>
              </View>
            </View>

            {error ? (
              <CardBase style={styles.errorCard}>
                <Text style={styles.errorTitle}>{isSpanish(language) ? 'Problema del servicio de recursos' : 'Resource service issue'}</Text>
                <Text style={styles.errorText}>{error}</Text>
              </CardBase>
            ) : null}

            {loadState === 'loading' && !summary ? (
              <CardBase style={styles.loadingCard}>
                <ActivityIndicator color="#1718C7" />
                <Text style={styles.loadingText}>{isSpanish(language) ? 'Cargando recursos operativos...' : 'Loading operational resources...'}</Text>
              </CardBase>
            ) : (
              <>
                <View style={styles.summaryStrip}>
                  <CardBase style={styles.summaryTile}>
                    <Text style={styles.summaryTileLabel}>{isSpanish(language) ? 'Departamentos monitoreados' : 'Monitored Departments'}</Text>
                    <Text style={styles.summaryTileValue}>{departments.length}</Text>
                  </CardBase>
                  <CardBase style={styles.summaryTile}>
                    <Text style={styles.summaryTileLabel}>{isSpanish(language) ? 'Categorias de especialistas' : 'Specialist Categories'}</Text>
                    <Text style={styles.summaryTileValue}>{staffingRaw.length}</Text>
                  </CardBase>
                  <CardBase style={styles.summaryTile}>
                    <Text style={styles.summaryTileLabel}>{isSpanish(language) ? 'Contactos operativos' : 'Operational Contacts'}</Text>
                    <Text style={styles.summaryTileValue}>{roster.length}</Text>
                  </CardBase>
                </View>

                <View style={styles.alertsColumn}>
                  {availableBedPercentage < 25 ? (
                    <InlineWarningBanner
                      variant="critical"
                      title={isSpanish(language) ? 'Alerta de capacidad' : 'Capacity alert'}
                      message={isSpanish(language)
                        ? `Solo quedan ${availableBeds} camas disponibles en el hospital. Considera abrir capacidad de desborde.`
                        : `Only ${availableBeds} beds remain available across the hospital. Consider opening overflow capacity.`}
                    />
                  ) : null}
                  {criticalInventoryCount > 0 || criticalDepartmentsCount > 0 ? (
                    <InlineWarningBanner
                      variant="warning"
                      title={isSpanish(language) ? 'Monitoreo automatico activo' : 'Automatic monitoring active'}
                      message={isSpanish(language)
                        ? `${criticalDepartmentsCount} departamento(s) critico(s) y ${criticalInventoryCount} articulo(s) critico(s) de inventario requieren atencion.`
                        : `${criticalDepartmentsCount} critical department(s) and ${criticalInventoryCount} critical inventory item(s) currently need attention.`}
                    />
                  ) : null}
                </View>

                <View style={styles.capacityRow}>
                  <BedCapacitySummaryCard
                    title={isSpanish(language) ? 'Camas totales' : 'Total Beds'}
                    value={String(totalBeds)}
                    unitText={isSpanish(language) ? 'unidades' : 'units'}
                    trendText={isSpanish(language) ? `Corte ${summary?.source ?? 'MANUAL'}` : `Snapshot ${summary?.source ?? 'MANUAL'}`}
                    style={styles.capacityCard}
                  />
                  <CardBase style={[styles.capacityCard, styles.availableCard]}>
                    <Text style={styles.capacityTitle}>{isSpanish(language) ? 'Camas disponibles' : 'Available Beds'}</Text>
                    <View style={styles.availableValueRow}>
                      <Text style={styles.availableValue}>{availableBeds}</Text>
                      <Text style={styles.availableUnits}>{isSpanish(language) ? 'unidades' : 'units'}</Text>
                    </View>
                    <View style={styles.availableProgressRow}>
                      <ProgressBar
                        value={availableBedPercentage}
                        color="#1718C7"
                        trackColor="#E9EDF6"
                        style={styles.availableProgress}
                      />
                      <Text style={styles.availablePercent}>{availableBedPercentage}%</Text>
                    </View>
                  </CardBase>
                  <BedCapacitySummaryCard
                    title={isSpanish(language) ? 'Camas ocupadas' : 'Occupied Beds'}
                    value={String(occupiedBeds)}
                    unitText={isSpanish(language) ? 'unidades' : 'units'}
                    statusText={criticalDepartmentsCount > 0
                      ? (isSpanish(language) ? 'Alta demanda en areas criticas' : 'High demand in critical areas')
                      : (isSpanish(language) ? 'Dentro del rango esperado' : 'Within expected range')}
                    variant={criticalDepartmentsCount > 0 ? 'critical' : 'default'}
                    valueColorOverride="#0F172A"
                    statusColorOverride={criticalDepartmentsCount > 0 ? '#F04B4B' : '#526174'}
                    style={styles.capacityCard}
                  />
                </View>

                <View style={styles.middleRow}>
                  <CardBase style={styles.staffingPanel}>
                    <View style={styles.panelHeader}>
                      <View style={styles.panelHeaderTitle}>
                        <MaterialCommunityIcons name="account-group-outline" size={18} color="#1718C7" />
                        <Text style={styles.panelTitle}>Staffing (Active Shift)</Text>
                      </View>
                      <View style={styles.tableActions}>
                        <View style={styles.liveBadge}>
                        <Text style={styles.liveBadgeText}>LIVE</Text>
                        </View>
                        <Button label="Manage" variant="ghost" size="sm" onPress={() => setIsStaffingManageOpen(true)} />
                      </View>
                    </View>

                    <View style={styles.panelBody}>
                      <StaffingStatusCard
                        title="Doctors on Shift"
                        subtitle={`${resourceConfiguration.doctors} total doctors configured`}
                        value={String(summary?.doctorsOnShift ?? 0)}
                        variant="doctor"
                        valueColor="#0F172A"
                        icon={<MaterialCommunityIcons name="stethoscope" size={16} color="#4B7BFF" />}
                        iconBackgroundColor="#EAF1FF"
                        style={styles.staffingItem}
                      />
                      <StaffingStatusCard
                        title="Nurses on Shift"
                        subtitle={`${resourceConfiguration.nurses} nursing staff configured`}
                        value={String(summary?.nursesOnShift ?? 0)}
                        variant="nurse"
                        valueColor="#0F172A"
                        icon={<MaterialCommunityIcons name="medical-bag" size={16} color="#35C86B" />}
                        iconBackgroundColor="#E8FBEE"
                        style={styles.staffingItem}
                      />
                      <StaffingStatusCard
                        title="Available Specialists"
                        subtitle={`${staffingRaw.length} specialty profiles tracked`}
                        value={String(totalSpecialists).padStart(2, '0')}
                        variant="specialist"
                        highlightColor="#FACC15"
                        valueColor="#0F172A"
                        icon={<MaterialCommunityIcons name="sprout" size={16} color="#F2B300" />}
                        iconBackgroundColor="#FFF6D9"
                        style={styles.staffingItem}
                      />
                    </View>

                    <Button
                      label="View Full Roster"
                      variant="surface"
                      size="sm"
                      style={styles.panelButton}
                      onPress={() => setIsRosterOpen(true)}
                    />
                  </CardBase>

                  <CardBase style={styles.inventoryPanel}>
                    <View style={styles.panelHeader}>
                      <View style={styles.panelHeaderTitle}>
                        <MaterialCommunityIcons name="clipboard-pulse-outline" size={18} color="#1718C7" />
                        <Text style={styles.panelTitle}>Critical Inventory</Text>
                      </View>
                      <View style={styles.tableActions}>
                        <Button
                          label="Add Item"
                          variant="ghost"
                          size="sm"
                          labelStyle={styles.inventoryAction}
                          onPress={() => {
                            setInventoryMode('create');
                            setSelectedInventoryItem(null);
                          }}
                        />
                        <Button
                          label="View Locations"
                          variant="ghost"
                          size="sm"
                          labelStyle={styles.inventoryAction}
                          onPress={() => setIsInventoryMapOpen(true)}
                        />
                      </View>
                    </View>

                    <View style={styles.inventoryList}>
                      {inventoryItems.map((item) => (
                        <InventoryProgressCard
                          key={item.id}
                          title={item.title}
                          valueText={item.valueText}
                          valueTextColor={item.tone === 'critical' ? '#F04B4B' : undefined}
                          progress={item.progress}
                          variant={item.tone === 'critical' ? 'critical' : 'normal'}
                          icon={
                            <MaterialCommunityIcons
                              name={item.category.toLowerCase().includes('oxygen') ? 'molecule' : item.category.toLowerCase().includes('vaccine') ? 'needle' : 'medical-bag'}
                              size={14}
                              color={item.tone === 'critical' ? '#F04B4B' : '#1718C7'}
                            />
                          }
                          actionLabel="Manage Item"
                          actionPlacement="below"
                          actionVariant="secondary"
                          progressFillColor={item.tone === 'critical' ? '#F04B4B' : '#1718C7'}
                          progressTrackColor={item.tone === 'critical' ? '#F9D8D8' : '#E8EDF5'}
                          onAction={() => {
                            setInventoryMode('edit');
                            setSelectedInventoryItem(item);
                          }}
                          style={styles.inventoryItem}
                        />
                      ))}
                    </View>
                  </CardBase>
                </View>

                <CardBase style={styles.tablePanel}>
                  <View style={styles.tableHeader}>
                    <Text style={styles.tableTitle}>Bed Availability by Department</Text>
                    <View style={styles.tableActions}>
                      <Button
                        label="Add Department"
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
                        leadingIcon={<Feather name="refresh-cw" size={14} color="#94A3B8" />}
                        style={styles.iconButton}
                        onPress={() => void loadResources()}
                      />
                    </View>
                  </View>

                  <DataTable columns={columns} rows={rows} compact style={styles.table} />
                </CardBase>

                <CardBase style={styles.tablePanel}>
                  <View style={styles.tableHeader}>
                    <Text style={styles.tableTitle}>Staffing Profiles</Text>
                    <View style={styles.tableActions}>
                      <Button label="Manage Staffing" variant="ghost" size="sm" onPress={() => setIsStaffingManageOpen(true)} />
                    </View>
                  </View>
                  <DataTable
                    compact
                    style={styles.table}
                    columns={[
                      { key: 'role', label: 'Role' },
                      { key: 'headcount', label: 'Headcount', align: 'center' },
                      { key: 'onShift', label: 'On Shift', align: 'center' },
                      { key: 'onCall', label: 'On Call', align: 'center' },
                      { key: 'standby', label: 'Standby', align: 'center' },
                    ]}
                    rows={staffingRows}
                  />
                </CardBase>
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
              setError(nextError instanceof Error ? nextError.message : isSpanish(language) ? 'No se pudo guardar la configuracion de recursos.' : 'Unable to save the resource configuration.');
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

        <FullRosterOverlay visible={isRosterOpen} roster={roster} onClose={() => setIsRosterOpen(false)} />

        <InventoryMapOverlay visible={isInventoryMapOpen} inventory={inventoryItems} onClose={() => setIsInventoryMapOpen(false)} />

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
              setError(nextError instanceof Error ? nextError.message : isSpanish(language) ? 'No se pudo guardar el articulo de inventario.' : 'Unable to save the inventory item.');
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
              setError(nextError instanceof Error ? nextError.message : isSpanish(language) ? 'No se pudo eliminar el articulo de inventario.' : 'Unable to delete the inventory item.');
            } finally {
              setDeleting(false);
            }
          }}
        />
      </>
    </DashboardLayout>
  );
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

function mapInventoryItem(item: HospitalInventoryItemResponse): InventoryResourceItem {
  const progress = item.capacityQuantity > 0 ? Math.round((item.currentQuantity / item.capacityQuantity) * 100) : 0;
  const critical = item.currentQuantity <= item.criticalThreshold || item.status.toUpperCase().includes('CRITICAL');
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
    tone: critical ? 'critical' : 'normal',
    actionLabel: critical ? 'Order More Now' : item.targetQuantity > item.currentQuantity ? 'Order Refill' : 'Manage Supply',
    actionType: critical ? 'order' : item.targetQuantity > item.currentQuantity ? 'refill' : 'manage',
    location: item.location,
    targetLevel: `${item.targetQuantity}${item.unit ? ` ${item.unit}` : ''}`,
  };
}

function mapOperationalContactToRoster(contact: OperationalContactResponse): StaffRosterItem {
  const availability = normalizeAvailability(contact.availabilityStatus);
  return {
    id: contact.id,
    name: contact.displayName,
    role: contact.roleLabel,
    department: humanizeCode(contact.departmentCode ?? 'UNASSIGNED'),
    shift: contact.updatedAt ? `Directory updated ${formatTimestamp(contact.updatedAt)}` : 'Directory availability record',
    availability,
    contactChannel: contact.contactChannel ?? undefined,
    contactValue: contact.contactValue ?? undefined,
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

function normalizeAvailability(status: string): StaffRosterItem['availability'] {
  const value = status.toUpperCase();
  if (value.includes('SHIFT')) return 'On Shift';
  if (value.includes('CALL')) return 'On Call';
  if (value.includes('STANDBY')) return 'Standby';
  return 'Unavailable';
}

function humanizeCode(value: string) {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
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
      <ProgressBar value={progress} color={color} trackColor="#E9EDF6" style={styles.utilizationBar} />
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
    color: '#0F172A',
  },
  sectionAction: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#1718C7',
  },
  errorCard: {
    borderColor: '#FDD2D2',
    backgroundColor: '#FFF7F7',
  },
  errorTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    color: '#991B1B',
  },
  errorText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: '#B91C1C',
  },
  loadingCard: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 28,
  },
  loadingText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#526174',
  },
  summaryStrip: {
    flexDirection: 'row',
    gap: 14,
  },
  summaryTile: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
  },
  summaryTileLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: '#70839B',
  },
  summaryTileValue: {
    marginTop: 8,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '900',
    color: '#0F172A',
  },
  alertsColumn: {
    gap: 12,
  },
  capacityRow: {
    flexDirection: 'row',
    gap: 16,
  },
  capacityCard: {
    flex: 1,
  },
  availableCard: {
    padding: 20,
    gap: 12,
  },
  capacityTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  availableValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  availableValue: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '900',
    color: '#0F172A',
  },
  availableUnits: {
    fontSize: 13,
    lineHeight: 18,
    color: '#70839B',
    marginBottom: 4,
  },
  availableProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  availableProgress: {
    flex: 1,
  },
  availablePercent: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: '#1718C7',
  },
  middleRow: {
    flexDirection: 'row',
    gap: 16,
  },
  staffingPanel: {
    flex: 1,
    padding: 0,
    overflow: 'hidden',
  },
  inventoryPanel: {
    flex: 1,
    padding: 0,
    overflow: 'hidden',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
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
    color: '#0F172A',
  },
  liveBadge: {
    borderRadius: 8,
    backgroundColor: '#E9EAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveBadgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '800',
    color: '#1718C7',
  },
  panelBody: {
    padding: 18,
    flex: 1,
    gap: 12,
  },
  staffingItem: {
    minHeight: 108,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3E8F2',
  },
  panelButton: {
    marginHorizontal: 18,
    marginTop: 2,
    marginBottom: 12,
    minHeight: 42,
  },
  inventoryAction: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#1718C7',
  },
  inventoryList: {
    padding: 18,
    gap: 14,
    flex: 1,
  },
  inventoryItem: {
    paddingHorizontal: 13,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#DCE4F0',
    borderRadius: 12,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: '#FCFDFF',
  },
  tablePanel: {
    padding: 0,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
  },
  tableTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    color: '#0F172A',
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
    borderRadius: 12,
  },
  departmentName: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  departmentLevel: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 14,
    color: '#97A6BA',
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
    color: '#0F172A',
  },
  manageLink: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#1718C7',
  },
});

export default AdminResources;
export const heroStripStylesForTesting = styles;
