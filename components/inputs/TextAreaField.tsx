import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import { AppColors, AppRadii, AppSizes, AppSpacing, AppTypography } from '@/constants/theme';

export interface TextAreaFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  numberOfLines?: number;
  onChangeText?: (text: string) => void;
  style?: ViewStyle;
  testID?: string;
}

export function TextAreaField({
  label,
  placeholder,
  value,
  hint,
  error,
  disabled = false,
  numberOfLines = 4,
  onChangeText,
  style,
  testID,
}: TextAreaFieldProps) {
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
    <View style={[styles.container, style]} testID={testID}>
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
          testID={testID ? `${testID}-input` : undefined}
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
    marginBottom: AppSpacing.card,
    width: '100%',
  },
  label: {
    ...AppTypography.textStyles.inputLabel,
    color: AppColors.text.body,
    marginBottom: AppSpacing.fieldGap,
  },
  labelDisabled: {
    color: AppColors.text.disabled,
  },
  textareaContainer: {
    borderWidth: 1,
    borderRadius: AppRadii.xl,
    backgroundColor: AppColors.surface.card,
    width: '100%',
    minHeight: AppSizes.textareaMinHeight,
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
    ...AppTypography.textStyles.inputText,
    color: AppColors.text.strong,
    padding: AppSpacing.card,
  },
  textareaTextDisabled: {
    color: AppColors.text.disabled,
  },
  hintText: {
    ...AppTypography.textStyles.caption,
    color: AppColors.table.muted,
    marginTop: AppSpacing[3],
  },
  errorText: {
    ...AppTypography.textStyles.caption,
    color: AppColors.status.dangerBright,
    marginTop: AppSpacing[3],
  },
});
