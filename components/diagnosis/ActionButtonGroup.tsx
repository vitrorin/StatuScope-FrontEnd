import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Button, ButtonVariant } from '../foundation/Button';

export interface ActionButtonGroupProps {
  primaryLabel: string;
  secondaryLabel: string;
  primaryDisabled?: boolean;
  secondaryDisabled?: boolean;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
  style?: ViewStyle;
  primaryVariant?: ButtonVariant;
  secondaryVariant?: ButtonVariant;
  primaryLeadingIcon?: React.ReactNode;
  secondaryLeadingIcon?: React.ReactNode;
}

export function ActionButtonGroup({
  primaryLabel,
  secondaryLabel,
  primaryDisabled = false,
  secondaryDisabled = false,
  onPrimaryPress,
  onSecondaryPress,
  style,
  primaryVariant = 'primary',
  secondaryVariant = 'secondary',
  primaryLeadingIcon,
  secondaryLeadingIcon,
}: ActionButtonGroupProps) {
  return (
    <View style={[styles.container, style]}>
      <Button
        label={primaryLabel}
        variant={primaryVariant}
        size="lg"
        onPress={onPrimaryPress}
        disabled={primaryDisabled}
        style={styles.button}
        leadingIcon={primaryLeadingIcon}
      />
      <Button
        label={secondaryLabel}
        variant={secondaryVariant}
        size="lg"
        onPress={onSecondaryPress}
        disabled={secondaryDisabled}
        style={styles.button}
        leadingIcon={secondaryLeadingIcon}
      />
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
