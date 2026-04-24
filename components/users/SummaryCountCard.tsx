import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

export type SummaryVariant = 'default' | 'info' | 'warning' | 'neutral';

export interface SummaryCountCardProps {
  title: string;
  value: string;
  variant?: SummaryVariant;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const variantStyles = {
  default: {
    iconBg: '#DBEAFE',
    iconColor: '#1D4ED8',
    valueColor: '#111827',
  },
  info: {
    iconBg: '#DBEAFE',
    iconColor: '#2563EB',
    valueColor: '#111827',
  },
  warning: {
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    valueColor: '#111827',
  },
  neutral: {
    iconBg: '#F3F4F6',
    iconColor: '#6B7280',
    valueColor: '#111827',
  },
};

export function SummaryCountCard({
  title,
  value,
  variant = 'default',
  icon,
  style,
}: SummaryCountCardProps) {
  const colors = variantStyles[variant];

  return (
    <View style={[styles.container, style]}>
      {icon && (
        <View style={[styles.iconContainer, { backgroundColor: colors.iconBg }]}>
          <Text style={[styles.icon, { color: colors.iconColor }]}>{icon}</Text>
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color: colors.valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 18,
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
  },
});