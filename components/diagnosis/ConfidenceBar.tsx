import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { ProgressBar } from '../foundation/ProgressBar';
import { CardBase } from '../patterns/CardBase';
import { AppColors } from '@/constants/theme';

export interface ConfidenceBarProps {
  label: string;
  value: number;
  valueText?: string;
  color?: string;
  valueColor?: string;
  style?: ViewStyle;
}

export function ConfidenceBar({
  label,
  value,
  valueText,
  color = AppColors.brand.link,
  valueColor = AppColors.text.primary,
  style,
}: ConfidenceBarProps) {
  const percentage = Math.min(100, Math.max(0, value));
  const displayValue = valueText || `${percentage}%`;

  return (
    <CardBase style={StyleSheet.flatten([styles.container, style])}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color: valueColor }]}>{displayValue}</Text>
      </View>
      <ProgressBar value={percentage} color={color} trackColor="AppColors.surface.muted" />
    </CardBase>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 14,
    borderColor: AppColors.border.panel,
    backgroundColor: AppColors.surface.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: AppColors.text.secondary,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
  },
});
