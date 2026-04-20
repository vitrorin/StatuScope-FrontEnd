import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { ProgressMetricRow } from './ProgressMetricRow';

export interface DiseaseBreakdownRow {
  label: string;
  valueText: string;
  progress: number;
  barColor?: string;
}

export interface DiseaseBreakdownSummary {
  label: string;
  value: string;
  valueColor?: string;
}

export interface DiseaseBreakdownCardProps {
  title: string;
  rows: DiseaseBreakdownRow[];
  summaryItems?: DiseaseBreakdownSummary[];
  buttonLabel?: string;
  onButtonPress?: () => void;
  style?: ViewStyle;
}

export function DiseaseBreakdownCard({
  title,
  rows,
  summaryItems,
  buttonLabel,
  onButtonPress,
  style,
}: DiseaseBreakdownCardProps) {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.rowsContainer}>
        {rows.map((row, index) => (
          <ProgressMetricRow
            key={index}
            label={row.label}
            valueText={row.valueText}
            progress={row.progress}
            barColor={row.barColor}
          />
        ))}
      </View>

      {summaryItems && summaryItems.length > 0 && (
        <View style={styles.summaryContainer}>
          {summaryItems.map((item, index) => (
            <View key={index} style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{item.label}</Text>
              <Text style={[styles.summaryValue, item.valueColor && { color: item.valueColor }]}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>
      )}

      {buttonLabel && (
        <TouchableOpacity style={styles.button} onPress={onButtonPress} activeOpacity={0.7}>
          <Text style={styles.buttonText}>{buttonLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    width: 320,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  rowsContainer: {
    marginBottom: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  button: {
    backgroundColor: '#1D4ED8',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});