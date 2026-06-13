import { describe, expect, it } from '@/__tests__/helpers/jestCompat';
import { AppColors, Fonts, withAlpha } from '@/constants/theme';

describe('theme tokens', () => {
  it('converts long and short hex colors to rgba values', () => {
    expect(withAlpha('#0003B8', 0.25)).toBe('rgba(0, 3, 184, 0.25)');
    expect(withAlpha('#abc', 0.5)).toBe('rgba(170, 187, 204, 0.5)');
  });

  it('returns the original color when the value is not a valid hex color', () => {
    expect(withAlpha('not-a-color', 0.5)).toBe('not-a-color');
  });

  it('exposes semantic token groups and platform fonts', () => {
    expect(AppColors.brand.primary).toBeTruthy();
    expect(AppColors.status.danger).toBeTruthy();
    expect(Fonts.sans).toBeTruthy();
  });
});
