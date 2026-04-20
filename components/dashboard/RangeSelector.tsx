import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

export interface RangeOption {
  label: string;
  value: string;
}

export interface RangeSelectorProps {
  options: RangeOption[];
  value: string;
  label?: string;
  onChange?: (value: string) => void;
  style?: ViewStyle;
}

export function RangeSelector({
  options,
  value,
  label,
  onChange,
  style,
}: RangeSelectorProps) {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.buttonsContainer}>
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.button,
                isSelected && styles.buttonSelected,
              ]}
              onPress={() => onChange?.(option.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.buttonText,
                  isSelected && styles.buttonTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  buttonSelected: {
    backgroundColor: '#1E40AF',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  buttonTextSelected: {
    color: '#FFFFFF',
  },
});