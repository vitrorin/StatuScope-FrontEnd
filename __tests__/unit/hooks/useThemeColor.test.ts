import { describe, expect, it } from '@/__tests__/helpers/jestCompat';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(),
}));

const mockUseColorScheme = useColorScheme as unknown as jest.Mock;

describe('useThemeColor', () => {
  it('uses explicit light and dark values when provided', () => {
    mockUseColorScheme.mockReturnValueOnce('light');
    expect(useThemeColor({ light: '#111111', dark: '#222222' }, 'text')).toBe('#111111');

    mockUseColorScheme.mockReturnValueOnce('dark');
    expect(useThemeColor({ light: '#111111', dark: '#222222' }, 'text')).toBe('#222222');
  });

  it('falls back to the semantic theme color when no prop is provided', () => {
    mockUseColorScheme.mockReturnValueOnce(null);
    expect(useThemeColor({}, 'text')).toBe(Colors.light.text);
  });
});
