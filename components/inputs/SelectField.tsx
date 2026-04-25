import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

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
  style?: ViewStyle;
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
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text> : null}

      <View
        style={[
          styles.selectContainer,
          isOpen && styles.selectOpen,
          disabled && styles.selectDisabled,
          error && styles.selectError,
        ]}
      >
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => !disabled && setIsOpen((current) => !current)}
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
          <Feather name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color="#64748B" />
        </TouchableOpacity>
      </View>

      {isOpen && !disabled ? (
        <View style={styles.dropdown}>
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
    color: '#374151',
    marginBottom: 8,
  },
  labelDisabled: {
    color: '#9CA3AF',
  },
  selectContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  selectOpen: {
    borderColor: '#0003B8',
  },
  selectDisabled: {
    backgroundColor: '#F9FAFB',
  },
  selectError: {
    borderColor: '#EF4444',
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
    color: '#0F172A',
  },
  placeholderText: {
    color: '#94A3B8',
  },
  selectTextDisabled: {
    color: '#9CA3AF',
  },
  dropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  optionSelected: {
    backgroundColor: '#EEF2FF',
  },
  optionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#0F172A',
  },
  optionTextSelected: {
    color: '#0003B8',
    fontWeight: '600',
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 16,
    color: '#EF4444',
  },
});
