import React from 'react';
import { ViewStyle } from 'react-native';
import { SegmentedControl } from '../foundation/SegmentedControl';

export interface TabOption {
  label: string;
  value: string;
  badgeCount?: number;
}

export interface RecommendationTabsProps {
  options: TabOption[];
  value: string;
  onChange?: (value: string) => void;
  style?: ViewStyle;
}

export function RecommendationTabs({
  options,
  value,
  onChange,
  style,
}: RecommendationTabsProps) {
  return <SegmentedControl options={options} value={value} onChange={onChange} style={style} />;
}
