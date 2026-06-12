import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { AppSpacing } from '@/constants/theme';

export interface FormRowProps {
  children?: React.ReactNode;
  columns?: 1 | 2 | 3;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function FormRow({ children, columns = 2, style, testID }: FormRowProps) {
  return (
    <View style={[styles.row, columns === 1 && styles.single, style]} testID={testID}>
      {React.Children.map(children, (child) => (
        <View style={columns === 1 ? styles.full : styles.cell}>{child}</View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: AppSpacing[6],
    flexWrap: 'wrap',
  },
  single: {
    flexDirection: 'column',
  },
  cell: {
    flex: 1,
    minWidth: 220,
  },
  full: {
    width: '100%',
  },
});
