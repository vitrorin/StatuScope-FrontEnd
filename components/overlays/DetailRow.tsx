import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { AppColors, AppRadii, AppSpacing, AppTypography } from '@/constants/theme';

export interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  tone?: 'default' | 'muted' | 'strong';
  boxed?: boolean;
  labelStyle?: StyleProp<TextStyle>;
  valueStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function DetailRow({ label, value, tone = 'default', boxed = false, labelStyle, valueStyle, style, testID }: DetailRowProps) {
  return (
    <View style={[boxed && styles.boxed, style]} testID={testID}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <Text style={[styles.value, tone === 'muted' && styles.muted, tone === 'strong' && styles.strong, valueStyle]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  boxed: {
    backgroundColor: AppColors.surface.subtle,
    borderRadius: AppRadii['2xl'],
    borderWidth: 1,
    borderColor: AppColors.border.soft,
    padding: AppSpacing.card,
  },
  label: {
    ...AppTypography.textStyles.captionStrong,
    color: AppColors.text.secondary,
    textTransform: 'uppercase',
  },
  value: {
    ...AppTypography.textStyles.bodyStrong,
    color: AppColors.text.primary,
    marginTop: AppSpacing[3],
  },
  muted: {
    color: AppColors.text.body,
    fontWeight: AppTypography.fontWeights.regular,
  },
  strong: {
    color: AppColors.brand.primary,
  },
});
