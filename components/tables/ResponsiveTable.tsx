import React from 'react';
import { DimensionValue, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { AppColors, AppRadii, AppShadows, AppSpacing, AppTypography } from '@/constants/theme';
import { EmptyState } from '@/components/feedback/EmptyState';
import { SkeletonLine } from '@/components/feedback/SkeletonLine';

export interface ResponsiveTableColumn<TRow> {
  key: string;
  label: string;
  width?: DimensionValue;
  flex?: number;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  render?: (row: TRow, rowIndex: number) => React.ReactNode;
}

export interface ResponsiveTableProps<TRow> {
  columns: ResponsiveTableColumn<TRow>[];
  rows: TRow[];
  getRowKey: (row: TRow, rowIndex: number) => string;
  loading?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  footer?: React.ReactNode;
  onRowPress?: (row: TRow, rowIndex: number) => void;
  rowStyle?: (row: TRow, rowIndex: number) => StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

function alignment(align?: 'left' | 'center' | 'right') {
  if (align === 'center') return 'center';
  if (align === 'right') return 'flex-end';
  return 'flex-start';
}

export function ResponsiveTable<TRow>({
  columns,
  rows,
  getRowKey,
  loading = false,
  emptyTitle = 'No records',
  emptyMessage,
  footer,
  onRowPress,
  rowStyle,
  style,
  testID,
}: ResponsiveTableProps<TRow>) {
  const columnStyle = (column: ResponsiveTableColumn<TRow>): ViewStyle => ({
    width: column.width,
    flex: column.width ? undefined : column.flex ?? 1,
    minWidth: column.minWidth,
    alignItems: alignment(column.align),
  });

  return (
    <View style={[styles.container, style]} testID={testID}>
      <View style={styles.header}>
        {columns.map((column) => (
          <View key={column.key} style={[styles.headerCell, columnStyle(column)]}>
            <Text style={styles.headerText}>{column.label}</Text>
          </View>
        ))}
      </View>
      {loading ? (
        Array.from({ length: 4 }).map((_, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {columns.map((column, columnIndex) => (
              <View key={column.key} style={[styles.cell, columnStyle(column)]}>
                <SkeletonLine width={columnIndex === 0 ? '72%' : '54%'} height={columnIndex === 0 ? 14 : 12} />
              </View>
            ))}
          </View>
        ))
      ) : rows.length === 0 ? (
        <EmptyState title={emptyTitle} message={emptyMessage} style={styles.empty} />
      ) : (
        rows.map((row, rowIndex) => {
          const content = columns.map((column) => (
            <View key={column.key} style={[styles.cell, columnStyle(column)]}>
              {column.render ? column.render(row, rowIndex) : (
                <Text style={styles.cellText}>{String((row as Record<string, unknown>)[column.key] ?? '')}</Text>
              )}
            </View>
          ));
          const nextStyle = [styles.row, rowIndex % 2 === 1 && styles.rowAlt, rowStyle?.(row, rowIndex)];

          return onRowPress ? (
            <TouchableOpacity key={getRowKey(row, rowIndex)} style={nextStyle} activeOpacity={0.78} onPress={() => onRowPress(row, rowIndex)}>
              {content}
            </TouchableOpacity>
          ) : (
            <View key={getRowKey(row, rowIndex)} style={nextStyle}>
              {content}
            </View>
          );
        })
      )}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
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
  },
  header: {
    flexDirection: 'row',
    backgroundColor: AppColors.surface.disabled,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border.muted,
  },
  headerCell: {
    paddingHorizontal: AppSpacing.card,
    paddingVertical: AppSpacing[7],
  },
  headerText: {
    ...AppTypography.textStyles.captionStrong,
    color: AppColors.table.muted,
    textTransform: 'uppercase',
    letterSpacing: AppTypography.letterSpacing.eyebrow,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: AppColors.surface.control,
    backgroundColor: AppColors.surface.card,
  },
  rowAlt: {
    backgroundColor: AppColors.table.rowAlt,
  },
  cell: {
    justifyContent: 'center',
    paddingHorizontal: AppSpacing.card,
    paddingVertical: AppSpacing[7],
  },
  cellText: {
    ...AppTypography.textStyles.body,
    color: AppColors.text.strong,
  },
  empty: {
    borderWidth: 0,
    borderRadius: AppRadii.none,
    backgroundColor: AppColors.surface.card,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: AppColors.surface.control,
  },
});
