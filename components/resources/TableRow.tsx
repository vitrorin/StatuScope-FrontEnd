import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { ActionChipButton } from '../recommendations/ActionChipButton';
import { StatusBadge } from '../feedback/StatusBadge';

export type TableRowStatusVariant = 'critical' | 'warning' | 'success' | 'neutral';

export interface TableRowProps {
  title: string;
  subtitle?: string;
  total: string;
  occupied: string;
  utilization: string;
  statusLabel: string;
  statusVariant: TableRowStatusVariant;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function TableRow({
  title,
  subtitle,
  total,
  occupied,
  utilization,
  statusLabel,
  statusVariant,
  actionLabel,
  onAction,
  style,
}: TableRowProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.mainContent}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>

      <View style={styles.metricsSection}>
        <View style={styles.metricCell}>
          <Text style={styles.metricValue}>{total}</Text>
          <Text style={styles.metricLabel}>Total</Text>
        </View>
        <View style={styles.metricCell}>
          <Text style={styles.metricValue}>{occupied}</Text>
          <Text style={styles.metricLabel}>Occupied</Text>
        </View>
        <View style={styles.metricCell}>
          <Text style={styles.metricValue}>{utilization}</Text>
          <Text style={styles.metricLabel}>Utilization</Text>
        </View>
      </View>

      <View style={styles.statusSection}>
        <StatusBadge label={statusLabel} variant={statusVariant} />
        {actionLabel && onAction && (
          <ActionChipButton label={actionLabel} variant="ghost" onPress={onAction} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  mainContent: {
    flex: 1,
    marginRight: 16,
  },
  titleSection: {},
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  metricsSection: {
    flexDirection: 'row',
    marginRight: 16,
  },
  metricCell: {
    alignItems: 'center',
    marginHorizontal: 12,
    minWidth: 50,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  metricLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
