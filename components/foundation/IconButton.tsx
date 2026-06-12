import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Button, ButtonVariant } from './Button';

export interface IconButtonProps {
  icon: React.ReactNode;
  variant?: ButtonVariant;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}

export function IconButton({
  icon,
  variant = 'secondary',
  disabled = false,
  onPress,
  style,
  testID,
  accessibilityLabel,
}: IconButtonProps) {
  return (
    <Button
      size="icon"
      variant={variant}
      disabled={disabled}
      onPress={onPress}
      style={style}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      {icon}
    </Button>
  );
}
