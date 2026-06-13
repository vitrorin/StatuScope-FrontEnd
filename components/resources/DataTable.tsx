import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AppColors, AppRadii, AppShadows, AppSpacing, AppTypography } from '@/constants/theme';

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
    backgroundColor: AppColors.surface.card,
    borderRadius: AppRadii['3xl'],
    borderWidth: 1,
    borderColor: AppColors.border.muted,
    overflow: 'hidden',
    ...AppShadows.subtle,
    shadowOffset: { width: 0, height: AppSpacing[1] },
    shadowOpacity: 0.05,
    shadowRadius: AppSpacing[4],
    elevation: 2,
  },
  header: {
    backgroundColor: AppColors.surface.disabled,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border.muted,
  },
  headerCompact: {
    paddingVertical: AppSpacing[5],
  },
  headerCell: {
    flex: 1,
    paddingHorizontal: AppSpacing.card,
    paddingVertical: AppSpacing[7],
  },
  headerCellCompact: {
    paddingVertical: AppSpacing[5],
  },
  headerText: {
    ...AppTypography.textStyles.captionStrong,
    fontWeight: AppTypography.fontWeights.semibold,
    color: AppColors.table.muted,
    textTransform: 'uppercase',
    letterSpacing: AppTypography.letterSpacing.eyebrow,
  },
  headerTextCompact: {
    fontSize: AppTypography.fontSizes.eyebrow,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: AppColors.surface.control,
  },
  rowCompact: {
    paddingVertical: AppSpacing[5],
  },
  rowAlternate: {
    backgroundColor: AppColors.table.rowAlt,
  },
  cell: {
    flex: 1,
    paddingHorizontal: AppSpacing.card,
    paddingVertical: AppSpacing[7],
  },
  cellCompact: {
    paddingVertical: AppSpacing[5],
  },
  cellText: {
    ...AppTypography.textStyles.body,
    color: AppColors.text.strong,
  },
  cellTextCompact: {
    ...AppTypography.textStyles.bodySmall,
  },
});
