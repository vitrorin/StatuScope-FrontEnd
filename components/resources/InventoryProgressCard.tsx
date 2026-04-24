import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { ActionChipButton } from '../recommendations/ActionChipButton';
import { ProgressBar } from '../foundation/ProgressBar';
import { CardBase } from '../patterns/CardBase';

export type InventoryVariant = 'normal' | 'warning' | 'critical';

export interface InventoryProgressCardProps {
  title: string;
  valueText?: string;
  progress: number;
  statusText?: string;
  variant?: InventoryVariant;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

const variantStyles = {
  normal: {
    progressBg: '#E5E7EB',
    progressFill: '#22C55E',
    statusText: '#6B7280',
  },
  warning: {
    progressBg: '#FEF3C7',
    progressFill: '#F59E0B',
    statusText: '#D97706',
  },
  critical: {
    progressBg: '#FEE2E2',
    progressFill: '#EF4444',
    statusText: '#DC2626',
  },
};

export function InventoryProgressCard({
  title,
  valueText,
  progress,
  statusText,
  variant = 'normal',
  actionLabel,
  onAction,
  style,
}: InventoryProgressCardProps) {
  const colors = variantStyles[variant];
  const progressWidth = Math.min(Math.max(progress, 0), 100);

  return (
    <CardBase style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {valueText && <Text style={styles.valueText}>{valueText}</Text>}
      </View>

      <View style={styles.progressContainer}>
        <ProgressBar
          value={progressWidth}
          color={colors.progressFill}
          trackColor={colors.progressBg}
          height={8}
        />
      </View>

      <View style={styles.footer}>
        {statusText && (
          <Text style={[styles.statusText, { color: colors.statusText }]}>{statusText}</Text>
        )}
        {actionLabel && onAction && (
          <ActionChipButton label={actionLabel} variant="ghost" onPress={onAction} />
        )}
      </View>
    </CardBase>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  valueText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  progressContainer: {
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
