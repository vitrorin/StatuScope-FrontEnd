import React from 'react';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { AppColors, AppRadii, AppSpacing, AppTypography, withAlpha } from '@/constants/theme';

export type DetectionBannerVariant = 'info' | 'warning' | 'critical';

export interface DetectionBannerProps {
  message: string;
  actionLabel?: string;
  variant?: DetectionBannerVariant;
  onActionPress?: () => void;
  style?: ViewStyle;
}

const variantStyles = {
  info: {
    background: withAlpha(AppColors.brand.primary, 0.08),
    iconColor: AppColors.brand.primary,
    messageColor: AppColors.brand.primary,
  },
  warning: {
    background: AppColors.status.warningSoft,
    iconColor: AppColors.status.warningStrong,
    messageColor: AppColors.status.warningLabel,
  },
  critical: {
    background: AppColors.status.dangerBorder,
    iconColor: AppColors.status.danger,
    messageColor: AppColors.status.dangerDeep,
  },
};

export function DetectionBanner({
  message,
  actionLabel,
  variant = 'info',
  onActionPress,
  style,
}: DetectionBannerProps) {
  const colors = variantStyles[variant];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, style]}>
      <Feather name="alert-triangle" size={16} color={colors.iconColor} style={styles.icon} />
      <Text style={[styles.message, { color: colors.messageColor }]}>{message}</Text>
      {actionLabel ? (
        <TouchableOpacity onPress={onActionPress} activeOpacity={0.75}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: AppSpacing[7],
    paddingHorizontal: AppSpacing.card,
    borderRadius: AppRadii.xl,
  },
  icon: {
    marginRight: AppSpacing[6],
  },
  message: {
    flex: 1,
    ...AppTypography.textStyles.bodySmall,
    fontWeight: AppTypography.fontWeights.semibold,
  },
  action: {
    ...AppTypography.textStyles.captionStrong,
    color: AppColors.brand.primary,
    textDecorationLine: 'underline',
    marginLeft: AppSpacing[6],
  },
});
