import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Button } from '@/components/foundation/Button';
import { AppSpacing } from '@/constants/theme';

export interface ModalFormActionsProps {
  cancelLabel: string;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: () => void;
  submitVariant?: 'primary' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function ModalFormActions({
  cancelLabel,
  submitLabel,
  onCancel,
  onSubmit,
  submitVariant = 'primary',
  disabled = false,
  style,
  testID,
}: ModalFormActionsProps) {
  return (
    <View style={[styles.actions, style]} testID={testID}>
      <Button label={cancelLabel} variant="secondary" onPress={onCancel} />
      <Button label={submitLabel} variant={submitVariant} disabled={disabled} onPress={onSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: AppSpacing[6],
    flexWrap: 'wrap',
  },
});
