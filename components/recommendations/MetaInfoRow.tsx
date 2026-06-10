import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AppColors } from '@/constants/theme';

export interface MetaItem {
  label: string;
  icon?: React.ReactNode;
}

export interface MetaInfoRowProps {
  items: MetaItem[];
  compact?: boolean;
  style?: ViewStyle;
}

export function MetaInfoRow({ items, compact = false, style }: MetaInfoRowProps) {
  return (
    <View style={[styles.container, compact && styles.containerCompact, style]}>
      {items.map((item, index) => (
        <View key={index} style={styles.item}>
          {item.icon && <View style={styles.icon}>{item.icon}</View>}
          <Text style={[styles.label, compact && styles.labelCompact]}>{item.label}</Text>
          {index < items.length - 1 && <Text style={styles.separator}>•</Text>}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 4,
  },
  containerCompact: {
    marginTop: 0,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: 12,
    color: AppColors.text.muted,
  },
  labelCompact: {
    fontSize: 11,
  },
  separator: {
    marginHorizontal: 8,
    color: AppColors.border.strong,
    fontSize: 10,
  },
});
