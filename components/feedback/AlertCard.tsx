import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

export type AlertCardVariant = 'critical' | 'warning' | 'info' | 'neutral';

export interface AlertCardProps {
  title: string;
  description: string;
  variant?: AlertCardVariant;
  style?: ViewStyle;
}

const variantStyles = {
  critical: {
    bar: '#EF4444',
    background: '#FEF2F2',
  },
  warning: {
    bar: '#F59E0B',
    background: '#FFFBEB',
  },
  info: {
    bar: '#1D4ED8',
    background: '#EFF6FF',
  },
  neutral: {
    bar: '#9CA3AF',
    background: '#F9FAFB',
  },
};

export function AlertCard({
  title,
  description,
  variant = 'info',
  style,
}: AlertCardProps) {
  const colors = variantStyles[variant];

  return (
    <View style={[styles.card, { backgroundColor: colors.background }, style]}>
      <View style={[styles.indicator, { backgroundColor: colors.bar }]} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    alignItems: 'stretch',
    overflow: 'hidden',
    width: 320,
  },
  indicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
});