import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { ProgressBar } from '../foundation/ProgressBar';
import { CardBase } from '../patterns/CardBase';
import { AppColors, AppSpacing, AppTypography } from '@/constants/theme';

export type BedCapacityVariant = 'default' | 'warning' | 'critical' | 'highlighted';

export interface BedCapacitySummaryCardProps {
  title: string;
  value: string;
  unitText?: string;
  trendText?: string;
  statusText?: string;
  showProgress?: boolean;
  progressValue?: number;
  variant?: BedCapacityVariant;
  valueColorOverride?: string;
  statusColorOverride?: string;
  style?: ViewStyle;
}

const variantStyles = {
  default: {
    valueColor: AppColors.text.strong,
    accentColor: AppColors.brand.primary,
  },
  warning: {
    valueColor: AppColors.status.warningText,
    accentColor: AppColors.status.warning,
  },
  critical: {
    valueColor: AppColors.status.danger,
    accentColor: AppColors.status.dangerBright,
  },
  highlighted: {
    valueColor: AppColors.status.infoDark,
    accentColor: AppColors.brand.primary,
  },
};

export function BedCapacitySummaryCard({
  title,
  value,
  unitText,
  trendText,
  statusText,
  showProgress = false,
  progressValue = 0,
  variant = 'default',
  valueColorOverride,
  statusColorOverride,
  style,
}: BedCapacitySummaryCardProps) {
  const colors = variantStyles[variant];
  const progressWidth = Math.min(Math.max(progressValue, 0), 100);

  return (
    <CardBase style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color: valueColorOverride || colors.valueColor }]}>{value}</Text>
        {unitText && <Text style={styles.unitText}>{unitText}</Text>}
      </View>

      {trendText && <Text style={styles.trendText}>{trendText}</Text>}

      {showProgress && (
        <View style={styles.progressContainer}>
          <ProgressBar value={progressWidth} color={colors.accentColor} />
        </View>
      )}

      {statusText && (
        <Text style={[styles.statusText, { color: statusColorOverride || colors.accentColor }]}>
          {statusText}
        </Text>
      )}
    </CardBase>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: AppSpacing.card,
  },
  title: {
    ...AppTypography.textStyles.caption,
    fontWeight: AppTypography.fontWeights.medium,
    color: AppColors.table.muted,
    textTransform: 'uppercase',
    letterSpacing: AppTypography.letterSpacing.eyebrow,
    marginBottom: AppSpacing.fieldGap,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    ...AppTypography.textStyles.display,
    fontWeight: AppTypography.fontWeights.bold,
    lineHeight: AppTypography.lineHeights.metricLarge,
  },
  unitText: {
    ...AppTypography.textStyles.inputText,
    fontWeight: AppTypography.fontWeights.medium,
    color: AppColors.table.muted,
    marginLeft: AppSpacing[2],
  },
  trendText: {
    ...AppTypography.textStyles.caption,
    color: AppColors.table.muted,
    marginTop: AppSpacing[2],
  },
  progressContainer: {
    marginTop: AppSpacing[6],
  },
  statusText: {
    ...AppTypography.textStyles.captionStrong,
    fontWeight: AppTypography.fontWeights.semibold,
    marginTop: AppSpacing.fieldGap,
  },
});
