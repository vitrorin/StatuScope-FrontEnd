import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AppColors, AppSpacing, AppTypography } from '@/constants/theme';

export interface SectionTitleBlockProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
  style?: ViewStyle;
}

export function SectionTitleBlock({
  eyebrow,
  title,
  subtitle,
  rightSlot,
  style,
}: SectionTitleBlockProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftContent}>
        {eyebrow && (
          <Text style={styles.eyebrow}>{eyebrow}</Text>
        )}
        <Text style={styles.title}>{title}</Text>
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>
      {rightSlot && (
        <View style={styles.rightSlot}>
          {rightSlot}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: AppSpacing.card,
    paddingHorizontal: 0,
    width: '100%',
  },
  leftContent: {
    flex: 1,
  },
  eyebrow: {
    ...AppTypography.textStyles.eyebrow,
    fontWeight: AppTypography.fontWeights.medium,
    color: AppColors.brand.link,
    letterSpacing: AppTypography.letterSpacing.eyebrow,
    marginBottom: AppSpacing[3],
  },
  title: {
    ...AppTypography.textStyles.screenTitle,
    color: AppColors.text.strong,
  },
  subtitle: {
    ...AppTypography.textStyles.body,
    color: AppColors.table.muted,
    marginTop: AppSpacing.fieldGap,
  },
  rightSlot: {
    marginLeft: AppSpacing.screen,
    alignItems: 'flex-end',
  },
});
