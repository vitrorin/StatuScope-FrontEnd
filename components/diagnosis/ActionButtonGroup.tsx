import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Button } from '../foundation/Button';

export interface ActionButtonGroupProps {
  primaryLabel: string;
  secondaryLabel: string;
  primaryDisabled?: boolean;
  secondaryDisabled?: boolean;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
  style?: ViewStyle;
}

export function ActionButtonGroup({
  primaryLabel,
  secondaryLabel,
  primaryDisabled = false,
  secondaryDisabled = false,
  onPrimaryPress,
  onSecondaryPress,
  style,
}: ActionButtonGroupProps) {
  return (
    <View style={[styles.container, style]}>
      <Button label={primaryLabel} variant="primary" size="lg" onPress={onPrimaryPress} disabled={primaryDisabled} style={styles.button} />

      <Button label={secondaryLabel} variant="secondary" size="lg" onPress={onSecondaryPress} disabled={secondaryDisabled} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});
