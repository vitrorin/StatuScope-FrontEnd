import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AppColors, AppRadii, AppSpacing, AppTypography } from '@/constants/theme';

export interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function EmptyState({ title, message, icon, action, style, testID }: EmptyStateProps) {
  return (
    <View style={[styles.container, style]} testID={testID}>
      {icon ? <View style={styles.iconSlot}>{icon}</View> : null}
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: AppSpacing[5],
    borderRadius: AppRadii['3xl'],
    borderWidth: 1,
    borderColor: AppColors.border.soft,
    backgroundColor: AppColors.surface.subtle,
    padding: AppSpacing.screen,
  },
  iconSlot: {
    marginBottom: AppSpacing[2],
  },
  title: {
    ...AppTypography.textStyles.cardTitle,
    color: AppColors.text.primary,
    textAlign: 'center',
  },
  message: {
    ...AppTypography.textStyles.body,
    color: AppColors.text.body,
    textAlign: 'center',
  },
});
