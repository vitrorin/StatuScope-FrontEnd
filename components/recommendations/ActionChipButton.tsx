import React from 'react';
import { ViewStyle } from 'react-native';
import { Button } from '../foundation/Button';

export type ChipVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ActionChipButtonProps {
  label: string;
  variant?: ChipVariant;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function ActionChipButton({
  label,
  variant = 'secondary',
  disabled = false,
  onPress,
  style,
}: ActionChipButtonProps) {
  return (
    <Button
      label={label}
      variant={variant}
      size="chip"
      disabled={disabled}
      onPress={onPress}
      style={style}
    />
  );
}
