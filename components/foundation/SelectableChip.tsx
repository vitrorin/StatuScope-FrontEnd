import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { AppColors, AppRadii, AppSpacing, AppTypography } from '@/constants/theme';

export interface SelectableChipProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  selectedStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  selectedLabelStyle?: StyleProp<TextStyle>;
  testID?: string;
  accessibilityLabel?: string;
}

export function SelectableChip({
  label,
  selected = false,
  disabled = false,
  icon,
  onPress,
  style,
  selectedStyle,
  labelStyle,
  selectedLabelStyle,
  testID,
  accessibilityLabel,
}: SelectableChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, style, selected && styles.selected, selected && selectedStyle, disabled && styles.disabled]}
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      {icon ? <View style={styles.iconSlot}>{icon}</View> : null}
      <Text style={[styles.label, labelStyle, selected && styles.selectedLabel, selected && selectedLabelStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: AppColors.border.default,
    borderRadius: AppRadii.pill,
    backgroundColor: AppColors.surface.card,
    paddingHorizontal: AppSpacing[7],
    paddingVertical: AppSpacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing[3],
  },
  iconSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    borderColor: AppColors.border.brandMuted,
    backgroundColor: AppColors.surface.brandSoft,
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    ...AppTypography.textStyles.captionStrong,
    color: AppColors.text.secondary,
  },
  selectedLabel: {
    color: AppColors.brand.action,
  },
});
