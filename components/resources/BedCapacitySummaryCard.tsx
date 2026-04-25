import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { ProgressBar } from '../foundation/ProgressBar';
import { CardBase } from '../patterns/CardBase';

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
    valueColor: '#111827',
    accentColor: '#1D4ED8',
  },
  warning: {
    valueColor: '#D97706',
    accentColor: '#F59E0B',
  },
  critical: {
    valueColor: '#DC2626',
    accentColor: '#EF4444',
  },
  highlighted: {
    valueColor: '#1E40AF',
    accentColor: '#1D4ED8',
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
    padding: 16,
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
  },
  unitText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 4,
  },
  trendText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
});
