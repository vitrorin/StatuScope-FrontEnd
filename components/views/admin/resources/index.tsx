import React, { useMemo, useState } from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
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
import {
  EditConfigurationOverlay,
} from '@/components/views/admin/resources/Sub-funcionalidades/EditConfigurationOverlay';
import { FullRosterOverlay } from '@/components/views/admin/resources/Sub-funcionalidades/FullRosterOverlay';
import { InventoryActionOverlay } from '@/components/views/admin/resources/Sub-funcionalidades/InventoryActionOverlay';
import { InventoryMapOverlay } from '@/components/views/admin/resources/Sub-funcionalidades/InventoryMapOverlay';
import {
  defaultDepartments,
  defaultInventory,
  defaultResourceConfiguration,
  defaultRoster,
  DepartmentResourceItem,
  InventoryResourceItem,
  ResourceConfiguration,
  StaffRosterItem,
} from '@/components/views/admin/resources/Sub-funcionalidades/types';

export function AdminResources() {
  const router = useRouter();
  const [isEditConfigurationOpen, setIsEditConfigurationOpen] = useState(false);
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [isInventoryMapOpen, setIsInventoryMapOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentResourceItem | null>(null);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryResourceItem | null>(null);
  const [resourceConfiguration, setResourceConfiguration] = useState<ResourceConfiguration>(
    defaultResourceConfiguration
  );
  const [departments, setDepartments] = useState<DepartmentResourceItem[]>(defaultDepartments);
  const [roster] = useState<StaffRosterItem[]>(defaultRoster);
  const [inventoryItems, setInventoryItems] = useState<InventoryResourceItem[]>(defaultInventory);

  const totalBeds = parseInteger(resourceConfiguration.totalBeds);
  const occupiedBeds = useMemo(
    () => departments.reduce((sum, department) => sum + parseInteger(department.occupiedBeds), 0),
    [departments]
  );
  const availableBeds = Math.max(totalBeds - occupiedBeds, 0);
  const availableBedPercentage = totalBeds > 0 ? Number(((availableBeds / totalBeds) * 100).toFixed(1)) : 0;
  const totalSpecialists = useMemo(
    () =>
      parseInteger(resourceConfiguration.neurologists) +
      parseInteger(resourceConfiguration.cardiologists) +
      parseInteger(resourceConfiguration.pediatricians) +
      parseInteger(resourceConfiguration.surgeons) +
      parseInteger(resourceConfiguration.anesthesiologists) +
      parseInteger(resourceConfiguration.radiologists) +
      parseInteger(resourceConfiguration.pulmonologists) +
      parseInteger(resourceConfiguration.infectiousDiseaseSpecialists) +
      parseInteger(resourceConfiguration.emergencyPhysicians),
    [resourceConfiguration]
  );
  const criticalInventoryCount = useMemo(
    () => inventoryItems.filter((item) => item.tone === 'critical' || item.progress < 25).length,
    [inventoryItems]
  );
  const criticalDepartmentsCount = useMemo(
    () => departments.filter((department) => department.status === 'Critical').length,
    [departments]
  );

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
      userName="Dr. Sarah Chen"
      userId="ID: 442910"
      avatarText="SC"
      links={adminNavigationLinks}
      sidebarItems={adminSidebarItems}
      onLogout={() => router.replace('/')}
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
                label="Edit Configuration"
                variant="ghost"
                size="sm"
                labelStyle={styles.sectionAction}
                onPress={() => setIsEditConfigurationOpen(true)}
              />
            </View>

            <View style={styles.summaryStrip}>
              <CardBase style={styles.summaryTile}>
                <Text style={styles.summaryTileLabel}>Monitored Departments</Text>
                <Text style={styles.summaryTileValue}>{departments.length}</Text>
              </CardBase>
              <CardBase style={styles.summaryTile}>
                <Text style={styles.summaryTileLabel}>Specialist Categories</Text>
                <Text style={styles.summaryTileValue}>9</Text>
              </CardBase>
              <CardBase style={styles.summaryTile}>
                <Text style={styles.summaryTileLabel}>Total Personnel</Text>
                <Text style={styles.summaryTileValue}>{resourceConfiguration.totalPersonnel}</Text>
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
                trendText="+12 this month"
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
                statusText="High demand in ICU"
                variant="critical"
                valueColorOverride="#0F172A"
                statusColorOverride="#F04B4B"
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
                    value={resourceConfiguration.doctors || '0'}
                    variant="doctor"
                    valueColor="#0F172A"
                    icon={<MaterialCommunityIcons name="stethoscope" size={16} color="#4B7BFF" />}
                    iconBackgroundColor="#EAF1FF"
                    style={styles.staffingItem}
                  />
                  <StaffingStatusCard
                    title="Nurses on Shift"
                    subtitle={`${resourceConfiguration.nurses} nursing staff configured`}
                    value={resourceConfiguration.nurses || '0'}
                    variant="nurse"
                    valueColor="#0F172A"
                    icon={<MaterialCommunityIcons name="medical-bag" size={16} color="#35C86B" />}
                    iconBackgroundColor="#E8FBEE"
                    style={styles.staffingItem}
                  />
                  <StaffingStatusCard
                    title="Available Specialists"
                    subtitle={`${resourceConfiguration.neurologists} neurologists + hospital specialties`}
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
                            item.id === 'oxygen'
                              ? 'molecule'
                              : item.id === 'vaccines'
                                ? 'needle'
                                : 'medical-bag'
                          }
                          size={14}
                          color={item.tone === 'critical' ? '#F04B4B' : item.id === 'medications' ? '#5B63E2' : '#1718C7'}
                        />
                      }
                      actionLabel={item.actionLabel}
                      actionPlacement="below"
                      actionVariant={item.actionType === 'order' ? 'primary' : 'secondary'}
                      progressFillColor={item.tone === 'critical' ? '#F04B4B' : item.id === 'medications' ? '#5B63E2' : '#1718C7'}
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
                    leadingIcon={<Feather name="filter" size={14} color="#94A3B8" />}
                    style={styles.iconButton}
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    leadingIcon={<Feather name="download" size={14} color="#94A3B8" />}
                    style={styles.iconButton}
                  />
                </View>
              </View>

              <DataTable columns={columns} rows={rows} compact style={styles.table} />
            </CardBase>
          </View>
        </ScrollView>

        <EditConfigurationOverlay
          visible={isEditConfigurationOpen}
          value={resourceConfiguration}
          departments={departments}
          onClose={() => setIsEditConfigurationOpen(false)}
          onSave={(nextValue) => {
            setResourceConfiguration(nextValue);
            setIsEditConfigurationOpen(false);
          }}
        />
        <DepartmentManageOverlay
          visible={selectedDepartment !== null}
          department={selectedDepartment}
          onClose={() => setSelectedDepartment(null)}
          onSave={(nextDepartment) => {
            setDepartments((current) =>
              current.map((department) => (department.id === nextDepartment.id ? nextDepartment : department))
            );
            setSelectedDepartment(null);
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
          onConfirm={() => {
            if (!selectedInventoryItem) return;

            setInventoryItems((current) =>
              current.map((item) => {
                if (item.id !== selectedInventoryItem.id) return item;

                const boostedProgress = Math.min(item.progress + (item.tone === 'critical' ? 22 : 12), 100);
                return {
                  ...item,
                  progress: boostedProgress,
                  tone: boostedProgress < 25 ? 'critical' : 'normal',
                  valueText:
                    item.id === 'oxygen'
                      ? `${Math.round((boostedProgress / 100) * 1000)}L / 1000L`
                      : item.id === 'vaccines'
                        ? boostedProgress < 25
                          ? `Critical ${boostedProgress}%`
                          : `${boostedProgress}% in stock`
                        : `${boostedProgress}% in stock`,
                };
              })
            );
            setSelectedInventoryItem(null);
          }}
        />
      </>
    </DashboardLayout>
  );
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
