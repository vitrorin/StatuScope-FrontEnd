import React from 'react';
import { Feather } from '@expo/vector-icons';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AppColors, AppRadii, AppSpacing, AppTypography } from '@/constants/theme';

export type AlertCardVariant = 'critical' | 'warning' | 'success' | 'info' | 'neutral';

export interface AlertCardProps {
  title: string;
  description: string;
  variant?: AlertCardVariant;
  style?: StyleProp<ViewStyle>;
  metadata?: string;
  testID?: string;
}

const variantStyles = {
  critical: {
    bar: AppColors.decorative.alertBarDanger,
    background: AppColors.status.dangerSoft,
    title: AppColors.status.dangerDeep,
    text: AppColors.status.dangerDark,
    icon: 'alert-circle' as const,
  },
  warning: {
    bar: AppColors.status.warning,
    background: AppColors.status.warningWash,
    title: AppColors.status.warningLabel,
    text: AppColors.status.warningStrong,
    icon: 'alert-triangle' as const,
  },
  success: {
    bar: AppColors.status.successBright,
    background: AppColors.status.successWash,
    title: AppColors.status.successText,
    text: AppColors.status.successStrong,
    icon: 'check-circle' as const,
  },
  info: {
    bar: AppColors.decorative.alertBarInfo,
    background: AppColors.status.infoSoft,
    title: AppColors.brand.link,
    text: AppColors.status.info,
    icon: 'info' as const,
  },
  neutral: {
    bar: AppColors.text.muted,
    background: AppColors.surface.subtle,
    title: AppColors.text.body,
    text: AppColors.text.body,
    icon: 'refresh-cw' as const,
  },
};

export function AlertCard({
  title,
  description,
  variant = 'info',
  style,
  metadata,
  testID,
}: AlertCardProps) {
  const colors = variantStyles[variant];

  return (
    <View style={[styles.card, { backgroundColor: colors.background }, style]} testID={testID}>
      <View style={[styles.indicator, { backgroundColor: colors.bar }]} />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Feather name={colors.icon} size={16} color={colors.bar} />
          <Text style={[styles.title, { color: colors.title }]}>{title}</Text>
        </View>
        <Text style={[styles.description, { color: colors.text }]}>{description}</Text>
        {metadata ? <Text style={[styles.metadata, { color: colors.text }]}>{metadata}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: AppRadii.lg,
    paddingVertical: AppSpacing[9],
    paddingRight: AppSpacing[9],
    alignItems: 'stretch',
    overflow: 'hidden',
    width: '100%',
  },
  indicator: {
    width: AppSpacing[2],
    borderRadius: AppRadii.xs,
    marginRight: AppSpacing[9],
    marginLeft: 0,
  },
  content: {
    flex: 1,
    paddingLeft: AppSpacing[1],
    paddingRight: AppSpacing.fieldGap,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing[5],
    marginBottom: AppSpacing.fieldGap,
  },
  title: {
    ...AppTypography.textStyles.body,
    fontWeight: AppTypography.fontWeights.extrabold,
  },
  description: {
    ...AppTypography.textStyles.caption,
    opacity: 0.9,
  },
  metadata: {
    ...AppTypography.textStyles.captionStrong,
    marginTop: AppSpacing[4],
    opacity: 0.82,
  },
});
