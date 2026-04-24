import React from 'react';
import { ViewStyle } from 'react-native';
import { Avatar, AvatarSize, AvatarTone } from '../foundation/Avatar';

export type AvatarVariant = 'default' | 'doctor' | 'admin' | 'neutral';

export interface UserAvatarBadgeProps {
  initials: string;
  variant?: AvatarVariant;
  size?: AvatarSize;
  style?: ViewStyle;
}

export function UserAvatarBadge({
  initials,
  variant = 'default',
  size = 'md',
  style,
}: UserAvatarBadgeProps) {
  return <Avatar initials={initials} tone={variant as AvatarTone} size={size} style={style} />;
}
