import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, TextStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';

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
          {checked ? <Feather name="check" size={12} color="#FFFFFF" /> : null}
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
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
  },
  checkboxDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  label: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  labelDisabled: {
    color: '#9CA3AF',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
    marginLeft: 32,
  },
  helperTextDisabled: {
    color: '#9CA3AF',
  },
});
