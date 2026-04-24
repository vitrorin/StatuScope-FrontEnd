import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps {
  columns: TableColumn[];
  rows: Record<string, any>[];
  compact?: boolean;
  style?: ViewStyle;
}

export function DataTable({
  columns,
  rows,
  compact = false,
  style,
}: DataTableProps) {
  const getAlignment = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'center';
      case 'right':
        return 'flex-end';
      default:
        return 'flex-start';
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={[styles.header, compact && styles.headerCompact]}>
        {columns.map((column) => (
          <View
            key={column.key}
            style={[
              styles.headerCell,
              { alignItems: getAlignment(column.align) },
              compact && styles.headerCellCompact,
            ]}
          >
            <Text style={[styles.headerText, compact && styles.headerTextCompact]}>
              {column.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Rows */}
      {rows.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={[
            styles.row,
            compact && styles.rowCompact,
            rowIndex % 2 === 1 && styles.rowAlternate,
          ]}
        >
          {columns.map((column) => (
            <View
              key={column.key}
              style={[
                styles.cell,
                { alignItems: getAlignment(column.align) },
                compact && styles.cellCompact,
              ]}
            >
              {typeof row[column.key] === 'object' ? (
                row[column.key]
              ) : (
                <Text style={[styles.cellText, compact && styles.cellTextCompact]}>
                  {row[column.key]}
                </Text>
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    backgroundColor: '#F9FAFB',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerCompact: {
    paddingVertical: 10,
  },
  headerCell: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerCellCompact: {
    paddingVertical: 10,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTextCompact: {
    fontSize: 11,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rowCompact: {
    paddingVertical: 10,
  },
  rowAlternate: {
    backgroundColor: '#FAFAFA',
  },
  cell: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cellCompact: {
    paddingVertical: 10,
  },
  cellText: {
    fontSize: 14,
    color: '#111827',
  },
  cellTextCompact: {
    fontSize: 13,
  },
});