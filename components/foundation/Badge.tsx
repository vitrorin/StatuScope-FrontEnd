import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AppColors, AppRadii, AppSpacing, AppTypography } from '@/constants/theme';

export type BadgeTone =
  | 'critical'
  | 'success'
  | 'warning'
  | 'neutral'
  | 'info'
  | 'role'
  | 'high'
  | 'medium'
  | 'low';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  style?: ViewStyle;
}

const toneStyles: Record<BadgeTone, { background: string; text: string }> = {
  critical: { background: AppColors.status.dangerSoft, text: AppColors.status.dangerAccent },
  success: { background: AppColors.status.successSoft, text: AppColors.status.success },
  warning: { background: AppColors.status.warningSoft, text: AppColors.status.warningText },
  neutral: { background: AppColors.surface.control, text: AppColors.table.muted },
  info: { background: AppColors.status.infoSoft, text: AppColors.status.info },
  role: { background: AppColors.surface.brandSoft, text: AppColors.brand.link },
  high: { background: AppColors.status.dangerSoft, text: AppColors.status.dangerAccent },
  medium: { background: AppColors.status.warningSoft, text: AppColors.status.warningText },
  low: { background: AppColors.status.successSoft, text: AppColors.status.success },
};

export function Badge({ label, tone = 'neutral', style }: BadgeProps) {
  const colors = toneStyles[tone];

  return (
    <View style={[styles.badge, { backgroundColor: colors.background }, style]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: AppSpacing[5],
    paddingVertical: AppSpacing[2],
    borderRadius: AppRadii.pill,
    alignSelf: 'flex-start',
  },
  label: {
    ...AppTypography.textStyles.captionStrong,
    fontSize: AppTypography.fontSizes.eyebrow,
    lineHeight: AppTypography.lineHeights.tight,
    textTransform: 'uppercase',
    letterSpacing: AppTypography.letterSpacing.tight,
  },
});
