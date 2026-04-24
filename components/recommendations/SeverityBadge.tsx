import React from 'react';
import { ViewStyle } from 'react-native';
import { Badge } from '../foundation/Badge';

export type SeverityLevel = 'high' | 'medium' | 'low';

export interface SeverityBadgeProps {
  label: string;
  severity: SeverityLevel;
  style?: ViewStyle;
}

export function SeverityBadge({ label, severity, style }: SeverityBadgeProps) {
  return <Badge label={label} tone={severity} style={style} />;
}
