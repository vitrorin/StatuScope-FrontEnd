import React from 'react';
import { Feather } from '@expo/vector-icons';
import { ViewStyle } from 'react-native';
import { IconButton } from '../foundation/IconButton';
import { AppColors } from '@/constants/theme';

export type MapControlButtonVariant = 'default' | 'primary' | 'ghost';

export interface MapControlButtonProps {
  icon?: 'plus' | 'minus' | 'settings';
  variant?: MapControlButtonVariant;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function MapControlButton({
  icon = 'plus',
  variant = 'default',
  disabled = false,
  onPress,
  style,
}: MapControlButtonProps) {
  const mappedVariant =
    variant === 'primary' ? 'primary' : variant === 'ghost' ? 'ghost' : 'secondary';

  const iconName = icon === 'minus' ? 'minus' : icon === 'settings' ? 'settings' : 'plus';

  return (
    <IconButton
      icon={<Feather name={iconName} size={18} color={AppColors.text.body} />}
      variant={mappedVariant}
      onPress={onPress}
      disabled={disabled}
      style={style}
    />
  );
}
