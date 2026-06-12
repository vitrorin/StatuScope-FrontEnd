import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { AppColors } from '@/constants/theme';

export interface MiniBarChartBar {
  label: string;
  value: number;
  active?: boolean;
}

export interface MiniBarChartListItem {
  label: string;
  value: string;
}

export interface MiniBarChartCardProps {
  title: string;
  subtitle?: string;
  bars: MiniBarChartBar[];
  listItems?: MiniBarChartListItem[];
  listTitle?: string;
  headerAccessory?: React.ReactNode;
  buttonLabel?: string;
  onButtonPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function MiniBarChartCard({
  title,
  subtitle,
  bars,
  listItems,
  listTitle,
  headerAccessory,
  buttonLabel,
  onButtonPress,
  style,
}: MiniBarChartCardProps) {
  const maxValue = Math.max(...bars.map(b => b.value), 1);

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {headerAccessory ? <View>{headerAccessory}</View> : null}
      </View>

      <View style={styles.chartContainer}>
        {bars.map((bar, index) => {
          const heightPercent = (bar.value / maxValue) * 100;
          const isActive = bar.active !== undefined ? bar.active : false;
          
          return (
            <View key={index} style={styles.barWrapper}>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${heightPercent}%`,
                      backgroundColor: isActive ? AppColors.brand.primary : AppColors.border.default,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{bar.label}</Text>
            </View>
          );
        })}
      </View>

      {listItems && listItems.length > 0 && (
        <View style={styles.listContainer}>
          {listTitle ? <Text style={styles.listTitle}>{listTitle}</Text> : null}
          {listItems.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.listLabel}>{item.label}</Text>
              <Text style={styles.listValue}>{item.value}</Text>
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
    backgroundColor: AppColors.surface.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: AppColors.shadow.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    width: 320,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.strong,
  },
  subtitle: {
    fontSize: 12,
    color: AppColors.table.muted,
    marginTop: 4,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    width: 24,
    height: 80,
    backgroundColor: AppColors.surface.control,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 6,
    minHeight: 8,
  },
  barLabel: {
    fontSize: 10,
    color: AppColors.table.muted,
    marginTop: 8,
  },
  listContainer: {
    borderTopWidth: 1,
    borderTopColor: AppColors.border.muted,
    paddingTop: 16,
    marginBottom: 16,
  },
  listTitle: {
    marginBottom: 12,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    color: AppColors.text.secondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  listLabel: {
    fontSize: 13,
    color: AppColors.table.muted,
  },
  listValue: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.text.strong,
  },
  button: {
    backgroundColor: AppColors.surface.control,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: AppColors.text.body,
  },
});
