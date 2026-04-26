import React from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { initialsFromName } from '@/lib/format';
import { adminNavigationLinks, adminSidebarItems } from '@/components/dashboard/adminNavigation';
import { Button } from '@/components/foundation/Button';
import { ProgressBar } from '@/components/foundation/ProgressBar';
import { StatusBadge } from '@/components/feedback/StatusBadge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CardBase } from '@/components/patterns/CardBase';
import { BedCapacitySummaryCard } from '@/components/resources/BedCapacitySummaryCard';
import { DataTable } from '@/components/resources/DataTable';
import { InventoryProgressCard } from '@/components/resources/InventoryProgressCard';
import { StaffingStatusCard } from '@/components/resources/StaffingStatusCard';

export function AdminResources() {
  const router = useRouter();
  const { logout, profile } = useAuth();

  const columns = [
    { key: 'department', label: 'Department' },
    { key: 'total', label: 'Total', align: 'center' as const },
    { key: 'occupied', label: 'Occupied', align: 'center' as const },
    { key: 'utilization', label: 'Utilization' },
    { key: 'status', label: 'Status', align: 'center' as const },
    { key: 'action', label: 'Action', align: 'right' as const },
  ];

  const rows = [
    {
      department: (
        <View>
          <Text style={styles.departmentName}>Intensive Care (ICU)</Text>
          <Text style={styles.departmentLevel}>Level 4</Text>
        </View>
      ),
      total: '50',
      occupied: '45',
      utilization: <UtilizationCell value="90%" progress={90} color="#F04B4B" />,
      status: <StatusBadge label="Critical" variant="critical" />,
      action: <Text style={styles.manageLink}>Manage</Text>,
    },
    {
      department: (
        <View>
          <Text style={styles.departmentName}>Emergency Dept (ED)</Text>
          <Text style={styles.departmentLevel}>Level 1</Text>
        </View>
      ),
      total: '120',
      occupied: '82',
      utilization: <UtilizationCell value="68%" progress={68} color="#1718C7" />,
      status: <StatusBadge label="Stable" variant="success" />,
      action: <Text style={styles.manageLink}>Manage</Text>,
    },
    {
      department: (
        <View>
          <Text style={styles.departmentName}>General Ward</Text>
          <Text style={styles.departmentLevel}>Level 2 & 3</Text>
        </View>
      ),
      total: '310',
      occupied: '268',
      utilization: <UtilizationCell value="86%" progress={86} color="#F2B300" />,
      status: <StatusBadge label="High Demand" variant="warning" />,
      action: <Text style={styles.manageLink}>Manage</Text>,
    },
  ];

  return (
    <DashboardLayout
      active="resources"
      sectionLabel="Resources"
      searchPlaceholder="Search beds, inventory..."
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
            />
          </View>

          <View style={styles.capacityRow}>
            <BedCapacitySummaryCard
              title="Total Beds"
              value="580"
              unitText="units"
              trendText="+12 this month"
              style={styles.capacityCard}
            />
            <CardBase style={[styles.capacityCard, styles.availableCard]}>
              <Text style={styles.capacityTitle}>Available Beds</Text>
              <View style={styles.availableValueRow}>
                <Text style={styles.availableValue}>142</Text>
                <Text style={styles.availableUnits}>units</Text>
              </View>
              <View style={styles.availableProgressRow}>
                <ProgressBar value={24.5} color="#1718C7" trackColor="#E9EDF6" style={styles.availableProgress} />
                <Text style={styles.availablePercent}>24.5%</Text>
              </View>
            </CardBase>
            <BedCapacitySummaryCard
              title="Occupied Beds"
              value="438"
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
                  subtitle="14 Senior, 22 Residents"
                  value="36"
                  variant="doctor"
                  valueColor="#0F172A"
                  icon={<MaterialCommunityIcons name="stethoscope" size={16} color="#4B7BFF" />}
                  iconBackgroundColor="#EAF1FF"
                  style={styles.staffingItem}
                />
                <StaffingStatusCard
                  title="Nurses on Shift"
                  subtitle="Across 12 Departments"
                  value="84"
                  variant="nurse"
                  valueColor="#0F172A"
                  icon={<MaterialCommunityIcons name="medical-bag" size={16} color="#35C86B" />}
                  iconBackgroundColor="#E8FBEE"
                  style={styles.staffingItem}
                />
                <StaffingStatusCard
                  title="Available Specialists"
                  subtitle="On-call & Ready"
                  value="09"
                  variant="specialist"
                  highlightColor="#FACC15"
                  valueColor="#0F172A"
                  icon={<MaterialCommunityIcons name="sprout" size={16} color="#F2B300" />}
                  iconBackgroundColor="#FFF6D9"
                  style={styles.staffingItem}
                />
              </View>

              <Button label="View Full Roster" variant="surface" size="sm" style={styles.panelButton} />
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
                />
              </View>

              <View style={styles.inventoryList}>
                <InventoryProgressCard
                  title="Medical Oxygen"
                  valueText="850L / 1000L"
                  progress={85}
                  variant="normal"
                  icon={<MaterialCommunityIcons name="molecule" size={14} color="#1718C7" />}
                  actionLabel="Order Refill"
                  actionPlacement="below"
                  actionVariant="secondary"
                  progressFillColor="#1718C7"
                  progressTrackColor="#E8EDF5"
                  onAction={() => {}}
                  style={styles.inventoryItem}
                />
                <InventoryProgressCard
                  title="Vaccine Stock (Multi-strain)"
                  valueText="Critical 12%"
                  valueTextColor="#F04B4B"
                  progress={12}
                  variant="critical"
                  icon={<MaterialCommunityIcons name="needle" size={14} color="#F04B4B" />}
                  actionLabel="Order More Now"
                  actionPlacement="below"
                  actionVariant="primary"
                  onAction={() => {}}
                  style={styles.inventoryItem}
                />
                <InventoryProgressCard
                  title="Essential Medications"
                  valueText="62% in stock"
                  progress={62}
                  variant="normal"
                  icon={<MaterialCommunityIcons name="medical-bag" size={14} color="#5B63E2" />}
                  actionLabel="Manage Supply"
                  actionPlacement="below"
                  actionVariant="secondary"
                  progressFillColor="#5B63E2"
                  progressTrackColor="#E8EDF5"
                  onAction={() => {}}
                  style={styles.inventoryItem}
                />
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
    </DashboardLayout>
  );
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

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 32,
  },
  container: {
    padding: 26,
    gap: 24,
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
