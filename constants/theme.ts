import { Platform } from 'react-native';

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
