import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { AppColors, AppRadii, AppSpacing, AppTypography, withAlpha } from '@/constants/theme';
import { CardBase } from '@/components/patterns/CardBase';

export interface OverlayStatCardProps {
  label: string;
  value: string;
  detail?: string;
  accentColor?: string;
  showAccentBar?: boolean;
  valueFirst?: boolean;
  valueNumberOfLines?: number;
  labelStyle?: StyleProp<TextStyle>;
  valueStyle?: StyleProp<TextStyle>;
  detailStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function OverlayStatCard({
  label,
  value,
  detail,
  accentColor = AppColors.brand.primary,
  showAccentBar = true,
  valueFirst = false,
  valueNumberOfLines,
  labelStyle,
  valueStyle,
  detailStyle,
  style,
  testID,
}: OverlayStatCardProps) {
  return (
    <CardBase style={[styles.card, { borderColor: withAlpha(accentColor, 0.14) }, style]} testID={testID}>
      {showAccentBar ? <View style={[styles.accent, { backgroundColor: accentColor }]} /> : null}
      {valueFirst ? null : <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <Text style={[styles.value, valueStyle]} numberOfLines={valueNumberOfLines}>{value}</Text>
      {valueFirst ? <Text style={[styles.label, labelStyle]}>{label}</Text> : null}
      {detail ? <Text style={[styles.detail, detailStyle]}>{detail}</Text> : null}
    </CardBase>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    borderRadius: AppRadii['3xl'],
    paddingVertical: AppSpacing[5],
    paddingHorizontal: AppSpacing.card,
    paddingLeft: AppSpacing[10],
    justifyContent: 'center',
    gap: AppSpacing[3],
    overflow: 'hidden',
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  label: {
    ...AppTypography.textStyles.captionStrong,
    color: AppColors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: AppTypography.letterSpacing.wide,
  },
  value: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: AppTypography.fontWeights.black,
    color: AppColors.text.primary,
  },
  detail: {
    ...AppTypography.textStyles.caption,
    color: AppColors.text.body,
  },
});
