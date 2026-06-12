import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AppColors, AppRadii, AppSpacing, AppTypography } from '@/constants/theme';

export interface InfoTileProps {
  label: string;
  value: string;
  helper?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function InfoTile({
  label,
  value,
  helper,
  icon,
  accentColor = AppColors.brand.primary,
  style,
  testID,
}: InfoTileProps) {
  return (
    <View style={[styles.tile, { borderLeftColor: accentColor }, style]} testID={testID}>
      {icon ? <View style={styles.iconSlot}>{icon}</View> : null}
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
        {helper ? <Text style={styles.helper}>{helper}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexDirection: 'row',
    gap: AppSpacing[6],
    borderLeftWidth: 3,
    borderRadius: AppRadii.xl,
    borderWidth: 1,
    borderColor: AppColors.border.soft,
    backgroundColor: AppColors.surface.subtle,
    padding: AppSpacing.card,
  },
  iconSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: AppSpacing[2],
  },
  label: {
    ...AppTypography.textStyles.captionStrong,
    color: AppColors.text.secondary,
    textTransform: 'uppercase',
  },
  value: {
    ...AppTypography.textStyles.bodyStrong,
    color: AppColors.text.primary,
  },
  helper: {
    ...AppTypography.textStyles.caption,
    color: AppColors.text.body,
  },
});
