import React, { useState } from 'react';
import { StyleSheet, TextInput, View, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppColors, AppRadii, AppSizes, AppSpacing, AppTypography } from '@/constants/theme';

export interface SearchInputProps {
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: ViewStyle;
}

export function SearchInput({
  placeholder = 'Search...',
  value,
  disabled = false,
  onChangeText,
  onFocus,
  onBlur,
  style,
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <View
      style={[
        styles.container,
        isFocused && styles.containerFocused,
        disabled && styles.containerDisabled,
        style,
      ]}
    >
      <Feather name="search" size={16} color={disabled ? AppColors.border.strong : AppColors.text.muted} />
      <TextInput
        style={[styles.input, disabled && styles.inputDisabled]}
        placeholder={placeholder}
        placeholderTextColor={disabled ? AppColors.border.strong : AppColors.text.muted}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        editable={!disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.fieldGap,
    backgroundColor: AppColors.surface.muted,
    borderRadius: AppRadii.md,
    paddingHorizontal: AppSpacing[6],
    height: AppSizes.controlMd,
    borderWidth: 1,
    borderColor: 'transparent',
    width: '100%',
  },
  containerFocused: {
    borderColor: AppColors.border.strong,
    backgroundColor: AppColors.surface.card,
  },
  containerDisabled: {
    backgroundColor: AppColors.surface.subtle,
  },
  input: {
    flex: 1,
    ...AppTypography.textStyles.body,
    color: AppColors.text.primary,
    padding: 0,
  },
  inputDisabled: {
    color: AppColors.text.disabled,
  },
});
