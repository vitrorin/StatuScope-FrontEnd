import React from 'react';
import { Platform, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AppColors, AppRadii, AppSpacing, AppTypography } from '@/constants/theme';

export interface PdfPreviewFrameProps {
  url?: string | null;
  title: string;
  fallbackText?: string;
  framed?: boolean;
  iframeStyle?: React.CSSProperties;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function PdfPreviewFrame({
  url,
  title,
  fallbackText = 'PDF preview unavailable',
  framed = false,
  iframeStyle,
  style,
  testID,
}: PdfPreviewFrameProps) {
  if (Platform.OS === 'web' && url) {
    const frame = React.createElement('iframe', {
      src: url,
      title,
      style: {
        width: '100%',
        height: '100%',
        minHeight: 420,
        border: '0',
        backgroundColor: AppColors.surface.card,
        ...iframeStyle,
      },
    });

    return framed ? (
      <View style={[styles.frame, style]} testID={testID}>
        {frame}
      </View>
    ) : (
      frame
    );
  }

  return (
    <View style={[styles.frame, styles.fallback, style]} testID={testID}>
      <Text style={styles.fallbackTitle}>{title}</Text>
      <Text style={styles.fallbackText}>{fallbackText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    minHeight: 420,
    borderWidth: 1,
    borderColor: AppColors.border.panelSoft,
    borderRadius: AppRadii['3xl'],
    overflow: 'hidden',
    backgroundColor: AppColors.surface.card,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: AppSpacing.screen,
    gap: AppSpacing[4],
  },
  fallbackTitle: {
    ...AppTypography.textStyles.cardTitle,
    color: AppColors.text.primary,
    textAlign: 'center',
  },
  fallbackText: {
    ...AppTypography.textStyles.body,
    color: AppColors.text.body,
    textAlign: 'center',
  },
});
