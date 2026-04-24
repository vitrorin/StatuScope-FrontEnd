import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, TextStyle } from 'react-native';
import { Badge } from './Badge';

export interface SegmentedOption {
  label: string;
  value: string;
  badgeCount?: number;
}

export interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string;
  onChange?: (value: string) => void;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  label?: string;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  segmentStyle?: ViewStyle;
  activeSegmentStyle?: ViewStyle;
  textStyle?: TextStyle;
  activeTextStyle?: TextStyle;
  labelStyle?: TextStyle;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  size = 'md',
  fullWidth = false,
  label,
  style,
  containerStyle,
  segmentStyle,
  activeSegmentStyle,
  textStyle,
  activeTextStyle,
  labelStyle,
}: SegmentedControlProps) {
  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={[styles.label, labelStyle]}>{label}</Text> : null}
      <View style={[styles.container, containerStyle]}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.segment,
                size === 'sm' && styles.segmentSm,
                fullWidth && styles.segmentFullWidth,
                segmentStyle,
                active && styles.segmentActive,
                active && activeSegmentStyle,
              ]}
              onPress={() => onChange?.(option.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.text,
                  size === 'sm' && styles.textSm,
                  textStyle,
                  active && styles.textActive,
                  active && activeTextStyle,
                ]}
              >
                {option.label}
              </Text>
              {option.badgeCount !== undefined && option.badgeCount > 0 ? (
                <View style={styles.badgeWrap}>
                  <Badge label={String(option.badgeCount)} tone={active ? 'info' : 'neutral'} />
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  segmentSm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  segmentFullWidth: {
    flex: 1,
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  textSm: {
    fontSize: 13,
  },
  textActive: {
    color: '#111827',
    fontWeight: '600',
  },
  badgeWrap: {
    marginLeft: 8,
  },
});
