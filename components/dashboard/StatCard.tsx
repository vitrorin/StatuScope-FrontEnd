import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

export type StatCardStatus = 'positive' | 'danger' | 'warning' | 'neutral';

export interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  badge?: string;
  status?: StatCardStatus;
  trendText?: string;
  showProgress?: boolean;
  progressValue?: number;
  progressColor?: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const statusColors = {
  positive: {
    background: '#DCFCE7',
    text: '#22C55E',
  },
  danger: {
    background: '#FEE2E2',
    text: '#EF4444',
  },
  warning: {
    background: '#FEF3C7',
    text: '#F59E0B',
  },
  neutral: {
    background: '#F3F4F6',
    text: '#6B7280',
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  badge,
  status = 'neutral',
  trendText,
  showProgress = false,
  progressValue = 0,
  progressColor = '#1D4ED8',
  icon,
  style,
}: StatCardProps) {
  const colors = statusColors[status];

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {badge && (
          <View style={[styles.badge, { backgroundColor: colors.background }]}>
            <Text style={[styles.badgeText, { color: colors.text }]}>{badge}</Text>
          </View>
        )}
      </View>
      <View style={styles.valueRow}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={styles.value}>{value}</Text>
      </View>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {trendText && (
        <Text style={[styles.trendText, { color: colors.text }]}>{trendText}</Text>
      )}
      {showProgress && (
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, Math.max(0, progressValue))}%`, backgroundColor: progressColor },
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    width: 220,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    letterSpacing: 0.3,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});