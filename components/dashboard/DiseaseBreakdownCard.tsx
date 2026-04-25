import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { ProgressMetricRow } from './ProgressMetricRow';

export interface DiseaseBreakdownRow {
  label: string;
  valueText: string;
  progress: number;
  barColor?: string;
  barHeight?: number;
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
  style?: StyleProp<ViewStyle>;
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
            barHeight={row.barHeight ?? 12}
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
    borderWidth: 1,
    borderColor: 'rgba(0, 3, 184, 0.05)',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    width: 320,
  },
  title: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 24,
  },
  rowsContainer: {
    marginBottom: 20,
  },
  summaryContainer: {
    paddingTop: 22,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 18,
    gap: 14,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  button: {
    backgroundColor: 'rgba(0, 3, 184, 0.10)',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    color: '#0003B8',
  },
});
