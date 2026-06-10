import React, { useRef, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { AppColors } from '@/constants/theme';

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
}: SelectFieldProps) {
  const selectRef = useRef<View>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownFrame, setDropdownFrame] = useState({ top: 0, left: 0, width: 0 });

  const selectedOption = options.find((option) => option.value === value);
  const openDropdown = () => {
    selectRef.current?.measureInWindow((left, top, width, height) => {
      setDropdownFrame({ left, top: top + height + 4, width });
      setIsOpen(true);
    });
  };

  return (
    <View style={[styles.container, style]}>
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
          <Pressable style={styles.dropdownBackdrop} onPress={() => setIsOpen(false)} />
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
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: AppColors.text.body,
    marginBottom: 8,
  },
  labelDisabled: {
    color: AppColors.text.disabled,
  },
  selectContainer: {
    borderWidth: 1,
    borderColor: AppColors.border.default,
    borderRadius: 8,
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
    height: 42,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 16,
    lineHeight: 24,
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
    borderRadius: 12,
    backgroundColor: AppColors.surface.card,
    overflow: 'hidden',
    shadowColor: AppColors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    zIndex: 100,
  },
  dropdownBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: AppColors.surface.muted,
  },
  optionSelected: {
    backgroundColor: AppColors.surface.brandSoft,
  },
  optionText: {
    fontSize: 14,
    lineHeight: 20,
    color: AppColors.text.primary,
  },
  optionTextSelected: {
    color: AppColors.brand.primary,
    fontWeight: '600',
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 16,
    color: AppColors.status.dangerBright,
  },
});
