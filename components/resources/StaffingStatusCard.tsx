import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

export type StaffingVariant = 'doctor' | 'nurse' | 'specialist' | 'default';

export interface StaffingStatusCardProps {
  title: string;
  subtitle?: string;
  value: string;
  variant?: StaffingVariant;
  highlightColor?: string;
  valueColor?: string;
  icon?: React.ReactNode;
  iconBackgroundColor?: string;
  style?: ViewStyle;
}

const variantColors = {
  doctor: '#3B82F6',
  nurse: '#22C55E',
  specialist: '#8B5CF6',
  default: '#1D4ED8',
};

export function StaffingStatusCard({
  title,
  subtitle,
  value,
  variant = 'default',
  highlightColor,
  valueColor,
  icon,
  iconBackgroundColor,
  style,
}: StaffingStatusCardProps) {
  const accentColor = highlightColor || variantColors[variant];

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.accent, { backgroundColor: accentColor }]} />
      <View style={styles.content}>
        <View style={styles.leftCluster}>
          {icon ? (
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: iconBackgroundColor || `${accentColor}14` },
              ]}
            >
              {icon}
            </View>
          ) : null}
          <View style={styles.leftContent}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
        <Text style={[styles.value, { color: valueColor || accentColor }]}>{value}</Text>
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
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  accent: {
    width: 4,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  leftCluster: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftContent: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
  },
});
