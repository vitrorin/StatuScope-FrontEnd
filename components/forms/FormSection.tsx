import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AppColors, AppRadii, AppSpacing, AppTypography } from '@/constants/theme';

export interface FormSectionProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function FormSection({ title, description, children, style, testID }: FormSectionProps) {
  return (
    <View style={[styles.section, style]} testID={testID}>
      {title || description ? (
        <View style={styles.header}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {description ? <Text style={styles.description}>{description}</Text> : null}
        </View>
      ) : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderWidth: 1,
    borderColor: AppColors.border.soft,
    borderRadius: AppRadii['3xl'],
    backgroundColor: AppColors.surface.cardTint,
    padding: AppSpacing.card,
    gap: AppSpacing[7],
  },
  header: {
    gap: AppSpacing[2],
  },
  title: {
    ...AppTypography.textStyles.cardTitle,
    color: AppColors.text.primary,
  },
  description: {
    ...AppTypography.textStyles.caption,
    color: AppColors.text.body,
  },
  content: {
    gap: AppSpacing[6],
  },
});
