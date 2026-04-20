import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

export type DetectionBannerVariant = 'info' | 'warning' | 'critical';

export interface DetectionBannerProps {
  message: string;
  actionLabel?: string;
  variant?: DetectionBannerVariant;
  onActionPress?: () => void;
  style?: ViewStyle;
}

const variantStyles = {
  info: {
    background: '#EEF2FF',
    icon: '🔍',
    messageColor: '#3730A3',
  },
  warning: {
    background: '#FEF3C7',
    icon: '⚠️',
    messageColor: '#92400E',
  },
  critical: {
    background: '#FEE2E2',
    icon: '🚨',
    messageColor: '#991B1B',
  },
};

export function DetectionBanner({
  message,
  actionLabel,
  variant = 'info',
  onActionPress,
  style,
}: DetectionBannerProps) {
  const colors = variantStyles[variant];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
        style,
      ]}
    >
      <Text style={styles.icon}>{colors.icon}</Text>
      <Text style={[styles.message, { color: colors.messageColor }]}>{message}</Text>
      {actionLabel && (
        <TouchableOpacity onPress={onActionPress} activeOpacity={0.7}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    width: '100%',
  },
  icon: {
    fontSize: 14,
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  action: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D4ED8',
    marginLeft: 12,
  },
});