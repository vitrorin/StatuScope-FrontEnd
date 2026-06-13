import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { AppColors, AppRadii, AppSizes, AppSpacing, AppTypography, withAlpha } from '@/constants/theme';

export interface ReportOptionProps {
  title: string;
  description: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function ReportOption({
  title,
  description,
  icon,
  disabled = false,
  loading = false,
  onPress,
  style,
  testID,
}: ReportOptionProps) {
  return (
    <TouchableOpacity
      style={[styles.option, disabled && styles.disabled, style]}
      activeOpacity={0.82}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
    >
      <View style={styles.iconSlot}>
        <Feather name={icon} size={AppSizes.iconMd} color={AppColors.brand.primary} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Feather name={loading ? 'loader' : 'download'} size={AppSizes.iconMd} color={AppColors.text.secondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing[7],
    borderWidth: 1,
    borderColor: AppColors.border.panelSoft,
    borderRadius: AppRadii['3xl'],
    backgroundColor: AppColors.surface.card,
    padding: AppSpacing.card,
  },
  disabled: {
    opacity: 0.58,
  },
  iconSlot: {
    width: AppSizes.controlMd,
    height: AppSizes.controlMd,
    borderRadius: AppRadii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(AppColors.brand.primary, 0.08),
    borderWidth: 1,
    borderColor: withAlpha(AppColors.brand.primary, 0.16),
  },
  copy: {
    flex: 1,
  },
  title: {
    ...AppTypography.textStyles.bodyStrong,
    fontWeight: AppTypography.fontWeights.black,
    color: AppColors.text.primary,
  },
  description: {
    ...AppTypography.textStyles.caption,
    fontWeight: AppTypography.fontWeights.semibold,
    color: AppColors.text.secondary,
    marginTop: AppSpacing[2],
  },
});
