import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

export type RiskVariant = 'critical' | 'warning' | 'info';

export interface DiagnosisRiskCardProps {
  title: string;
  subtitle?: string;
  statusText?: string;
  variant?: RiskVariant;
  style?: ViewStyle;
}

const variantStyles = {
  critical: {
    border: '#EF4444',
    background: '#FEF2F2',
    text: '#B91C1C',
  },
  warning: {
    border: '#F59E0B',
    background: '#FFFBEB',
    text: '#B45309',
  },
  info: {
    border: '#3B82F6',
    background: '#EFF6FF',
    text: '#1D4ED8',
  },
};

export function DiagnosisRiskCard({
  title,
  subtitle,
  statusText,
  variant = 'info',
  style,
}: DiagnosisRiskCardProps) {
  const colors = variantStyles[variant];

  return (
    <View style={[
      styles.container,
      { borderColor: colors.border, backgroundColor: colors.background },
      style,
    ]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {statusText && (
        <View style={[styles.statusBadge, { backgroundColor: colors.border }]}>
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});