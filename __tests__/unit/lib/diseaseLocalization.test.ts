import { describe, it, expect } from '@/__tests__/helpers/jestCompat';
import { diseaseNameKey, translateDiseaseName } from '@/lib/diseaseLocalization';

// ── diseaseNameKey ────────────────────────────────────────────────────────────

describe('diseaseNameKey', () => {
  it('lowercases and replaces spaces with underscores', () => {
    expect(diseaseNameKey('Influenza A')).toBe('influenza_a');
  });

  it('strips diacritics', () => {
    expect(diseaseNameKey('Cólera')).toBe('colera');
    expect(diseaseNameKey('Hépatite B')).toBe('hepatite_b');
  });

  it('replaces & with _and_', () => {
    expect(diseaseNameKey('Hepatitis A & B')).toBe('hepatitis_a_and_b');
  });

  it('collapses multiple non-alphanumeric chars to single underscore', () => {
    expect(diseaseNameKey('COVID-19')).toBe('covid_19');
    expect(diseaseNameKey('HIV/AIDS')).toBe('hiv_aids');
  });

  it('strips leading and trailing underscores', () => {
    expect(diseaseNameKey('  Dengue  ')).toBe('dengue');
  });

  it('handles all-lowercase input unchanged', () => {
    expect(diseaseNameKey('dengue')).toBe('dengue');
  });

  it('produces stable key for known diseases', () => {
    expect(diseaseNameKey('Influenza A')).toBe('influenza_a');
    expect(diseaseNameKey('Dengue')).toBe('dengue');
    expect(diseaseNameKey('COVID-19')).toBe('covid_19');
    expect(diseaseNameKey('Tuberculosis')).toBe('tuberculosis');
  });
});

// ── translateDiseaseName ──────────────────────────────────────────────────────

describe('translateDiseaseName', () => {
  it('returns empty string for null', () => {
    const t = (key: string) => key;
    expect(translateDiseaseName(t, null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    const t = (key: string) => key;
    expect(translateDiseaseName(t, undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    const t = (key: string) => key;
    expect(translateDiseaseName(t, '')).toBe('');
  });

  it('returns original name when translation key is missing (t returns key)', () => {
    // When t returns the key itself, it means no translation found → fall back to original name
    const t = (key: string) => key;
    expect(translateDiseaseName(t, 'Influenza A')).toBe('Influenza A');
  });

  it('returns translated value when translation exists', () => {
    const translations: Record<string, string> = {
      'diseases.names.influenza_a': 'Gripa A',
    };
    const t = (key: string) => translations[key] ?? key;
    expect(translateDiseaseName(t, 'Influenza A')).toBe('Gripa A');
  });

  it('normalises diacritics for key lookup', () => {
    const translations: Record<string, string> = {
      'diseases.names.colera': 'Cólera (traducido)',
    };
    const t = (key: string) => translations[key] ?? key;
    expect(translateDiseaseName(t, 'Cólera')).toBe('Cólera (traducido)');
  });

  it('uses disease key derived from translateDiseaseName for COVID-19', () => {
    const translations: Record<string, string> = {
      'diseases.names.covid_19': 'COVID-19 ES',
    };
    const t = (key: string) => translations[key] ?? key;
    expect(translateDiseaseName(t, 'COVID-19')).toBe('COVID-19 ES');
  });
});
