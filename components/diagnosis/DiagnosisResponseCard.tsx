import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

export interface DiagnosisResponseCardProps {
  title?: string;
  responseText: string;
  highlightText?: string;
  warningMessage?: string;
  showWarning?: boolean;
  leadingIcon?: React.ReactNode;
  style?: ViewStyle;
}

export function DiagnosisResponseCard({
  title,
  responseText,
  highlightText,
  warningMessage,
  showWarning = false,
  leadingIcon,
  style,
}: DiagnosisResponseCardProps) {
  const renderText = () => {
    if (!highlightText) {
      return <Text style={styles.text}>{responseText}</Text>;
    }

    const parts = responseText.split(highlightText);
    return (
      <Text style={styles.text}>
        {parts[0]}
        <Text style={styles.highlight}>{highlightText}</Text>
        {parts[1]}
      </Text>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {(title || leadingIcon) && (
        <View style={styles.header}>
          {leadingIcon && <View style={styles.icon}>{leadingIcon}</View>}
          {title && <Text style={styles.title}>{title}</Text>}
        </View>
      )}
      <View style={styles.content}>
        {renderText()}
      </View>
      {showWarning && warningMessage && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>{warningMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
  },
  highlight: {
    color: '#EF4444',
    fontWeight: '600',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  warningIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#B91C1C',
    lineHeight: 18,
  },
});