import { Platform, type TextStyle, type ViewStyle } from 'react-native';

const brand = {
  primary: '#0003B8',
  action: '#1718C7',
  link: '#1D4ED8',
  teal: '#007C89',
  purple: '#5B21B6',
} as const;

const neutral = {
  white: '#FFFFFF',
  black: '#000000',
  ink: '#0F172A',
  charcoal: '#111827',
  slate: '#334155',
  body: '#475569',
  muted: '#64748B',
  soft: '#70839B',
  placeholder: '#94A3B8',
  disabled: '#9CA3AF',
} as const;

const surface = {
  page: '#F5F5F8',
  canvas: '#F5F7FB',
  card: '#FFFFFF',
  cardSoft: '#FCFDFE',
  cardTint: '#FAFCFF',
  subtle: '#F8FAFC',
  subtleTranslucent: 'rgba(248, 250, 252, 0.72)',
  raised: '#F8FAFF',
  muted: '#F1F5F9',
  control: '#F3F4F6',
  disabled: '#F9FAFB',
  brandSoft: '#EEF2FF',
  brandWash: '#F6F7FF',
  brandPanel: '#F4F7FF',
  frost: '#FEFFFF',
  neutralWash: '#E8EEF7',
} as const;

const border = {
  default: '#E2E8F0',
  soft: '#EEF2F7',
  muted: '#E5E7EB',
  strong: '#CBD5E1',
  focus: brand.primary,
  brandSoft: '#DADCFB',
  brandMuted: '#C9D1FF',
  brandSubtle: '#C7D2FE',
  panel: '#DCE6F5',
  panelSoft: '#DCE7F3',
  panelStrong: '#DDE5F2',
  divider: '#E5EAF3',
} as const;

const status = {
  success: '#16A34A',
  successBright: '#22C55E',
  successAccent: '#10B981',
  successStrong: '#15803D',
  successText: '#166534',
  successDeep: '#14532D',
  successSoft: '#DCFCE7',
  successWash: '#F0FDF4',
  successBorder: '#BBF7D0',
  warning: '#F59E0B',
  warningBright: '#F97316',
  warningDark: '#B54708',
  warningStrong: '#B45309',
  warningLabel: '#92400E',
  warningValue: '#78350F',
  warningSoft: '#FEF3C7',
  warningPanel: '#FFF7ED',
  warningWash: '#FFFBEB',
  warningBorder: '#FDE68A',
  warningText: '#D97706',
  danger: '#DC2626',
  dangerBright: '#EF4444',
  dangerAccent: '#F04B4B',
  dangerDark: '#B91C1C',
  dangerDeep: '#991B1B',
  dangerOutbreak: '#B42318',
  dangerSoft: '#FEF2F2',
  dangerWash: '#FEF3F2',
  dangerPanel: '#FFF1F2',
  dangerBorder: '#FECACA',
  info: '#2563EB',
  infoBright: '#0EA5E9',
  infoDark: '#1E40AF',
  infoText: '#0369A1',
  infoDeep: '#1E3A8A',
  cyan: '#0891B2',
  cyanDark: '#0E7490',
  infoSoft: '#DBEAFE',
} as const;

const chart = {
  admin: brand.action,
  doctor: brand.teal,
  map: brand.primary,
  grid: '#E8EEF6',
  skeleton: '#E1E8F3',
  skeletonLine: '#E8EEF6',
} as const;

export const AppColors = {
  brand,
  neutral,
  text: {
    primary: neutral.ink,
    strong: neutral.charcoal,
    secondary: neutral.muted,
    body: neutral.body,
    muted: neutral.placeholder,
    soft: neutral.soft,
    inverse: neutral.white,
    disabled: neutral.disabled,
    link: brand.link,
    brand: brand.primary,
    action: brand.action,
  },
  surface,
  border,
  status,
  chart,
  decorative: {
    alertBarDanger: '#F05252',
    alertBarInfo: '#3D7FFF',
    linkAccent: '#0a7ea4',
    hospitalIconWash: '#F0F1FF',
    dashboardRoleWash: '#EEF0FF',
  },
  clinicalSeverity: {
    critical: {
      accent: '#E11D48',
      card: '#FFF7F7',
      border: '#FECACA',
      badge: '#FFE4E6',
      text: '#9F1239',
    },
    high: {
      accent: '#EA580C',
      card: '#FFFBF0',
      border: '#FED7AA',
      badge: '#FFEDD5',
      text: '#9A3412',
    },
    moderate: {
      accent: '#0284C7',
      card: '#F0F9FF',
      border: '#BAE6FD',
      badge: '#E0F2FE',
      text: '#075985',
    },
    low: {
      accent: neutral.muted,
      card: surface.subtle,
      border: border.strong,
      badge: surface.muted,
      text: neutral.body,
    },
  },
  resourceStatus: {
    stable: {
      accent: brand.action,
      background: surface.brandSoft,
      track: '#E8EDF5',
    },
    low: {
      accent: status.warning,
      background: status.warningWash,
      track: status.warningBorder,
    },
    critical: {
      accent: status.dangerBright,
      background: status.dangerSoft,
      track: status.dangerBorder,
      trackSoft: '#F9D8D8',
    },
    info: {
      accent: status.cyan,
      background: '#ECFEFF',
    },
  },
  recommendationCategory: {
    medical: {
      accent: status.cyan,
      soft: '#ECFEFF',
      border: 'rgba(8, 145, 178, 0.24)',
    },
    logistics: {
      accent: '#7C3AED',
      soft: '#F5F3FF',
      border: 'rgba(124, 58, 237, 0.24)',
    },
    staffing: {
      accent: '#9333EA',
      soft: '#FAF5FF',
      border: 'rgba(147, 51, 234, 0.24)',
    },
    critical: {
      accent: '#9F1239',
      soft: status.dangerPanel,
      border: 'rgba(159, 18, 57, 0.24)',
    },
  },
  metricTone: {
    warning: {
      accent: status.warning,
      label: status.warningLabel,
      value: status.warningValue,
    },
    success: {
      accent: status.success,
      label: status.successText,
      value: status.successDeep,
    },
    info: {
      accent: status.infoBright,
      label: status.infoText,
      value: status.infoDark,
    },
  },
  severityTone: {
    high: '#C2410C',
    mediumBorder: '#F2E5C1',
    neutralBorder: '#E3E8F0',
    active: '#059669',
  },
  roleTone: {
    doctor: {
      accent: '#3B82F6',
      background: '#EAF1FF',
    },
    nurse: {
      accent: '#35C86B',
      background: '#E8FBEE',
    },
    admin: {
      accent: brand.action,
      background: surface.brandSoft,
    },
    neutral: {
      accent: neutral.placeholder,
      background: surface.control,
    },
  },
  table: {
    header: surface.disabled,
    row: surface.card,
    rowAlt: '#FAFAFA',
    border: border.muted,
    borderSoft: surface.control,
    text: neutral.charcoal,
    muted: '#6B7280',
  },
  auth: {
    panel: surface.card,
    page: surface.page,
    fieldBorder: border.default,
    placeholder: '#6B7280',
    radarGreen: '#34D399',
    radarBlue: '#93C5FD',
    halo: 'rgba(255,255,255,0.03)',
    radarRing: 'rgba(255,255,255,0.10)',
    statCardBorder: 'rgba(255,255,255,0.20)',
    statCardBackground: 'rgba(255,255,255,0.10)',
    radarCoreBorder: 'rgba(255,255,255,0.30)',
  },
  modal: {
    backdrop: 'rgba(255,255,255,0.74)',
    backdropStrong: 'rgba(255,255,255,0.76)',
    darkBackdrop: 'rgba(15, 23, 42, 0.42)',
    surface: surface.card,
    border: '#DCE6F3',
    headerBorder: '#EDF2F7',
    glassSubtle: 'rgba(255, 255, 255, 0.42)',
    glassBorder: 'rgba(255, 255, 255, 0.24)',
    glassSoft: 'rgba(255,255,255,0.60)',
  },
  overlay: {
    scrim: 'rgba(15, 23, 42, 0.36)',
    glass: 'rgba(255,255,255,0.74)',
    glassStrong: 'rgba(255,255,255,0.92)',
    modal: neutral.white,
    sidebarMutedText: 'rgba(71, 85, 105, 0.72)',
    mapSkeletonPanel: 'rgba(255, 255, 255, 0.86)',
    mapSkeletonPin: 'rgba(226, 232, 240, 0.85)',
    analyticsBlueArea: 'rgba(80, 195, 244, 0.10)',
    analyticsPurpleArea: 'rgba(139, 92, 246, 0.06)',
  },
  selection: {
    activeWash: '#F7F8FF',
    hoverWash: '#F1F5FF',
  },
  panel: {
    diagnosisBorder: '#E6EDF8',
    selectorBorder: '#D6E0EF',
  },
  shadow: {
    default: neutral.ink,
    black: neutral.black,
    blue: '#000F6B',
  },
} as const;

export type AppColors = typeof AppColors;
export type AppColorToken = string;
export type StatusTone = {
  accent: string;
  background?: string;
  border?: string;
  text?: string;
  soft?: string;
  iconBackground?: string;
};

export function withAlpha(hexColor: string, alpha: number) {
  const normalized = hexColor.replace('#', '');
  const full = normalized.length === 3
    ? normalized.split('').map((char) => `${char}${char}`).join('')
    : normalized;
  const red = Number.parseInt(full.slice(0, 2), 16);
  const green = Number.parseInt(full.slice(2, 4), 16);
  const blue = Number.parseInt(full.slice(4, 6), 16);

  if (![red, green, blue].every(Number.isFinite)) {
    return hexColor;
  }
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export const Colors = {
  light: {
    text: AppColors.text.primary,
    background: AppColors.surface.page,
    tint: AppColors.brand.primary,
    icon: AppColors.text.secondary,
    tabIconDefault: AppColors.text.secondary,
    tabIconSelected: AppColors.brand.primary,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: AppColors.surface.card,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: AppColors.surface.card,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const AppSpacing = {
  0: 0,
  1: 2,
  2: 4,
  3: 6,
  4: 8,
  5: 10,
  6: 12,
  7: 14,
  8: 16,
  9: 18,
  10: 20,
  11: 22,
  12: 24,
  13: 26,
  14: 28,
  16: 32,
  20: 40,
  24: 48,
  27: 54,
  28: 56,
  32: 64,
  fieldGap: 8,
  card: 16,
  screen: 24,
  section: 32,
} as const;

export const AppRadii = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  '2xl': 14,
  '3xl': 16,
  '4xl': 20,
  '5xl': 24,
  pill: 999,
} as const;

export const AppSizes = {
  iconXs: 12,
  iconSm: 16,
  iconMd: 18,
  iconLg: 20,
  iconXl: 24,
  controlSm: 36,
  controlMd: 40,
  controlLg: 44,
  inputHeight: 48,
  textareaMinHeight: 120,
  sidebarWidth: 272,
} as const;

export const AppTypography = {
  fontFamilies: Fonts,
  fontWeights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  fontSizes: {
    micro: 10,
    eyebrow: 11,
    caption: 12,
    small: 13,
    body: 14,
    bodyMedium: 15,
    bodyLarge: 16,
    cardTitle: 16,
    sectionTitle: 22,
    value: 24,
    screenTitle: 28,
    display: 32,
  },
  lineHeights: {
    micro: 14,
    tight: 16,
    captionRelaxed: 17,
    caption: 18,
    body: 20,
    bodyRelaxed: 22,
    bodyLarge: 24,
    sectionTitle: 28,
    screenTitle: 34,
    metricLarge: 38,
    display: 40,
  },
  letterSpacing: {
    none: 0,
    tight: 0.3,
    eyebrow: 0.5,
    wide: 0.8,
  },
  textStyles: {
    display: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '700',
      letterSpacing: 0,
    },
    screenTitle: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '700',
      letterSpacing: 0,
    },
    sectionTitle: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '800',
      letterSpacing: 0,
    },
    cardTitle: {
      fontSize: 16,
      lineHeight: 23,
      fontWeight: '600',
      letterSpacing: 0,
    },
    body: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400',
      letterSpacing: 0,
    },
    bodyStrong: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600',
      letterSpacing: 0,
    },
    bodySmall: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '400',
      letterSpacing: 0,
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400',
      letterSpacing: 0,
    },
    captionStrong: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '700',
      letterSpacing: 0,
    },
    eyebrow: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '800',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    buttonLabel: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600',
      letterSpacing: 0,
    },
    inputText: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400',
      letterSpacing: 0,
    },
    inputLabel: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500',
      letterSpacing: 0,
    },
    metricValue: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '800',
      letterSpacing: 0,
    },
  } satisfies Record<string, TextStyle>,
} as const;

export const AppShadows = {
  none: {
    shadowOpacity: 0,
    elevation: 0,
  },
  subtle: {
    shadowColor: AppColors.shadow.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  card: {
    shadowColor: AppColors.text.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  floating: {
    shadowColor: AppColors.shadow.black,
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 12,
  },
  action: {
    shadowColor: AppColors.brand.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 6,
  },
} as const satisfies Record<string, ViewStyle>;

export type AppSpacing = typeof AppSpacing;
export type AppRadii = typeof AppRadii;
export type AppSizes = typeof AppSizes;
export type AppTypography = typeof AppTypography;
export type AppShadows = typeof AppShadows;
