import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { AppColors, AppRadii, AppSizes, AppSpacing, AppTypography } from '@/constants/theme';

export interface OverlayHeaderProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  onBack?: () => void;
  closeLabel?: string;
  backLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function OverlayHeader({
  title,
  eyebrow,
  subtitle,
  icon,
  onClose,
  onBack,
  closeLabel = 'Close',
  backLabel = 'Back',
  style,
  testID,
}: OverlayHeaderProps) {
  return (
    <View style={[styles.header, style]} testID={testID}>
      {onBack ? (
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.75}
          onPress={onBack}
          accessibilityLabel={backLabel}
          testID={testID ? `${testID}-back` : undefined}
        >
          <Feather name="arrow-left" size={AppSizes.iconMd} color={AppColors.brand.primary} />
        </TouchableOpacity>
      ) : null}
      {icon ? <View style={styles.iconSlot}>{icon}</View> : null}
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {onClose ? (
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.75}
          onPress={onClose}
          accessibilityLabel={closeLabel}
          testID={testID ? `${testID}-close` : undefined}
        >
          <Feather name="x" size={AppSizes.iconMd} color={AppColors.text.secondary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: AppSpacing[6],
  },
  iconSlot: {
    width: AppSizes.controlLg,
    height: AppSizes.controlLg,
    borderRadius: AppRadii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.surface.brandSoft,
  },
  copy: {
    flex: 1,
    gap: AppSpacing[2],
  },
  eyebrow: {
    ...AppTypography.textStyles.eyebrow,
    color: AppColors.text.brand,
  },
  title: {
    ...AppTypography.textStyles.sectionTitle,
    color: AppColors.text.primary,
  },
  subtitle: {
    ...AppTypography.textStyles.body,
    color: AppColors.text.body,
  },
  iconButton: {
    width: AppSizes.controlMd,
    height: AppSizes.controlMd,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.surface.control,
  },
});
