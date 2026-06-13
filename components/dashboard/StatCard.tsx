import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Badge } from '../foundation/Badge';
import { ProgressBar } from '../foundation/ProgressBar';
import { CardBase } from '../patterns/CardBase';
import {
  AppColors,
  AppRadii,
  AppShadows,
  AppSizes,
  AppSpacing,
  AppTypography,
  withAlpha,
} from '@/constants/theme';

export type StatCardStatus = 'positive' | 'danger' | 'warning' | 'neutral';

export interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  badge?: string;
  status?: StatCardStatus;
  trendText?: string;
  showProgress?: boolean;
  progressValue?: number;
  progressColor?: string;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  isLoading?: boolean;
}

export function StatCard({
  title,
  value,
  subtitle,
  badge,
  status = 'neutral',
  trendText,
  showProgress = false,
  progressValue = 0,
  progressColor = AppColors.brand.primary,
  icon,
  style,
  isLoading = false,
}: StatCardProps) {
  const effectiveStatus = isLoading ? 'neutral' : status;
  const statusStyle = statusStyles[effectiveStatus];
  const tone =
    effectiveStatus === 'positive'
      ? 'success'
      : effectiveStatus === 'danger'
        ? 'critical'
        : effectiveStatus === 'warning'
          ? 'warning'
          : 'neutral';

  return (
    <CardBase style={[styles.card, { borderColor: statusStyle.border }, style]}>
      <View style={[styles.accentBar, { backgroundColor: statusStyle.accent }]} />
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>
        {isLoading ? <View style={styles.skeletonBadge} /> : badge ? <Badge label={badge} tone={tone} style={styles.badge} /> : null}
      </View>
      <View style={styles.valueRow}>
        {icon ? (
          <View style={[styles.iconContainer, { backgroundColor: statusStyle.iconBackground }]}>
            {icon}
          </View>
        ) : null}
        {isLoading ? (
          <View style={styles.skeletonValueBlock}>
            <View style={styles.skeletonValue} />
            <View style={[styles.skeletonValue, styles.skeletonValueShort]} />
          </View>
        ) : <Text style={styles.value}>{value}</Text>}
      </View>
      {isLoading ? (
        <View style={styles.skeletonSubtitleBlock}>
          <View style={styles.skeletonSubtitle} />
          <View style={[styles.skeletonSubtitle, styles.skeletonSubtitleShort]} />
        </View>
      ) : subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {!isLoading && trendText ? <Text style={styles.trendText}>{trendText}</Text> : null}
      {showProgress && !isLoading ? (
        <View style={styles.progressContainer}>
          <ProgressBar value={progressValue} color={progressColor} />
        </View>
      ) : null}
    </CardBase>
  );
}

const statusStyles: Record<StatCardStatus, {
  accent: string;
  border: string;
  iconBackground: string;
}> = {
  positive: {
    accent: AppColors.status.successBright,
    border: withAlpha(AppColors.status.successBright, 0.22),
    iconBackground: withAlpha(AppColors.status.successBright, 0.10),
  },
  danger: {
    accent: AppColors.status.dangerBright,
    border: withAlpha(AppColors.status.dangerBright, 0.22),
    iconBackground: withAlpha(AppColors.status.dangerBright, 0.10),
  },
  warning: {
    accent: AppColors.status.warning,
    border: withAlpha(AppColors.status.warning, 0.24),
    iconBackground: withAlpha(AppColors.status.warning, 0.12),
  },
  neutral: {
    accent: AppColors.text.secondary,
    border: AppColors.border.default,
    iconBackground: AppColors.surface.muted,
  },
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 176,
    padding: AppSpacing.screen,
    paddingTop: AppSpacing[11] ?? 22,
    borderRadius: AppRadii['2xl'],
    backgroundColor: AppColors.surface.frost,
    overflow: 'hidden',
    ...AppShadows.card,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.10,
    shadowRadius: 30,
    elevation: 5,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: AppSpacing[2] + 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: AppSpacing[9],
    gap: AppSpacing[6],
  },
  title: {
    ...AppTypography.textStyles.bodySmall,
    fontWeight: AppTypography.fontWeights.bold,
    color: AppColors.text.secondary,
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
  },
  badge: {
    flexShrink: 0,
    paddingHorizontal: AppSpacing[4] + 1,
    paddingVertical: AppSpacing[2] + 1,
  },
  skeletonBadge: {
    width: AppSpacing[24],
    height: AppSpacing[11] ?? 22,
    borderRadius: AppRadii.pill,
    backgroundColor: AppColors.chart.grid,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: AppSpacing[27] ?? 54,
  },
  iconContainer: {
    width: AppSizes.controlSm,
    height: AppSizes.controlSm,
    borderRadius: AppRadii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: AppSpacing[6],
  },
  value: {
    flexShrink: 1,
    ...AppTypography.textStyles.display,
    lineHeight: AppTypography.lineHeights.metricLarge,
    fontWeight: AppTypography.fontWeights.black,
    color: AppColors.text.primary,
  },
  skeletonValueBlock: {
    gap: AppSpacing[3],
  },
  skeletonValue: {
    width: '62%',
    height: AppTypography.lineHeights.screenTitle,
    borderRadius: AppRadii.pill,
    backgroundColor: AppColors.chart.grid,
  },
  skeletonValueShort: {
    width: '48%',
  },
  subtitle: {
    marginTop: AppSpacing[7],
    ...AppTypography.textStyles.caption,
    lineHeight: AppTypography.lineHeights.captionRelaxed,
    color: AppColors.text.secondary,
  },
  skeletonSubtitleBlock: {
    marginTop: AppSpacing[7],
    gap: AppSpacing[2] + 1,
  },
  skeletonSubtitle: {
    width: '78%',
    height: AppTypography.fontSizes.caption,
    borderRadius: AppRadii.pill,
    backgroundColor: AppColors.chart.grid,
  },
  skeletonSubtitleShort: {
    width: '58%',
  },
  trendText: {
    marginTop: AppSpacing[3],
    ...AppTypography.textStyles.caption,
    color: AppColors.text.muted,
  },
  progressContainer: {
    marginTop: AppSpacing[6],
  },
});
