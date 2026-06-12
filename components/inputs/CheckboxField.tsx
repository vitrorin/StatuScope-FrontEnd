import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, TextStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppColors, AppRadii, AppSizes, AppSpacing, AppTypography } from '@/constants/theme';

export interface CheckboxFieldProps {
  label: string;
  checked?: boolean;
  disabled?: boolean;
  helperText?: string;
  onChange?: (checked: boolean) => void;
  style?: ViewStyle;
  checkboxStyle?: ViewStyle;
  labelStyle?: TextStyle;
}

export function CheckboxField({
  label,
  checked = false,
  disabled = false,
  helperText,
  onChange,
  style,
  checkboxStyle,
  labelStyle,
}: CheckboxFieldProps) {
  const handlePress = () => {
    if (!disabled) {
      onChange?.(!checked);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.checkbox,
            checked && styles.checkboxChecked,
            disabled && styles.checkboxDisabled,
            checkboxStyle,
          ]}
        >
          {checked ? <Feather name="check" size={12} color={AppColors.surface.card} /> : null}
        </View>
        <Text style={[styles.label, labelStyle, disabled && styles.labelDisabled]}>{label}</Text>
      </TouchableOpacity>
      {helperText ? (
        <Text style={[styles.helperText, disabled && styles.helperTextDisabled]}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: AppSpacing.card,
    width: '100%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: AppSizes.iconLg,
    height: AppSizes.iconLg,
    borderRadius: AppRadii.xs,
    borderWidth: 2,
    borderColor: AppColors.border.strong,
    backgroundColor: AppColors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: AppSpacing[6],
  },
  checkboxChecked: {
    backgroundColor: AppColors.brand.link,
    borderColor: AppColors.brand.link,
  },
  checkboxDisabled: {
    backgroundColor: AppColors.surface.control,
    borderColor: AppColors.border.muted,
  },
  label: {
    ...AppTypography.textStyles.body,
    color: AppColors.text.body,
    flex: 1,
  },
  labelDisabled: {
    color: AppColors.text.disabled,
  },
  helperText: {
    ...AppTypography.textStyles.caption,
    color: AppColors.table.muted,
    marginTop: AppSpacing[3],
    marginLeft: AppSpacing[16],
  },
  helperTextDisabled: {
    color: AppColors.text.disabled,
  },
});
