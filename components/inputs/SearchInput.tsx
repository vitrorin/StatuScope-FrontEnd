import React, { useState } from 'react';
import { StyleSheet, TextInput, View, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';

export interface SearchInputProps {
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: ViewStyle;
}

export function SearchInput({
  placeholder = 'Search...',
  value,
  disabled = false,
  onChangeText,
  onFocus,
  onBlur,
  style,
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <View
      style={[
        styles.container,
        isFocused && styles.containerFocused,
        disabled && styles.containerDisabled,
        style,
      ]}
    >
      <Feather name="search" size={16} color={disabled ? '#CBD5E1' : '#94A3B8'} />
      <TextInput
        style={[styles.input, disabled && styles.inputDisabled]}
        placeholder={placeholder}
        placeholderTextColor={disabled ? '#D1D5DB' : '#94A3B8'}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        editable={!disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: 'transparent',
    width: '100%',
  },
  containerFocused: {
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  containerDisabled: {
    backgroundColor: '#F8FAFC',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    padding: 0,
  },
  inputDisabled: {
    color: '#9CA3AF',
  },
});
