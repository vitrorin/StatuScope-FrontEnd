import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Badge } from '../foundation/Badge';
import { ProgressBar } from '../foundation/ProgressBar';
import { CardBase } from '../patterns/CardBase';

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
  style?: StyleProp<ViewStyle>;
}

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
  const tone =
    status === 'positive'
      ? 'info'
      : status === 'danger'
        ? 'critical'
        : status === 'warning'
          ? 'warning'
          : 'neutral';

  return (
    <CardBase style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {badge ? <Badge label={badge} tone={tone} style={styles.badge} /> : null}
      </View>
      <View style={styles.valueRow}>
        {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
        <Text style={styles.value}>{value}</Text>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {trendText ? <Text style={styles.trendText}>{trendText}</Text> : null}
      {showProgress ? (
        <View style={styles.progressContainer}>
          <ProgressBar value={progressValue} color={progressColor} />
        </View>
      ) : null}
    </CardBase>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 152,
    padding: 28,
    borderRadius: 14,
    borderColor: '#E2E8F0',
    backgroundColor: '#FEFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 26,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: 'rgba(100, 116, 139, 0.84)',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
  },
  iconContainer: {
    marginRight: 10,
  },
  value: {
    flexShrink: 1,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -0.95,
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 16,
    color: '#94A3B8',
  },
  trendText: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 16,
    color: '#94A3B8',
  },
  progressContainer: {
    marginTop: 12,
  },
});
