import React, { useRef, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { AppColors, AppRadii, AppShadows, AppSizes, AppSpacing, AppTypography } from '@/constants/theme';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  options: SelectOption[];
  error?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function SelectField({
  label,
  placeholder = 'Select an option',
  value,
  options,
  error,
  disabled = false,
  onChange,
  style,
  testID,
}: SelectFieldProps) {
  const selectRef = useRef<View>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownFrame, setDropdownFrame] = useState({ top: 0, left: 0, width: 0 });

  const selectedOption = options.find((option) => option.value === value);
  const openDropdown = () => {
    setDropdownFrame({ left: 0, top: 0, width: 240 });
    setIsOpen(true);

    const measureInWindow = selectRef.current?.measureInWindow;
    if (typeof measureInWindow !== 'function') {
      return;
    }

    /* istanbul ignore next: native measurement callbacks are not invoked by the React Native test renderer. */
    measureInWindow((left, top, width, height) => {
      setDropdownFrame({ left, top: top + height + 4, width });
    });
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {label ? <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text> : null}

      <View
        ref={selectRef}
        style={[
          styles.selectContainer,
          isOpen && styles.selectOpen,
          disabled && styles.selectDisabled,
          error && styles.selectError,
        ]}
      >
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => {
            if (disabled) return;
            if (isOpen) {
              setIsOpen(false);
            } else {
              openDropdown();
            }
          }}
          disabled={disabled}
          activeOpacity={0.75}
          testID={testID ? `${testID}-button` : undefined}
        >
          <Text
            style={[
              styles.selectText,
              !selectedOption && styles.placeholderText,
              disabled && styles.selectTextDisabled,
            ]}
          >
            {selectedOption?.label || placeholder}
          </Text>
          <Feather name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color={AppColors.text.secondary} />
        </TouchableOpacity>
      </View>

      {isOpen && !disabled ? (
        <Modal transparent visible={isOpen} animationType="none" onRequestClose={() => setIsOpen(false)}>
          <Pressable
            style={styles.dropdownBackdrop}
            onPress={() => setIsOpen(false)}
            testID={testID ? `${testID}-backdrop` : undefined}
          />
          <View
            style={[
              styles.dropdown,
              {
                left: dropdownFrame.left,
                top: dropdownFrame.top,
                width: dropdownFrame.width,
              },
            ]}
          >
            {options.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.option,
                  index < options.length - 1 && styles.optionBorder,
                  option.value === value && styles.optionSelected,
                ]}
                onPress={() => {
                  onChange?.(option.value);
                  setIsOpen(false);
                }}
                activeOpacity={0.75}
                testID={testID ? `${testID}-option-${option.value}` : undefined}
              >
                <Text
                  style={[styles.optionText, option.value === value && styles.optionTextSelected]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Modal>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
  selectContainer: {
    borderWidth: 1,
    borderColor: AppColors.border.default,
    borderRadius: AppRadii.md,
    backgroundColor: AppColors.surface.card,
    overflow: 'hidden',
  },
  selectOpen: {
    borderColor: AppColors.brand.primary,
  },
  selectDisabled: {
    backgroundColor: AppColors.surface.disabled,
  },
  selectError: {
    borderColor: AppColors.status.dangerBright,
  },
  selectButton: {
    height: AppSizes.controlMd + AppSpacing[1],
    paddingHorizontal: AppSpacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    ...AppTypography.textStyles.inputText,
    color: AppColors.text.primary,
  },
  placeholderText: {
    color: AppColors.text.muted,
  },
  selectTextDisabled: {
    color: AppColors.text.disabled,
  },
  dropdown: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: AppColors.border.default,
    borderRadius: AppRadii.xl,
    backgroundColor: AppColors.surface.card,
    overflow: 'hidden',
    ...AppShadows.card,
    shadowOffset: { width: 0, height: AppSpacing[2] },
    shadowOpacity: 0.08,
    shadowRadius: AppSpacing[6],
    zIndex: 100,
  },
  dropdownBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  option: {
    paddingHorizontal: AppSpacing[7],
    paddingVertical: AppSpacing[6],
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: AppColors.surface.muted,
  },
  optionSelected: {
    backgroundColor: AppColors.surface.brandSoft,
  },
  optionText: {
    ...AppTypography.textStyles.body,
    color: AppColors.text.primary,
  },
  optionTextSelected: {
    color: AppColors.brand.primary,
    fontWeight: AppTypography.fontWeights.semibold,
  },
  errorText: {
    marginTop: AppSpacing[3],
    ...AppTypography.textStyles.caption,
    color: AppColors.status.dangerBright,
  },
});
