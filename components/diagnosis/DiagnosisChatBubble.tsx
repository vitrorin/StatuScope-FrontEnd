import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AppColors } from '@/constants/theme';

export type ChatSender = 'user' | 'assistant';

export interface DiagnosisChatBubbleProps {
  message: string;
  sender: ChatSender;
  compact?: boolean;
  style?: ViewStyle;
}

export function DiagnosisChatBubble({
  message,
  sender,
  compact = false,
  style,
}: DiagnosisChatBubbleProps) {
  const isUser = sender === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer, style]}>
      <Text
        style={[
          styles.message,
          isUser ? styles.userMessage : styles.assistantMessage,
          compact && styles.compactMessage,
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '85%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  userContainer: {
    backgroundColor: AppColors.brand.primary,
    alignSelf: 'flex-end',
  },
  assistantContainer: {
    backgroundColor: AppColors.surface.subtle,
    alignSelf: 'flex-start',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessage: {
    color: AppColors.surface.card,
  },
  assistantMessage: {
    color: AppColors.text.primary,
  },
  compactMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
});
