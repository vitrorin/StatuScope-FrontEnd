import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import {
  AppColors,
  AppRadii,
  AppShadows,
  AppSpacing,
  AppTypography,
  withAlpha,
} from '@/constants/theme';

export type SummaryVariant = 'default' | 'info' | 'warning' | 'neutral';

export interface SummaryCountCardProps {
  title: string;
  value: string;
  variant?: SummaryVariant;
  icon?: React.ReactNode;
  caption?: string;
  valueAccent?: React.ReactNode;
  style?: ViewStyle;
}

const variantStyles = {
  default: {
    iconBg: withAlpha(AppColors.brand.primary, 0.08),
    iconColor: AppColors.brand.primary,
    valueColor: AppColors.text.strong,
  },
  info: {
    iconBg: withAlpha(AppColors.brand.primary, 0.08),
    iconColor: AppColors.brand.primary,
    valueColor: AppColors.text.strong,
  },
  warning: {
    iconBg: AppColors.status.warningSoft,
    iconColor: AppColors.status.warningText,
    valueColor: AppColors.text.strong,
  },
  neutral: {
    iconBg: AppColors.surface.control,
    iconColor: AppColors.table.muted,
    valueColor: AppColors.text.strong,
  },
};

export function SummaryCountCard({
  title,
  value,
  variant = 'default',
  icon,
  caption,
  valueAccent,
  style,
}: SummaryCountCardProps) {
  const colors = variantStyles[variant];

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        {icon ? (
          <View style={[styles.iconContainer, { backgroundColor: colors.iconBg }]}>
            {icon}
          </View>
        ) : null}
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: colors.valueColor }]}>{value}</Text>
        {valueAccent ? <View style={styles.valueAccent}>{valueAccent}</View> : null}
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.surface.card,
    borderRadius: AppRadii.xl,
    borderWidth: 1,
    borderColor: withAlpha(AppColors.brand.primary, 0.05),
    padding: AppSpacing[10] + 1,
    ...AppShadows.subtle,
    shadowOpacity: 0.05,
    shadowRadius: AppSpacing[2],
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing[6],
    marginBottom: AppSpacing[7],
  },
  iconContainer: {
    width: AppSpacing[13] ?? 26,
    height: AppSpacing[13] ?? 26,
    borderRadius: AppRadii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...AppTypography.textStyles.captionStrong,
    fontSize: AppTypography.fontSizes.eyebrow,
    color: AppColors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  value: {
    ...AppTypography.textStyles.metricValue,
    fontWeight: AppTypography.fontWeights.black,
  },
  caption: {
    marginLeft: AppSpacing[3],
    marginBottom: AppSpacing[2] + 1,
    ...AppTypography.textStyles.body,
    color: AppColors.text.muted,
  },
  valueAccent: {
    marginLeft: AppSpacing[2] + 1,
    marginBottom: AppSpacing[3],
  },
});
