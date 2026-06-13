import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AppColors, AppRadii, AppSpacing, AppTypography } from '@/constants/theme';

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
    borderRadius: AppRadii['2xl'],
    borderWidth: 1,
    padding: AppSpacing[7],
  },
  content: {
    flex: 1,
  },
  title: {
    ...AppTypography.textStyles.bodySmall,
    fontWeight: AppTypography.fontWeights.bold,
    textTransform: 'uppercase',
    letterSpacing: AppTypography.letterSpacing.tight,
  },
  subtitle: {
    ...AppTypography.textStyles.captionStrong,
    fontSize: AppTypography.fontSizes.eyebrow,
    marginTop: AppSpacing[2],
  },
  statusBadge: {
    paddingHorizontal: AppSpacing[5],
    paddingVertical: AppSpacing[2],
    borderRadius: AppRadii.pill,
  },
  statusText: {
    ...AppTypography.textStyles.captionStrong,
    fontSize: AppTypography.fontSizes.eyebrow,
    color: AppColors.surface.card,
    textTransform: 'uppercase',
  },
  statusTextPlain: {
    fontSize: AppTypography.fontSizes.bodyMedium,
    lineHeight: AppTypography.lineHeights.bodyRelaxed,
    fontWeight: AppTypography.fontWeights.bold,
    textTransform: 'uppercase',
    letterSpacing: AppTypography.letterSpacing.tight,
  },
});
