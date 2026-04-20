import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

export interface TimeFilterOption {
  label: string;
  value: string;
}

export interface TimeFilterTabsProps {
  options: TimeFilterOption[];
  value: string;
  onChange?: (value: string) => void;
  style?: ViewStyle;
}

export function TimeFilterTabs({
  options,
  value,
  onChange,
  style,
}: TimeFilterTabsProps) {
  return (
    <View style={[styles.container, style]}>
      {options.map((option, index) => {
        const isSelected = option.value === value;
        const isFirst = index === 0;
        const isLast = index === options.length - 1;

        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.tab,
              isSelected && styles.tabSelected,
              isFirst && styles.tabFirst,
              isLast && styles.tabLast,
            ]}
            onPress={() => onChange?.(option.value)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                isSelected && styles.tabTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  tabSelected: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabFirst: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  tabLast: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextSelected: {
    color: '#111827',
    fontWeight: '600',
  },
});