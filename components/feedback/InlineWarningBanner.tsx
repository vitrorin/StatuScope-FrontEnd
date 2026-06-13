import React from 'react';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AppColors, AppRadii, AppSpacing, AppTypography } from '@/constants/theme';

export type InlineWarningBannerVariant = 'critical' | 'warning' | 'info';

export interface InlineWarningBannerProps {
  title?: string;
  message: string;
  variant?: InlineWarningBannerVariant;
  style?: ViewStyle;
}

const variantStyles = {
  critical: {
    background: AppColors.status.dangerSoft,
    border: AppColors.status.dangerBorder,
    titleColor: AppColors.status.danger,
    messageColor: AppColors.status.dangerDark,
    icon: 'alert-triangle' as const,
  },
  warning: {
    background: AppColors.status.warningWash,
    border: AppColors.status.warningBorder,
    titleColor: AppColors.status.warningText,
    messageColor: AppColors.status.warningLabel,
    icon: 'zap' as const,
  },
  info: {
    background: AppColors.status.infoSoft,
    border: AppColors.status.infoSoft,
    titleColor: AppColors.brand.link,
    messageColor: AppColors.status.infoDark,
    icon: 'info' as const,
  },
};

export function InlineWarningBanner({
  title,
  message,
  variant = 'warning',
  style,
}: InlineWarningBannerProps) {
  const colors = variantStyles[variant];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, borderColor: colors.border },
        style,
      ]}
    >
      <Feather name={colors.icon} size={16} color={colors.titleColor} style={styles.icon} />
      <View style={styles.content}>
        {title ? <Text style={[styles.title, { color: colors.titleColor }]}>{title}</Text> : null}
        <Text style={[styles.message, { color: colors.messageColor }]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: AppRadii.lg,
    padding: AppSpacing[7],
  },
  icon: {
    marginRight: AppSpacing[6],
    marginTop: AppSpacing[1] / 2,
  },
  content: {
    flex: 1,
  },
  title: {
    ...AppTypography.textStyles.bodySmall,
    fontWeight: AppTypography.fontWeights.bold,
    marginBottom: AppSpacing[2],
  },
  message: {
    ...AppTypography.textStyles.caption,
    lineHeight: AppTypography.lineHeights.caption,
  },
});
