import React from 'react';
import { DimensionValue, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { AppColors, AppRadii, AppSpacing } from '@/constants/theme';
import { SkeletonLine } from '@/components/feedback/SkeletonLine';

export interface SkeletonBlockProps {
  width?: DimensionValue;
  height?: number;
  rows?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function SkeletonBlock({ width = '100%', height = 120, rows = 0, style, testID }: SkeletonBlockProps) {
  return (
    <View style={[styles.block, { width, minHeight: height }, style]} testID={testID}>
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonLine key={index} width={`${Math.max(42, 86 - index * 12)}%` as DimensionValue} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    borderRadius: AppRadii['3xl'],
    backgroundColor: AppColors.surface.subtle,
    borderWidth: 1,
    borderColor: AppColors.border.soft,
    padding: AppSpacing.card,
    gap: AppSpacing[6],
  },
});
