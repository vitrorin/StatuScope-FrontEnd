import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import { AppColors } from '@/constants/theme';

export interface TextareaFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  numberOfLines?: number;
  onChangeText?: (text: string) => void;
  style?: ViewStyle;
}

export function TextareaField({
  label,
  placeholder,
  value,
  hint,
  error,
  disabled = false,
  numberOfLines = 4,
  onChangeText,
  style,
}: TextareaFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (error) return AppColors.status.dangerBright;
    if (isFocused) return AppColors.brand.link;
    return AppColors.border.muted;
  };

  const getBackgroundColor = () => {
    if (disabled) return AppColors.surface.disabled;
    return AppColors.surface.card;
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, disabled && styles.labelDisabled]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.textareaContainer,
          {
            borderColor: getBorderColor(),
            backgroundColor: getBackgroundColor(),
          },
          isFocused && styles.textareaFocused,
          disabled && styles.textareaDisabled,
        ]}
      >
        <TextInput
          style={[
            styles.textarea,
            disabled && styles.textareaTextDisabled,
          ]}
          placeholder={placeholder}
          placeholderTextColor={disabled ? AppColors.border.strong : AppColors.text.muted}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline
          numberOfLines={numberOfLines}
          textAlignVertical="top"
          editable={!disabled}
        />
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: AppColors.text.body,
    marginBottom: 8,
  },
  labelDisabled: {
    color: AppColors.text.disabled,
  },
  textareaContainer: {
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: AppColors.surface.card,
    width: '100%',
    minHeight: 120,
  },
  textareaFocused: {
    borderColor: AppColors.brand.primary,
  },
  textareaDisabled: {
    backgroundColor: AppColors.surface.disabled,
    borderColor: AppColors.border.muted,
  },
  textarea: {
    flex: 1,
    fontSize: 16,
    color: AppColors.text.strong,
    padding: 16,
    lineHeight: 24,
  },
  textareaTextDisabled: {
    color: AppColors.text.disabled,
  },
  hintText: {
    fontSize: 12,
    color: AppColors.table.muted,
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    color: AppColors.status.dangerBright,
    marginTop: 6,
  },
});
