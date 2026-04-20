import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

export type MapControlButtonVariant = 'default' | 'primary' | 'ghost';

export interface MapControlButtonProps {
  label?: string;
  icon?: string;
  variant?: MapControlButtonVariant;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function MapControlButton({
  label,
  icon,
  variant = 'default',
  disabled = false,
  onPress,
  style,
}: MapControlButtonProps) {
  const getContainerStyle = () => {
    const base = [styles.container];
    
    switch (variant) {
      case 'primary':
        base.push(styles.containerPrimary);
        break;
      case 'ghost':
        base.push(styles.containerGhost);
        break;
      default:
        base.push(styles.containerDefault);
    }
    
    if (disabled) {
      base.push(styles.containerDisabled);
    }
    
    return base;
  };

  const getTextStyle = () => {
    const base = [styles.text];
    
    switch (variant) {
      case 'primary':
        base.push(styles.textPrimary);
        break;
      case 'ghost':
        base.push(styles.textGhost);
        break;
      default:
        base.push(styles.textDefault);
    }
    
    if (disabled) {
      base.push(styles.textDisabled);
    }
    
    return base;
  };

  return (
    <TouchableOpacity
      style={[getContainerStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={getTextStyle()}>{icon || label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerDefault: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  containerPrimary: {
    backgroundColor: '#1D4ED8',
  },
  containerGhost: {
    backgroundColor: 'transparent',
  },
  containerDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
  textDefault: {
    color: '#374151',
  },
  textPrimary: {
    color: '#FFFFFF',
  },
  textGhost: {
    color: '#6B7280',
  },
  textDisabled: {
    color: '#9CA3AF',
  },
});