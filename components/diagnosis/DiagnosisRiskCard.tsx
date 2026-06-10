import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AppColors } from '@/constants/theme';

export type RiskVariant = 'critical' | 'warning' | 'info';

export interface DiagnosisRiskCardProps {
  title: string;
  subtitle?: string;
  statusText?: string;
  variant?: RiskVariant;
  statusTone?: 'badge' | 'text';
  style?: ViewStyle;
}

const variantStyles = {
  critical: {
    border: AppColors.status.dangerBorder,
    background: AppColors.status.dangerSoft,
    text: AppColors.status.dangerDark,
    subtitle: AppColors.status.danger,
  },
  warning: {
    border: AppColors.status.warningBorder,
    background: AppColors.status.warningWash,
    text: AppColors.status.warningStrong,
    subtitle: AppColors.status.warningText,
  },
  info: {
    border: AppColors.status.infoSoft,
    background: AppColors.status.infoSoft,
    text: AppColors.brand.link,
    subtitle: AppColors.status.info,
  },
};

export function DiagnosisRiskCard({
  title,
  subtitle,
  statusText,
  variant = 'info',
  statusTone = 'badge',
  style,
}: DiagnosisRiskCardProps) {
  const colors = variantStyles[variant];

  return (
    <View
      style={[
        styles.container,
        { borderColor: colors.border, backgroundColor: colors.background },
        style,
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.subtitle }]}>{subtitle}</Text> : null}
      </View>

      {statusText ? (
        statusTone === 'badge' ? (
          <View style={[styles.statusBadge, { backgroundColor: colors.text }]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        ) : (
          <Text style={[styles.statusTextPlain, { color: colors.text }]}>{statusText}</Text>
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  subtitle: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    color: AppColors.surface.card,
    textTransform: 'uppercase',
  },
  statusTextPlain: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
});
