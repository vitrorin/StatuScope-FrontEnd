import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, TextStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppColors } from '@/constants/theme';

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
    marginBottom: 16,
    width: '100%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: AppColors.border.strong,
    backgroundColor: AppColors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
    fontSize: 14,
    color: AppColors.text.body,
    flex: 1,
  },
  labelDisabled: {
    color: AppColors.text.disabled,
  },
  helperText: {
    fontSize: 12,
    color: AppColors.table.muted,
    marginTop: 6,
    marginLeft: 32,
  },
  helperTextDisabled: {
    color: AppColors.text.disabled,
  },
});
