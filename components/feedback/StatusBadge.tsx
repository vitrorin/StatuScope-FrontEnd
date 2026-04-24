import React from 'react';
import { ViewStyle } from 'react-native';
import { Badge, BadgeTone } from '../foundation/Badge';

export type StatusBadgeVariant = 'critical' | 'success' | 'warning' | 'neutral' | 'info' | 'role';

export interface StatusBadgeProps {
  label: string;
  variant?: StatusBadgeVariant;
  style?: ViewStyle;
}

export function StatusBadge({
  label,
  variant = 'neutral',
  style,
}: StatusBadgeProps) {
  return <Badge label={label} tone={variant as BadgeTone} style={style} />;
}
