import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

export interface MiniMetricCardProps {
  label: string;
  value: string;
  supportingText?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendType?: 'positive' | 'danger' | 'warning' | 'neutral';
  style?: ViewStyle;
}

const trendColors = {
  positive: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',
  neutral: '#6B7280',
};

export function MiniMetricCard({
  label,
  value,
  supportingText,
  icon,
  trend,
  trendType = 'neutral',
  style,
}: MiniMetricCardProps) {
  return (
    <View style={[styles.card, style]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {supportingText && <Text style={styles.supportingText}>{supportingText}</Text>}
      {trend && (
        <Text style={[styles.trend, { color: trendColors[trendType] }]}>{trend}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    width: 140,
  },
  iconContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  supportingText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  trend: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
});