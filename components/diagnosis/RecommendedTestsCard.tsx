import React from 'react';
import { Feather } from '@expo/vector-icons';
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
      <View style={styles.header}>
        <Feather name="activity" size={12} color="#0003B8" />
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.list}>
        {tests.map((test, index) => (
          <View key={`${test.label}-${index}`} style={styles.item}>
            <View style={styles.itemContent}>
              <Text style={styles.label}>{test.label}</Text>
              {test.secondaryText ? <Text style={styles.secondary}>{test.secondaryText}</Text> : null}
            </View>
            <Feather name="plus-circle" size={12} color="#CBD5E1" />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DCE6F5',
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  list: {
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6EDF8',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  itemContent: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  secondary: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    color: '#94A3B8',
  },
});
