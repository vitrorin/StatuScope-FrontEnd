import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';

export interface AssistantInputBarProps {
  placeholder?: string;
  value?: string;
  showSendButton?: boolean;
  disabled?: boolean;
  onChangeText?: (text: string) => void;
  onSendPress?: () => void;
  style?: ViewStyle;
}

export function AssistantInputBar({
  placeholder = 'Ask AI for further differential diagnosis...',
  value,
  showSendButton = true,
  disabled = false,
  onChangeText,
  onSendPress,
  style,
}: AssistantInputBarProps) {
  return (
    <View style={[styles.container, disabled && styles.containerDisabled, style]}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        editable={!disabled}
        multiline
      />
      {showSendButton && (
        <TouchableOpacity
          style={[styles.sendButton, disabled && styles.sendButtonDisabled]}
          onPress={onSendPress}
          disabled={disabled || !value}
          activeOpacity={0.7}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 52,
  },
  containerDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#F3F4F6',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 0,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  sendIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});