import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppColors, AppRadii, AppSizes, AppSpacing, AppTypography } from '@/constants/theme';

export type InputFieldType = 'text' | 'password' | 'email' | 'number';

export interface InputFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  type?: InputFieldType;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  hint?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  placeholderTextColor?: string;
  labelAccessory?: React.ReactNode;
  maxLength?: number;
  testID?: string;
}

export function InputField({
  label,
  placeholder,
  value,
  type = 'text',
  leftIcon,
  rightIcon,
  hint,
  error,
  disabled = false,
  required = false,
  onChangeText,
  onFocus,
  onBlur,
  style,
  inputContainerStyle,
  inputStyle,
  labelStyle,
  placeholderTextColor,
  labelAccessory,
  maxLength,
  testID,
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const getBorderColor = () => {
    if (error) return AppColors.status.dangerBright;
    if (isFocused) return AppColors.brand.link;
    return AppColors.border.muted;
  };

  const getBackgroundColor = () => {
    if (disabled) return AppColors.surface.disabled;
    return AppColors.surface.card;
  };

  const handleTogglePassword = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const renderRightIcon = () => {
    if (type === 'password') {
      return (
        <TouchableOpacity onPress={handleTogglePassword} style={styles.iconButton}>
          <Feather
            name={isPasswordVisible ? 'eye' : 'eye-off'}
            size={18}
            color={disabled ? AppColors.border.strong : AppColors.text.muted}
          />
        </TouchableOpacity>
      );
    }

    if (rightIcon) {
      return <View style={styles.rightIconContainer}>{rightIcon}</View>;
    }

    return null;
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, labelStyle, disabled && styles.labelDisabled]}>{label}</Text>
          {required && <Text style={styles.required}>*</Text>}
          {labelAccessory ? <View style={styles.labelAccessory}>{labelAccessory}</View> : null}
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            backgroundColor: getBackgroundColor(),
          },
          isFocused && styles.inputFocused,
          disabled && styles.inputDisabled,
          inputContainerStyle,
        ]}
      >
        {leftIcon ? <View style={styles.leftIconContainer}>{leftIcon}</View> : null}
        <TextInput
          style={[styles.input, inputStyle, disabled && styles.inputTextDisabled]}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor ?? (disabled ? AppColors.border.strong : AppColors.text.muted)}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          secureTextEntry={type === 'password' && !isPasswordVisible}
          keyboardType={
            type === 'email' ? 'email-address' : type === 'number' ? 'numeric' : 'default'
          }
          maxLength={maxLength}
          editable={!disabled}
          autoCapitalize={type === 'email' ? 'none' : 'sentences'}
          testID={testID ? `${testID}-input` : undefined}
        />
        {renderRightIcon()}
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
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: AppSpacing.fieldGap,
  },
  labelAccessory: {
    marginLeft: 'auto',
  },
  label: {
    ...AppTypography.textStyles.inputLabel,
    color: AppColors.text.body,
  },
  labelDisabled: {
    color: AppColors.text.disabled,
  },
  required: {
    fontSize: AppTypography.fontSizes.body,
    color: AppColors.status.dangerBright,
    marginLeft: AppSpacing[2],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: AppRadii.xl,
    paddingHorizontal: AppSpacing.card,
    height: AppSizes.inputHeight,
    backgroundColor: AppColors.surface.card,
  },
  inputFocused: {
    borderColor: AppColors.brand.primary,
  },
  inputDisabled: {
    backgroundColor: AppColors.surface.disabled,
    borderColor: AppColors.border.muted,
  },
  input: {
    flex: 1,
    ...AppTypography.textStyles.inputText,
    color: AppColors.text.strong,
    padding: 0,
  },
  inputTextDisabled: {
    color: AppColors.text.disabled,
  },
  leftIconContainer: {
    marginRight: AppSpacing[6],
  },
  rightIconContainer: {
    marginLeft: AppSpacing[6],
  },
  iconButton: {
    padding: AppSpacing[2],
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
