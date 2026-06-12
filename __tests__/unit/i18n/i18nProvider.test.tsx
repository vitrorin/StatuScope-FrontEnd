import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import * as Localization from 'expo-localization';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';
import { afterEach, describe, expect, it, vi } from '@/__tests__/helpers/jestCompat';
import { LanguageSwitcher } from '@/components/inputs/LanguageSwitcher';
import { I18nProvider, useTranslation } from '@/i18n';
import {
  detectInitialLanguage,
  getCurrentLanguage,
  getFallbackLanguage,
  normalizeLanguage,
  setCurrentLanguage,
} from '@/i18n/language';

function TranslationProbe() {
  const { language, setLanguage, toggleLanguage, t } = useTranslation();

  return (
    <View>
      <Text>{language}</Text>
      <Text>{t('common.language.label')}</Text>
      <TouchableOpacity onPress={() => setLanguage('es')}>
        <Text>Set ES</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={toggleLanguage}>
        <Text>Toggle</Text>
      </TouchableOpacity>
    </View>
  );
}

describe('i18n provider', () => {
  afterEach(async () => {
    await cleanup();
    vi.restoreAllMocks();
  });

  it('translates labels and updates the active language', async () => {
    const screen = await render(
      <I18nProvider>
        <TranslationProbe />
      </I18nProvider>
    );

    expect(screen.getByText('Language')).toBeTruthy();

    await fireEvent.press(screen.getByText('Set ES'));
    await waitFor(() => expect(screen.getByText('Idioma')).toBeTruthy());

    await fireEvent.press(screen.getByText('Toggle'));
    await waitFor(() => expect(screen.getByText('Language')).toBeTruthy());
  });

  it('normalizes supported, regional and unsupported language values', () => {
    expect(normalizeLanguage('es-MX')).toBe('es');
    expect(normalizeLanguage('EN-us')).toBe('en');
    expect(normalizeLanguage('fr-FR')).toBe('en');
    expect(normalizeLanguage(undefined)).toBe('en');
    expect(getFallbackLanguage()).toBe('en');
  });

  it('detects, stores and exposes the current language', () => {
    expect(detectInitialLanguage()).toBe('en');

    setCurrentLanguage('es');
    expect(getCurrentLanguage()).toBe('es');

    setCurrentLanguage('en');
    expect(getCurrentLanguage()).toBe('en');
  });

  it('falls back to English when locale detection throws', () => {
    vi.spyOn(Localization, 'getLocales').mockImplementationOnce(() => {
      throw new Error('localization unavailable');
    });

    expect(detectInitialLanguage()).toBe('en');
  });

  it('uses languageCode when languageTag is not available', () => {
    vi.spyOn(Localization, 'getLocales').mockReturnValueOnce([
      { languageCode: 'es' } as ReturnType<typeof Localization.getLocales>[number],
    ]);

    expect(detectInitialLanguage()).toBe('es');
  });

  it('renders and toggles the real language switcher label', async () => {
    const screen = await render(
      <I18nProvider>
        <LanguageSwitcher />
      </I18nProvider>
    );

    expect(screen.getByText('EN')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Language'));
    await waitFor(() => expect(screen.getByText('ES')).toBeTruthy());

    await fireEvent.press(screen.getByLabelText('Idioma'));
    await waitFor(() => expect(screen.getByText('EN')).toBeTruthy());
  });
});
