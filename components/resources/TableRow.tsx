import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { ActionChipButton } from '../recommendations/ActionChipButton';
import { StatusBadge } from '../feedback/StatusBadge';
import { AppColors, AppSpacing, AppTypography } from '@/constants/theme';

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
    paddingVertical: AppSpacing[7],
    paddingHorizontal: AppSpacing.card,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.surface.control,
    backgroundColor: AppColors.surface.card,
  },
  mainContent: {
    flex: 1,
    marginRight: AppSpacing.card,
  },
  titleSection: {},
  title: {
    ...AppTypography.textStyles.bodyStrong,
    color: AppColors.text.strong,
  },
  subtitle: {
    ...AppTypography.textStyles.caption,
    color: AppColors.table.muted,
    marginTop: AppSpacing[1],
  },
  metricsSection: {
    flexDirection: 'row',
    marginRight: AppSpacing.card,
  },
  metricCell: {
    alignItems: 'center',
    marginHorizontal: AppSpacing[6],
    minWidth: 50,
  },
  metricValue: {
    ...AppTypography.textStyles.bodyStrong,
    color: AppColors.text.strong,
  },
  metricLabel: {
    fontSize: AppTypography.fontSizes.micro,
    lineHeight: AppTypography.lineHeights.micro,
    color: AppColors.text.disabled,
    marginTop: AppSpacing[1],
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.fieldGap,
  },
});
