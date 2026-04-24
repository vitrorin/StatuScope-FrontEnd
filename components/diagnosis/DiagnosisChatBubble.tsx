import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

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
      <Text style={[
        styles.message,
        isUser ? styles.userMessage : styles.assistantMessage,
        compact && styles.compactMessage,
      ]}>
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
    backgroundColor: '#1D4ED8',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantContainer: {
    backgroundColor: '#F5F7FB',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessage: {
    color: '#FFFFFF',
  },
  assistantMessage: {
    color: '#111827',
  },
  compactMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
});