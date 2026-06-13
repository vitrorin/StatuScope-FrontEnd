import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { AppColors } from '@/constants/theme';

export interface ProgressBarProps {
  value: number;
  color?: string;
  trackColor?: string;
  height?: number;
  style?: ViewStyle;
}

export function ProgressBar({
  value,
  color = AppColors.brand.link,
  trackColor = AppColors.border.muted,
  height = 6,
  style,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, value));

  return (
    <View style={[styles.track, { backgroundColor: trackColor, height, borderRadius: height / 2 }, style]}>
      <View
        style={[
          styles.fill,
          {
            width: `${percentage}%`,
            backgroundColor: color,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
