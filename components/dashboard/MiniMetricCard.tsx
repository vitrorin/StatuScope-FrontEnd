import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AppColors } from '@/constants/theme';

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
  positive: AppColors.status.successBright,
  danger: AppColors.status.dangerBright,
  warning: AppColors.status.warning,
  neutral: AppColors.table.muted,
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
    backgroundColor: AppColors.surface.card,
    borderRadius: 14,
    padding: 14,
    shadowColor: AppColors.shadow.black,
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
    color: AppColors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: AppColors.text.strong,
  },
  supportingText: {
    fontSize: 11,
    color: AppColors.table.muted,
    marginTop: 4,
  },
  trend: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
});
