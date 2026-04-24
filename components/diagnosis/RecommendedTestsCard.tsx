import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

export interface TestItem {
  label: string;
  secondaryText?: string;
}

export interface RecommendedTestsCardProps {
  title?: string;
  tests: TestItem[];
  style?: ViewStyle;
}

export function RecommendedTestsCard({
  title = 'Recommended Tests',
  tests,
  style,
}: RecommendedTestsCardProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.list}>
        {tests.map((test, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.bullet}>•</Text>
            <View style={styles.itemContent}>
              <Text style={styles.label}>{test.label}</Text>
              {test.secondaryText && (
                <Text style={styles.secondary}>{test.secondaryText}</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  list: {
    gap: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 14,
    color: '#1D4ED8',
    marginRight: 10,
    lineHeight: 20,
  },
  itemContent: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  secondary: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
});