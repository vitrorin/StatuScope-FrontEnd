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
import {
  DepartmentResourceItem,
  InventoryResourceItem,
  ResourceConfiguration,
  StaffRosterItem,
} from '@/components/views/admin/resources/Sub-funcionalidades/types';
import {
  getAdminResourceDepartments,
  getAdminResourceInventory,
  getAdminResourceStaffing,
  getAdminResourceSummary,
  HospitalDepartmentResourceResponse,
  HospitalInventoryItemResponse,
  HospitalResourceSummaryResponse,
  HospitalStaffingProfileResponse,
  updateAdminResourceDepartment,
  updateAdminResourceInventory,
  updateAdminResourceStaffing,
  updateAdminResourceSummary,
} from '@/lib/adminOperational';
import { initialsFromName } from '@/lib/format';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

export function AdminResources() {
  const router = useRouter();
  const { logout, profile } = useAuth();
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditConfigurationOpen, setIsEditConfigurationOpen] = useState(false);
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [isInventoryMapOpen, setIsInventoryMapOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentResourceItem | null>(null);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryResourceItem | null>(null);
  const [summary, setSummary] = useState<HospitalResourceSummaryResponse | null>(null);
  const [departmentsRaw, setDepartmentsRaw] = useState<HospitalDepartmentResourceResponse[]>([]);
  const [staffingRaw, setStaffingRaw] = useState<HospitalStaffingProfileResponse[]>([]);
  const [inventoryRaw, setInventoryRaw] = useState<HospitalInventoryItemResponse[]>([]);

  const loadResources = useCallback(async () => {
    setLoadState((current) => (current === 'success' ? 'success' : 'loading'));
    setError(null);
    try {
      const [summaryResponse, departmentsResponse, staffingResponse, inventoryResponse] = await Promise.all([
        getAdminResourceSummary(),
        getAdminResourceDepartments(),
        getAdminResourceStaffing(),
        getAdminResourceInventory(),
      ]);
      setSummary(summaryResponse.data);
      setDepartmentsRaw(departmentsResponse.data);
      setStaffingRaw(staffingResponse.data);
      setInventoryRaw(inventoryResponse.data);
      setLoadState('success');
    } catch (nextError) {
      setLoadState('error');
      setError(nextError instanceof Error ? nextError.message : 'Unable to load hospital resources.');
    }
  }, []);

  useEffect(() => {
    void loadResources();
  }, [loadResources]);

  const departments = useMemo(() => departmentsRaw.map(mapDepartment), [departmentsRaw]);
  const inventoryItems = useMemo(() => inventoryRaw.map(mapInventoryItem), [inventoryRaw]);
  const roster = useMemo(() => staffingRaw.flatMap(mapStaffingProfileToRoster), [staffingRaw]);
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
          <Text style={styles.departmentLevel}>{department.level}</Text>
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
        <TouchableOpacity onPress={() => setSelectedDepartment(department)} activeOpacity={0.75}>
          <Text style={styles.manageLink}>Manage</Text>
        </TouchableOpacity>
      ),
    };
  });

  return (
    <DashboardLayout
      active="resources"
      sectionLabel="Resources"
      searchPlaceholder="Search beds, inventory..."
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
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <MaterialCommunityIcons name="bed-outline" size={18} color="#1718C7" />
                <Text style={styles.sectionTitle}>Bed Capacity Status</Text>
              </View>
              <Button
                label={saving ? 'Saving...' : 'Edit Configuration'}
                variant="ghost"
                size="sm"
                labelStyle={styles.sectionAction}
                onPress={() => setIsEditConfigurationOpen(true)}
              />
            </View>

            {error ? (
              <CardBase style={styles.errorCard}>
                <Text style={styles.errorTitle}>Resource service issue</Text>
                <Text style={styles.errorText}>{error}</Text>
              </CardBase>
            ) : null}

            {loadState === 'loading' && !summary ? (
              <CardBase style={styles.loadingCard}>
                <ActivityIndicator color="#1718C7" />
                <Text style={styles.loadingText}>Loading operational resources...</Text>
              </CardBase>
            ) : (
              <>
                <View style={styles.summaryStrip}>
                  <CardBase style={styles.summaryTile}>
                    <Text style={styles.summaryTileLabel}>Monitored Departments</Text>
                    <Text style={styles.summaryTileValue}>{departments.length}</Text>
                  </CardBase>
                  <CardBase style={styles.summaryTile}>
                    <Text style={styles.summaryTileLabel}>Specialist Categories</Text>
                    <Text style={styles.summaryTileValue}>{staffingRaw.length}</Text>
                  </CardBase>
                  <CardBase style={styles.summaryTile}>
                    <Text style={styles.summaryTileLabel}>Total Personnel</Text>
                    <Text style={styles.summaryTileValue}>{staffingRaw.reduce((sum, profile) => sum + profile.headcount, 0)}</Text>
                  </CardBase>
                </View>

                <View style={styles.alertsColumn}>
                  {availableBedPercentage < 25 ? (
                    <InlineWarningBanner
                      variant="critical"
                      title="Capacity alert"
                      message={`Only ${availableBeds} beds remain available across the hospital. Consider opening overflow capacity.`}
                    />
                  ) : null}
                  {criticalInventoryCount > 0 || criticalDepartmentsCount > 0 ? (
                    <InlineWarningBanner
                      variant="warning"
                      title="Automatic monitoring active"
                      message={`${criticalDepartmentsCount} critical department(s) and ${criticalInventoryCount} critical inventory item(s) currently need attention.`}
                    />
                  ) : null}
                </View>

                <View style={styles.capacityRow}>
                  <BedCapacitySummaryCard
                    title="Total Beds"
                    value={String(totalBeds)}
                    unitText="units"
                    trendText={`Snapshot ${summary?.source ?? 'MANUAL'}`}
                    style={styles.capacityCard}
                  />
                  <CardBase style={[styles.capacityCard, styles.availableCard]}>
                    <Text style={styles.capacityTitle}>Available Beds</Text>
                    <View style={styles.availableValueRow}>
                      <Text style={styles.availableValue}>{availableBeds}</Text>
                      <Text style={styles.availableUnits}>units</Text>
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
                    title="Occupied Beds"
                    value={String(occupiedBeds)}
                    unitText="units"
                    statusText={criticalDepartmentsCount > 0 ? 'High demand in critical areas' : 'Within expected range'}
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
                      <View style={styles.liveBadge}>
                        <Text style={styles.liveBadgeText}>LIVE</Text>
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
                      <Button
                        label="View Inventory Map"
                        variant="ghost"
                        size="sm"
                        labelStyle={styles.inventoryAction}
                        onPress={() => setIsInventoryMapOpen(true)}
                      />
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
                              name={
                                item.id.includes('oxygen')
                                  ? 'molecule'
                                  : item.id.includes('vaccine')
                                    ? 'needle'
                                    : 'medical-bag'
                              }
                              size={14}
                              color={item.tone === 'critical' ? '#F04B4B' : item.id.includes('med') ? '#5B63E2' : '#1718C7'}
                            />
                          }
                          actionLabel={item.actionLabel}
                          actionPlacement="below"
                          actionVariant={item.actionType === 'order' ? 'primary' : 'secondary'}
                          progressFillColor={item.tone === 'critical' ? '#F04B4B' : item.id.includes('med') ? '#5B63E2' : '#1718C7'}
                          progressTrackColor={item.tone === 'critical' ? '#F9D8D8' : '#E8EDF5'}
                          onAction={() => setSelectedInventoryItem(item)}
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
              setError(nextError instanceof Error ? nextError.message : 'Unable to save the resource configuration.');
            } finally {
              setSaving(false);
            }
          }}
        />
        <DepartmentManageOverlay
          visible={selectedDepartment !== null}
          department={selectedDepartment}
          onClose={() => setSelectedDepartment(null)}
          onSave={async (nextDepartment) => {
            setSaving(true);
            setError(null);
            try {
              await updateAdminResourceDepartment(nextDepartment.id, {
                id: nextDepartment.id,
                departmentCode: nextDepartment.name.toUpperCase().replace(/[^A-Z0-9]+/g, '_'),
                departmentName: nextDepartment.name,
                levelLabel: nextDepartment.level,
                totalBeds: parseInteger(nextDepartment.totalBeds),
                occupiedBeds: parseInteger(nextDepartment.occupiedBeds),
                availableBeds: Math.max(parseInteger(nextDepartment.totalBeds) - parseInteger(nextDepartment.occupiedBeds), 0),
                status: nextDepartment.status.toUpperCase().replace(/\s+/g, '_'),
                notes: nextDepartment.notes,
              });
              await loadResources();
              setSelectedDepartment(null);
            } catch (nextError) {
              setError(nextError instanceof Error ? nextError.message : 'Unable to update the department.');
            } finally {
              setSaving(false);
            }
          }}
        />
        <FullRosterOverlay
          visible={isRosterOpen}
          roster={roster}
          onClose={() => setIsRosterOpen(false)}
        />
        <InventoryMapOverlay
          visible={isInventoryMapOpen}
          inventory={inventoryItems}
          onClose={() => setIsInventoryMapOpen(false)}
        />
        <InventoryActionOverlay
          visible={selectedInventoryItem !== null}
          inventoryItem={selectedInventoryItem}
          onClose={() => setSelectedInventoryItem(null)}
          onConfirm={async (payload) => {
            if (!selectedInventoryItem) return;
            const sourceItem = inventoryRaw.find((item) => item.id === selectedInventoryItem.id);
            if (!sourceItem) return;
            setSaving(true);
            setError(null);
            try {
              const requestedQuantity = Number.parseInt(payload.quantity || '0', 10) || 0;
              const nextQuantity = Math.min(sourceItem.capacityQuantity, sourceItem.currentQuantity + requestedQuantity);
              await updateAdminResourceInventory(sourceItem.id, {
                ...sourceItem,
                currentQuantity: nextQuantity,
                status: nextQuantity <= sourceItem.criticalThreshold ? 'CRITICAL' : payload.priority.toUpperCase(),
              });
              await loadResources();
              setSelectedInventoryItem(null);
            } catch (nextError) {
              setError(nextError instanceof Error ? nextError.message : 'Unable to update the inventory item.');
            } finally {
              setSaving(false);
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
    name: item.departmentName,
    level: item.levelLabel,
    totalBeds: String(item.totalBeds),
    occupiedBeds: String(item.occupiedBeds),
    status: normalizeDepartmentStatus(item.status),
    notes: item.notes,
  };
}

function mapInventoryItem(item: HospitalInventoryItemResponse): InventoryResourceItem {
  const progress = item.capacityQuantity > 0 ? Math.round((item.currentQuantity / item.capacityQuantity) * 100) : 0;
  const critical = item.currentQuantity <= item.criticalThreshold || item.status.toUpperCase().includes('CRITICAL');
  return {
    id: item.id,
    title: item.itemName,
    valueText: `${item.currentQuantity}${item.unit ? ` ${item.unit}` : ''} / ${item.capacityQuantity}${item.unit ? ` ${item.unit}` : ''}`,
    progress,
    tone: critical ? 'critical' : 'normal',
    actionLabel: critical ? 'Order More Now' : item.targetQuantity > item.currentQuantity ? 'Order Refill' : 'Manage Supply',
    actionType: critical ? 'order' : item.targetQuantity > item.currentQuantity ? 'refill' : 'manage',
    location: item.location,
    targetLevel: `${item.targetQuantity}${item.unit ? ` ${item.unit}` : ''}`,
  };
}

function mapStaffingProfileToRoster(profile: HospitalStaffingProfileResponse): StaffRosterItem[] {
  const roster: StaffRosterItem[] = [];
  for (let index = 0; index < profile.onShiftCount; index += 1) {
    roster.push({
      id: `${profile.id}-shift-${index}`,
      name: `${profile.roleName} ${index + 1}`,
      role: profile.roleName,
      department: profile.roleCode.replace(/_/g, ' '),
      shift: 'Active shift',
      availability: 'On Shift',
    });
  }
  for (let index = 0; index < profile.onCallCount; index += 1) {
    roster.push({
      id: `${profile.id}-call-${index}`,
      name: `${profile.roleName} On Call ${index + 1}`,
      role: profile.roleName,
      department: profile.roleCode.replace(/_/g, ' '),
      shift: 'On call',
      availability: 'On Call',
    });
  }
  for (let index = 0; index < profile.standbyCount; index += 1) {
    roster.push({
      id: `${profile.id}-standby-${index}`,
      name: `${profile.roleName} Standby ${index + 1}`,
      role: profile.roleName,
      department: profile.roleCode.replace(/_/g, ' '),
      shift: 'Standby',
      availability: 'Standby',
    });
  }
  return roster;
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
      <ProgressBar value={progress} color={color} trackColor="#EEF2F7" style={styles.utilizationBar} />
      <Text style={styles.utilizationValue}>{value}</Text>
    </View>
  );
}

function mapDepartmentStatus(status: DepartmentResourceItem['status']) {
  switch (status) {
    case 'Critical':
      return 'critical' as const;
    case 'Stable':
      return 'success' as const;
    default:
      return 'warning' as const;
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
  summaryStrip: {
    flexDirection: 'row',
    gap: 14,
  },
  summaryTile: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#FCFDFF',
  },
  summaryTileLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: '#8A9AAF',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  summaryTileValue: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
    color: '#1718C7',
  },
  alertsColumn: {
    gap: 12,
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
    fontSize: 15,
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
  capacityRow: {
    flexDirection: 'row',
    gap: 18,
  },
  capacityCard: {
    flex: 1,
    minHeight: 110,
    borderRadius: 14,
  },
  availableCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#1718C7',
    paddingTop: 14,
  },
  capacityTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#8A9AAF',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  availableValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  availableValue: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '900',
    color: '#1718C7',
    letterSpacing: -1,
  },
  availableUnits: {
    marginLeft: 6,
    fontSize: 16,
    lineHeight: 20,
    color: '#A0AEC0',
  },
  availableProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  availableProgress: {
    flex: 1,
  },
  availablePercent: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#4A43D6',
  },
  middleRow: {
    flexDirection: 'row',
    gap: 18,
  },
  staffingPanel: {
    flex: 1,
    padding: 0,
    overflow: 'hidden',
    minHeight: 332,
  },
  inventoryPanel: {
    flex: 1,
    padding: 0,
    overflow: 'hidden',
    minHeight: 332,
  },
  panelHeader: {
    minHeight: 52,
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
    borderRadius: 6,
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
    justifyContent: 'flex-start',
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
    gap: 8,
  },
  iconButton: {
    width: 32,
    minWidth: 32,
    minHeight: 32,
    borderRadius: 8,
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
