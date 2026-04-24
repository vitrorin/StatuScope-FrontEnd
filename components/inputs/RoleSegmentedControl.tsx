import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';
import { SegmentedControl } from '../foundation/SegmentedControl';

export interface SegmentOption {
  label: string;
  value: string;
}

export interface RoleSegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange?: (value: string) => void;
  style?: ViewStyle;
  label?: string;
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  segmentStyle?: ViewStyle;
  activeSegmentStyle?: ViewStyle;
  textStyle?: TextStyle;
  activeTextStyle?: TextStyle;
  fullWidth?: boolean;
}

export function RoleSegmentedControl({
  options,
  value,
  onChange,
  style,
  label,
  labelStyle,
  containerStyle,
  segmentStyle,
  activeSegmentStyle,
  textStyle,
  activeTextStyle,
  fullWidth = true,
}: RoleSegmentedControlProps) {
  return (
    <SegmentedControl
      options={options}
      value={value}
      onChange={onChange}
      fullWidth={fullWidth}
      style={style}
      label={label}
      labelStyle={labelStyle}
      containerStyle={containerStyle}
      segmentStyle={segmentStyle}
      activeSegmentStyle={activeSegmentStyle}
      textStyle={textStyle}
      activeTextStyle={activeTextStyle}
    />
  );
}
