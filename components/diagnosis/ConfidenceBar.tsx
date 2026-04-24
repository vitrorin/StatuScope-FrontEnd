import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { ProgressBar } from '../foundation/ProgressBar';
import { CardBase } from '../patterns/CardBase';

export interface ConfidenceBarProps {
  label: string;
  value: number;
  valueText?: string;
  color?: string;
  style?: ViewStyle;
}

export function ConfidenceBar({
  label,
  value,
  valueText,
  color = '#1D4ED8',
  style,
}: ConfidenceBarProps) {
  const percentage = Math.min(100, Math.max(0, value));
  const displayValue = valueText || `${percentage}%`;

  return (
    <CardBase style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color }]}>{displayValue}</Text>
      </View>
      <ProgressBar value={percentage} color={color} />
    </CardBase>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
  },
});
