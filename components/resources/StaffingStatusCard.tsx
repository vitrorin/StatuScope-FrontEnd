import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AppColors, AppRadii, AppShadows, AppSpacing, AppTypography } from '@/constants/theme';

export type StaffingVariant = 'doctor' | 'nurse' | 'specialist' | 'default';

export interface StaffingStatusCardProps {
  title: string;
  subtitle?: string;
  value: string;
  variant?: StaffingVariant;
  highlightColor?: string;
  valueColor?: string;
  icon?: React.ReactNode;
  iconBackgroundColor?: string;
  style?: ViewStyle;
}

const variantColors = {
  doctor: AppColors.roleTone.doctor.accent,
  nurse: AppColors.status.successBright,
  specialist: AppColors.brand.purple,
  default: AppColors.brand.primary,
};

export function StaffingStatusCard({
  title,
  subtitle,
  value,
  variant = 'default',
  highlightColor,
  valueColor,
  icon,
  iconBackgroundColor,
  style,
}: StaffingStatusCardProps) {
  const accentColor = highlightColor || variantColors[variant];

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.accent, { backgroundColor: accentColor }]} />
      <View style={styles.content}>
        <View style={styles.leftCluster}>
          {icon ? (
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: iconBackgroundColor || `${accentColor}14` },
              ]}
            >
              {icon}
            </View>
          ) : null}
          <View style={styles.leftContent}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
        <Text style={[styles.value, { color: valueColor || accentColor }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.surface.card,
    borderRadius: AppRadii['2xl'],
    borderWidth: 1,
    borderColor: AppColors.border.muted,
    flexDirection: 'row',
    overflow: 'hidden',
    ...AppShadows.subtle,
    shadowOpacity: 0.03,
  },
  accent: {
    width: AppSpacing[2],
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: AppSpacing.card,
    paddingVertical: AppSpacing[7],
  },
  leftCluster: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing[6],
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: AppRadii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftContent: {
    flex: 1,
  },
  title: {
    ...AppTypography.textStyles.bodyStrong,
    color: AppColors.text.strong,
    marginBottom: AppSpacing[1],
  },
  subtitle: {
    ...AppTypography.textStyles.caption,
    color: AppColors.table.muted,
  },
  value: {
    fontSize: AppTypography.fontSizes.value,
    lineHeight: AppTypography.lineHeights.sectionTitle,
    fontWeight: AppTypography.fontWeights.bold,
  },
});
