import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

export interface MapLegendItem {
  label: string;
  color: string;
  value?: string;
}

export interface MapLegendProps {
  items: MapLegendItem[];
  orientation?: 'vertical' | 'horizontal';
  style?: ViewStyle;
}

export function MapLegend({
  items,
  orientation = 'vertical',
  style,
}: MapLegendProps) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <View style={[styles.container, isHorizontal && styles.containerHorizontal, style]}>
      {items.map((item, index) => (
        <View
          key={index}
          style={[styles.item, isHorizontal && styles.itemHorizontal]}
        >
          <View style={[styles.dot, { backgroundColor: item.color }]} />
          <Text style={styles.label}>{item.label}</Text>
          {item.value && <Text style={styles.value}>{item.value}</Text>}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  containerHorizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemHorizontal: {
    marginRight: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
});