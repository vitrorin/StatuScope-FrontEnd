import React from 'react';
import { ViewStyle } from 'react-native';
import { SegmentedControl } from '../foundation/SegmentedControl';

export interface TimeFilterOption {
  label: string;
  value: string;
}

export interface TimeFilterTabsProps {
  options: TimeFilterOption[];
  value: string;
  onChange?: (value: string) => void;
  style?: ViewStyle;
}

export function TimeFilterTabs({
  options,
  value,
  onChange,
  style,
}: TimeFilterTabsProps) {
  return <SegmentedControl options={options} value={value} onChange={onChange} size="sm" style={style} />;
}
