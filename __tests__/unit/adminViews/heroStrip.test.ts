/**
 * Unit tests: hero strip styling consistency across admin views
 *
 * Strategy: read each admin view's source file as plain text and assert
 * that the exact heroStrip design-token values appear in the StyleSheet.
 * This avoids pulling in React Native (Flow syntax) or any other native
 * module that cannot be parsed by Vite in a Node environment.
 */
import { describe, it, expect } from '@/__tests__/helpers/jestCompat';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// ── Design-token constants (the doctor AI assistant reference) ────────────────

const HERO_STRIP_BACKGROUND     = 'AppColors.surface.raised';
const HERO_STRIP_BORDER_COLOR   = 'withAlpha(AppColors.brand.primary, 0.08)';
const HERO_STRIP_BORDER_RADIUS  = 24;
const HERO_STRIP_SHADOW_COLOR   = 'AppColors.shadow.blue';
const HERO_EYEBROW_COLOR        = 'AppColors.brand.primary';
const HERO_TITLE_COLOR          = 'AppColors.text.primary';
const HERO_DESCRIPTION_COLOR    = 'AppColors.text.body';
const HERO_TITLE_FONT_SIZE      = 26;
const HERO_EYEBROW_FONT_SIZE    = 12;
const HERO_EYEBROW_TEXT_TRANSFORM = 'uppercase';

// ── Helper ────────────────────────────────────────────────────────────────────

const ROOT = resolve(__dirname, '..', '..', '..');

function readView(relativePath: string): string {
  return readFileSync(resolve(ROOT, relativePath), 'utf-8');
}

/**
 * Verifies that each required heroStrip style token appears verbatim in the
 * source text of the given component file.
 */
function expectHeroStripTokensInSource(src: string, label: string) {
  expect(src, `${label}: missing heroStrip backgroundColor`)
    .toContain(`backgroundColor: ${HERO_STRIP_BACKGROUND}`);
  expect(src, `${label}: missing heroStrip borderColor`)
    .toContain(`borderColor: ${HERO_STRIP_BORDER_COLOR}`);
  expect(src, `${label}: missing heroStrip borderRadius`)
    .toContain(`borderRadius: ${HERO_STRIP_BORDER_RADIUS}`);
  expect(src, `${label}: missing heroStrip shadowColor`)
    .toContain(`shadowColor: ${HERO_STRIP_SHADOW_COLOR}`);
  expect(src, `${label}: missing heroEyebrow color`)
    .toContain(`color: ${HERO_EYEBROW_COLOR}`);
  expect(src, `${label}: missing heroEyebrow fontSize`)
    .toContain(`fontSize: ${HERO_EYEBROW_FONT_SIZE}`);
  expect(src, `${label}: missing heroEyebrow textTransform`)
    .toContain(`textTransform: '${HERO_EYEBROW_TEXT_TRANSFORM}'`);
  expect(src, `${label}: missing heroTitle color`)
    .toContain(`color: ${HERO_TITLE_COLOR}`);
  expect(src, `${label}: missing heroTitle fontSize`)
    .toContain(`fontSize: ${HERO_TITLE_FONT_SIZE}`);
  expect(src, `${label}: missing heroDescription color`)
    .toContain(`color: ${HERO_DESCRIPTION_COLOR}`);
}

// ── Per-view source-text tests ────────────────────────────────────────────────

describe('Admin Dashboard heroStrip styles', () => {
  it('has correct heroStrip design tokens', () => {
    const src = readView('components/views/admin/dashboard/index.tsx');
    expectHeroStripTokensInSource(src, 'Admin Dashboard');
  });
});

describe('Admin Users heroStrip styles', () => {
  it('has correct heroStrip design tokens', () => {
    const src = readView('components/views/admin/users/index.tsx');
    expectHeroStripTokensInSource(src, 'Admin Users');
  });
});

describe('Admin Recommendations heroStrip styles', () => {
  it('has correct heroStrip design tokens', () => {
    const src = readView('components/views/admin/recommendations/index.tsx');
    expectHeroStripTokensInSource(src, 'Admin Recommendations');
  });
});

describe('Admin Resources heroStrip styles', () => {
  it('has correct heroStrip design tokens', () => {
    const src = readView('components/views/admin/resources/index.tsx');
    expectHeroStripTokensInSource(src, 'Admin Resources');
  });
});

// ── Direct token constant tests ───────────────────────────────────────────────
// These verify the expected design system values are correct and consistent.

describe('Design token constants', () => {
  it('hero strip background uses the shared raised surface token', () => {
    expect(HERO_STRIP_BACKGROUND).toBe('AppColors.surface.raised');
  });

  it('hero eyebrow uses the shared brand primary token', () => {
    expect(HERO_EYEBROW_COLOR).toBe('AppColors.brand.primary');
  });

  it('hero title uses the shared primary text token', () => {
    expect(HERO_TITLE_COLOR).toBe('AppColors.text.primary');
  });

  it('hero description uses the shared body text token', () => {
    expect(HERO_DESCRIPTION_COLOR).toBe('AppColors.text.body');
  });

  it('hero strip shadow uses the shared blue shadow token', () => {
    expect(HERO_STRIP_SHADOW_COLOR).toBe('AppColors.shadow.blue');
  });

  it('hero strip border radius is 24', () => {
    expect(HERO_STRIP_BORDER_RADIUS).toBe(24);
  });

  it('hero title font size is 26', () => {
    expect(HERO_TITLE_FONT_SIZE).toBe(26);
  });

  it('hero eyebrow is uppercase', () => {
    expect(HERO_EYEBROW_TEXT_TRANSFORM).toBe('uppercase');
  });
});

