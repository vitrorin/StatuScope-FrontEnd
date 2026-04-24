import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { ProgressBar } from '../foundation/ProgressBar';

export interface ProgressMetricRowProps {
  label: string;
  valueText: string;
  progress: number;
  barColor?: string;
  style?: ViewStyle;
}

export function ProgressMetricRow({
  label,
  valueText,
  progress,
  barColor = '#1D4ED8',
  style,
}: ProgressMetricRowProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.valueText}>{valueText}</Text>
      </View>
      <ProgressBar value={progress} color={barColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  valueText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
});
