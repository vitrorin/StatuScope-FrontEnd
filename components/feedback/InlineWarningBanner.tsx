import React from 'react';
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
    icon: '⚠️',
    titleColor: '#DC2626',
    messageColor: '#991B1B',
  },
  warning: {
    background: '#FFFBEB',
    border: '#FDE68A',
    icon: '⚡',
    titleColor: '#D97706',
    messageColor: '#92400E',
  },
  info: {
    background: '#EFF6FF',
    border: '#BFDBFE',
    icon: 'ℹ️',
    titleColor: '#1D4ED8',
    messageColor: '#1E40AF',
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
      <Text style={styles.icon}>{colors.icon}</Text>
      <View style={styles.content}>
        {title && (
          <Text style={[styles.title, { color: colors.titleColor }]}>{title}</Text>
        )}
        <Text style={[styles.message, { color: colors.messageColor }]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    width: '100%',
  },
  icon: {
    fontSize: 16,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
});