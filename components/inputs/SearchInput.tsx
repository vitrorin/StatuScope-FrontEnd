import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';

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
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={[
          styles.input,
          disabled && styles.inputDisabled,
        ]}
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
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: 'transparent',
    width: '100%',
  },
  containerFocused: {
    borderColor: '#1D4ED8',
    backgroundColor: '#FFFFFF',
  },
  containerDisabled: {
    backgroundColor: '#F9FAFB',
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    padding: 0,
  },
  inputDisabled: {
    color: '#9CA3AF',
  },
});