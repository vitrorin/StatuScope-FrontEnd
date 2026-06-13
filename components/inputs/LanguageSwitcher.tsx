import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from '@/i18n';
import { AppColors, AppRadii, AppSpacing, AppTypography } from '@/constants/theme';

export function LanguageSwitcher() {
  const { language, toggleLanguage, t } = useTranslation();

  return (
    <TouchableOpacity
      accessibilityLabel={t('common.language.label')}
      activeOpacity={0.78}
      onPress={toggleLanguage}
      style={styles.button}
    >
      <Text style={styles.label}>{language === 'es' ? 'ES' : 'EN'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 42,
    height: 30,
    paddingHorizontal: AppSpacing[5],
    borderRadius: AppRadii.md,
    borderWidth: 1,
    borderColor: AppColors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.surface.card,
  },
  label: {
    ...AppTypography.textStyles.captionStrong,
    fontWeight: AppTypography.fontWeights.extrabold,
    color: AppColors.brand.primary,
  },
});
