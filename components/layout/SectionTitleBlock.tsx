import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

export interface SectionTitleBlockProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
  style?: ViewStyle;
}

export function SectionTitleBlock({
  eyebrow,
  title,
  subtitle,
  rightSlot,
  style,
}: SectionTitleBlockProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftContent}>
        {eyebrow && (
          <Text style={styles.eyebrow}>{eyebrow}</Text>
        )}
        <Text style={styles.title}>{title}</Text>
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>
      {rightSlot && (
        <View style={styles.rightSlot}>
          {rightSlot}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 0,
    width: '100%',
  },
  leftContent: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1D4ED8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 20,
  },
  rightSlot: {
    marginLeft: 24,
    alignItems: 'flex-end',
  },
});