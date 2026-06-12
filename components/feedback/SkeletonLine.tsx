import React from 'react';
import { DimensionValue, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { AppColors, AppRadii } from '@/constants/theme';

export interface SkeletonLineProps {
  width: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function SkeletonLine({ width, height = 12, radius = AppRadii.pill, style, testID }: SkeletonLineProps) {
  return <View style={[styles.line, { width, height, borderRadius: radius }, style]} testID={testID} />;
}

const styles = StyleSheet.create({
  line: {
    backgroundColor: AppColors.chart.skeletonLine,
  },
});
