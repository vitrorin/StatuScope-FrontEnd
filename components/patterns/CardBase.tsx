import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { AppColors, AppRadii, AppShadows, AppSpacing } from '@/constants/theme';

export interface CardBaseProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function CardBase({ children, style, testID }: CardBaseProps) {
  return <View style={[styles.card, style]} testID={testID}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.surface.cardSoft,
    borderRadius: AppRadii['2xl'],
    borderWidth: 1,
    borderColor: AppColors.border.default,
    padding: AppSpacing.card,
    ...AppShadows.card,
  },
});
