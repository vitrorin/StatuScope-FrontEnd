import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Button } from '@/components/foundation/Button';
import { AppColors, AppRadii, AppSpacing, AppTypography } from '@/constants/theme';

export interface RetryStateProps {
  title?: string;
  message?: string;
  actionLabel: string;
  onRetry: () => void;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function RetryState({
  title,
  message,
  actionLabel,
  onRetry,
  compact = false,
  style,
  testID,
}: RetryStateProps) {
  return (
    <View style={[styles.container, compact && styles.compact, style]} testID={testID}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Button label={actionLabel} variant="secondary" size="sm" onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: AppSpacing[6],
    borderRadius: AppRadii['3xl'],
    borderWidth: 1,
    borderColor: AppColors.status.dangerBorder,
    backgroundColor: AppColors.status.dangerSoft,
    padding: AppSpacing.screen,
  },
  compact: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    padding: AppSpacing[8],
  },
  title: {
    ...AppTypography.textStyles.cardTitle,
    color: AppColors.status.dangerDeep,
    textAlign: 'center',
  },
  message: {
    ...AppTypography.textStyles.body,
    color: AppColors.text.body,
    textAlign: 'center',
  },
});
