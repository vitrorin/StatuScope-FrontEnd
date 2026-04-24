import React from 'react';
import { ViewStyle } from 'react-native';
import { SegmentedControl } from '../foundation/SegmentedControl';

export interface RangeOption {
  label: string;
  value: string;
}

export interface RangeSelectorProps {
  options: RangeOption[];
  value: string;
  label?: string;
  onChange?: (value: string) => void;
  style?: ViewStyle;
}

export function RangeSelector({
  options,
  value,
  label,
  onChange,
  style,
}: RangeSelectorProps) {
  return (
    <SegmentedControl
      options={options}
      value={value}
      onChange={onChange}
      label={label}
      size="sm"
      style={style}
    />
  );
}
