import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { AppColors } from '@/constants/theme';

export interface CardBaseProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function CardBase({ children, style }: CardBaseProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.surface.cardSoft,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.border.default,
    padding: 16,
    shadowColor: AppColors.text.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
});
