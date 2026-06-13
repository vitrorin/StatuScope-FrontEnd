import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AppColors, AppSizes, AppSpacing, AppTypography } from '@/constants/theme';

export type AvatarTone = 'default' | 'doctor' | 'admin' | 'neutral';
export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  initials: string;
  tone?: AvatarTone;
  size?: AvatarSize;
  style?: ViewStyle;
}

const toneStyles = {
  default: { bg: AppColors.status.infoSoft, text: AppColors.brand.link },
  doctor: { bg: AppColors.status.successSoft, text: AppColors.status.success },
  admin: { bg: AppColors.status.warningSoft, text: AppColors.status.warningText },
  neutral: { bg: AppColors.surface.control, text: AppColors.table.muted },
};

const sizeStyles = {
  sm: { size: AppSpacing[14], fontSize: AppTypography.fontSizes.micro },
  md: { size: AppSizes.controlSm, fontSize: AppTypography.fontSizes.caption },
  lg: { size: AppSizes.controlLg, fontSize: AppTypography.fontSizes.body },
};

export function Avatar({
  initials,
  tone = 'default',
  size = 'md',
  style,
}: AvatarProps) {
  const colors = toneStyles[tone];
  const metrics = sizeStyles[size];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bg,
          width: metrics.size,
          height: metrics.size,
          borderRadius: metrics.size / 2,
        },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize: metrics.fontSize, color: colors.text }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: AppTypography.fontWeights.semibold,
  },
});
