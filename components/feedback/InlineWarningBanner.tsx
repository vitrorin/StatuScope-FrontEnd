import React from 'react';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

export type InlineWarningBannerVariant = 'critical' | 'warning' | 'info';

export interface InlineWarningBannerProps {
  title?: string;
  message: string;
  variant?: InlineWarningBannerVariant;
  style?: ViewStyle;
}

const variantStyles = {
  critical: {
    background: '#FEF2F2',
    border: '#FECACA',
    titleColor: '#DC2626',
    messageColor: '#B91C1C',
    icon: 'alert-triangle' as const,
  },
  warning: {
    background: '#FFFBEB',
    border: '#FDE68A',
    titleColor: '#D97706',
    messageColor: '#92400E',
    icon: 'zap' as const,
  },
  info: {
    background: '#EFF6FF',
    border: '#BFDBFE',
    titleColor: '#1D4ED8',
    messageColor: '#1E40AF',
    icon: 'info' as const,
  },
};

export function InlineWarningBanner({
  title,
  message,
  variant = 'warning',
  style,
}: InlineWarningBannerProps) {
  const colors = variantStyles[variant];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, borderColor: colors.border },
        style,
      ]}
    >
      <Feather name={colors.icon} size={16} color={colors.titleColor} style={styles.icon} />
      <View style={styles.content}>
        {title ? <Text style={[styles.title, { color: colors.titleColor }]}>{title}</Text> : null}
        <Text style={[styles.message, { color: colors.messageColor }]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
  },
  icon: {
    marginRight: 12,
    marginTop: 1,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  message: {
    fontSize: 12,
    lineHeight: 18,
  },
});
