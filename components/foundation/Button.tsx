import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle, TextStyle } from 'react-native';
import { AppColors, AppRadii, AppSizes, AppSpacing, AppTypography } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'surface';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'chip' | 'icon';

export interface ButtonProps {
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  children?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  labelStyle?: TextStyle;
  testID?: string;
  accessibilityLabel?: string;
}

const variantStyles: Record<
  ButtonVariant,
  { backgroundColor: string; borderColor: string; textColor: string }
> = {
  primary: {
    backgroundColor: AppColors.brand.link,
    borderColor: AppColors.brand.link,
    textColor: AppColors.surface.card,
  },
  secondary: {
    backgroundColor: AppColors.surface.card,
    borderColor: AppColors.border.muted,
    textColor: AppColors.text.body,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    textColor: AppColors.table.muted,
  },
  danger: {
    backgroundColor: AppColors.status.dangerSoft,
    borderColor: AppColors.status.dangerBorder,
    textColor: AppColors.status.danger,
  },
  surface: {
    backgroundColor: AppColors.surface.control,
    borderColor: AppColors.border.muted,
    textColor: AppColors.text.body,
  },
};

const sizeStyles: Record<
  ButtonSize,
  { paddingVertical: number; paddingHorizontal: number; borderRadius: number; minHeight: number }
> = {
  sm: { paddingVertical: AppSpacing[5], paddingHorizontal: AppSpacing[7], borderRadius: AppRadii.lg, minHeight: AppSizes.controlSm },
  md: { paddingVertical: AppSpacing[6], paddingHorizontal: AppSpacing.card, borderRadius: AppRadii.xl, minHeight: AppSizes.controlLg },
  lg: { paddingVertical: AppSpacing[7], paddingHorizontal: AppSpacing[10], borderRadius: AppRadii.xl, minHeight: AppSizes.inputHeight },
  chip: { paddingVertical: AppSpacing[4], paddingHorizontal: AppSpacing[7], borderRadius: AppRadii['4xl'], minHeight: AppSpacing[16] },
  icon: { paddingVertical: AppSpacing[0], paddingHorizontal: AppSpacing[0], borderRadius: AppRadii.lg, minHeight: AppSizes.controlSm },
};

const textSizes: Record<ButtonSize, number> = {
  sm: AppTypography.fontSizes.small,
  md: AppTypography.fontSizes.body,
  lg: 15,
  chip: AppTypography.fontSizes.small,
  icon: AppTypography.fontSizes.bodyLarge,
};

export function Button({
  label,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  leadingIcon,
  trailingIcon,
  children,
  onPress,
  style,
  labelStyle,
  testID,
  accessibilityLabel,
}: ButtonProps) {
  const colors = variantStyles[variant];
  const metrics = sizeStyles[size];

  return (
    <TouchableOpacity
      style={[
        styles.base,
        {
          backgroundColor: disabled ? AppColors.surface.disabled : colors.backgroundColor,
          borderColor: disabled ? AppColors.border.muted : colors.borderColor,
          paddingVertical: metrics.paddingVertical,
          paddingHorizontal: metrics.paddingHorizontal,
          borderRadius: metrics.borderRadius,
          minHeight: metrics.minHeight,
          minWidth: size === 'icon' ? metrics.minHeight : undefined,
        },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      {leadingIcon ? <View style={styles.iconSlot}>{leadingIcon}</View> : null}
      {children || label ? (
        <Text
          style={[
            styles.label,
            {
              color: disabled ? AppColors.text.disabled : colors.textColor,
              fontSize: textSizes[size],
            },
            labelStyle,
          ]}
        >
          {children || label}
        </Text>
      ) : null}
      {trailingIcon ? <View style={styles.iconSlot}>{trailingIcon}</View> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    gap: AppSpacing.fieldGap,
  },
  disabled: {
    opacity: 0.9,
  },
  label: {
    ...AppTypography.textStyles.buttonLabel,
  },
  iconSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
