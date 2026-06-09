import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Button, ButtonVariant } from '../foundation/Button';
import { ProgressBar } from '../foundation/ProgressBar';
import { CardBase } from '../patterns/CardBase';
import { AppColors } from '@/constants/theme';

export type InventoryVariant = 'normal' | 'warning' | 'critical';

export interface InventoryProgressCardProps {
  title: string;
  valueText?: string;
  progress: number;
  statusText?: string;
  variant?: InventoryVariant;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  valueTextColor?: string;
  progressFillColor?: string;
  progressTrackColor?: string;
  actionPlacement?: 'inline' | 'below';
  actionVariant?: ButtonVariant;
  style?: ViewStyle;
}

const variantStyles = {
  normal: {
    progressBg: AppColors.border.muted,
    progressFill: AppColors.status.successBright,
    statusText: AppColors.table.muted,
  },
  warning: {
    progressBg: AppColors.status.warningSoft,
    progressFill: AppColors.status.warning,
    statusText: AppColors.status.warningText,
  },
  critical: {
    progressBg: AppColors.status.dangerBorder,
    progressFill: AppColors.status.dangerBright,
    statusText: AppColors.status.danger,
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
  icon,
  valueTextColor,
  progressFillColor,
  progressTrackColor,
  actionPlacement = 'inline',
  actionVariant = 'secondary',
  style,
}: InventoryProgressCardProps) {
  const colors = variantStyles[variant];
  const progressWidth = Math.min(Math.max(progress, 0), 100);
  const isActionBelow = actionPlacement === 'below' && actionLabel && onAction;

  return (
    <CardBase style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          {icon ? <View style={styles.titleIcon}>{icon}</View> : null}
          <Text style={styles.title}>{title}</Text>
        </View>
        {valueText && <Text style={[styles.valueText, valueTextColor ? { color: valueTextColor } : null]}>{valueText}</Text>}
      </View>

      <View style={styles.progressContainer}>
        <ProgressBar
          value={progressWidth}
          color={progressFillColor || colors.progressFill}
          trackColor={progressTrackColor || colors.progressBg}
          height={8}
        />
      </View>

      <View style={styles.footer}>
        {statusText && (
          <Text style={[styles.statusText, { color: colors.statusText }]}>{statusText}</Text>
        )}
        {actionPlacement === 'inline' && actionLabel && onAction && (
          <Button label={actionLabel} variant={actionVariant} size="chip" onPress={onAction} />
        )}
      </View>

      {isActionBelow ? (
        <View style={styles.belowActionWrap}>
          <Button label={actionLabel} variant={actionVariant} size="chip" onPress={onAction} />
        </View>
      ) : null}
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
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 12,
  },
  titleIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text.strong,
  },
  valueText: {
    fontSize: 14,
    fontWeight: '500',
    color: AppColors.table.muted,
  },
  progressContainer: {
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  belowActionWrap: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
