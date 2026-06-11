import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, TextStyle } from 'react-native';
import { Badge } from './Badge';
import { AppColors, AppRadii, AppShadows, AppSpacing, AppTypography } from '@/constants/theme';

export interface SegmentedOption {
  label: string;
  value: string;
  badgeCount?: number;
}

export interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string;
  onChange?: (value: string) => void;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  label?: string;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  segmentStyle?: ViewStyle;
  activeSegmentStyle?: ViewStyle;
  textStyle?: TextStyle;
  activeTextStyle?: TextStyle;
  labelStyle?: TextStyle;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  size = 'md',
  fullWidth = false,
  label,
  style,
  containerStyle,
  segmentStyle,
  activeSegmentStyle,
  textStyle,
  activeTextStyle,
  labelStyle,
}: SegmentedControlProps) {
  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={[styles.label, labelStyle]}>{label}</Text> : null}
      <View style={[styles.container, containerStyle]}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.segment,
                size === 'sm' && styles.segmentSm,
                fullWidth && styles.segmentFullWidth,
                segmentStyle,
                active && styles.segmentActive,
                active && activeSegmentStyle,
              ]}
              onPress={() => onChange?.(option.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.text,
                  size === 'sm' && styles.textSm,
                  textStyle,
                  active && styles.textActive,
                  active && activeTextStyle,
                ]}
              >
                {option.label}
              </Text>
              {option.badgeCount !== undefined && option.badgeCount > 0 ? (
                <View style={styles.badgeWrap}>
                  <Badge label={String(option.badgeCount)} tone={active ? 'info' : 'neutral'} />
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'flex-start',
  },
  label: {
    ...AppTypography.textStyles.captionStrong,
    fontSize: AppTypography.fontSizes.eyebrow,
    color: AppColors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: AppTypography.letterSpacing.eyebrow,
    marginBottom: AppSpacing[4],
  },
  container: {
    flexDirection: 'row',
    backgroundColor: AppColors.surface.control,
    borderRadius: AppRadii.xl,
    padding: AppSpacing[2],
    gap: AppSpacing[2],
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: AppSpacing[5],
    paddingHorizontal: AppSpacing.card,
    borderRadius: AppRadii.lg,
  },
  segmentSm: {
    paddingVertical: AppSpacing[4],
    paddingHorizontal: AppSpacing[7],
    borderRadius: AppRadii.md,
  },
  segmentFullWidth: {
    flex: 1,
  },
  segmentActive: {
    backgroundColor: AppColors.surface.card,
    ...AppShadows.subtle,
  },
  text: {
    ...AppTypography.textStyles.body,
    fontWeight: AppTypography.fontWeights.medium,
    color: AppColors.table.muted,
  },
  textSm: {
    ...AppTypography.textStyles.bodySmall,
  },
  textActive: {
    color: AppColors.text.strong,
    fontWeight: AppTypography.fontWeights.semibold,
  },
  badgeWrap: {
    marginLeft: AppSpacing[4],
  },
});
