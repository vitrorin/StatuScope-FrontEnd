import { describe, it, expect } from '@/__tests__/helpers/jestCompat';
import { translateDashboardValue, translateDashboardBadge } from '@/lib/dashboardLocalization';

// Simple identity translator — returns value when key has no translation
const identity = (key: string, params?: Record<string, string | number>) => {
  if (!params) return key;
  // naive interpolation for {{count}} etc.
  return Object.entries(params).reduce(
    (acc, [k, v]) => acc.replace(`{{${k}}}`, String(v)),
    key,
  );
};

// Minimal stub that resolves common translation keys used by the functions
function makeT(overrides: Record<string, string> = {}) {
  const defaults: Record<string, string> = {
    'common.risk.high': 'Alto',
    'common.risk.moderate': 'Moderado',
    'common.risk.low': 'Bajo',
    'common.risk.clear': 'Sin riesgo',
    'common.risk.monitored': 'Monitoreo',
    'common.priority.immediate': 'Inmediato',
    'common.priority.review': 'Revisión',
    'common.priority.routine': 'Rutina',
    'common.priority.operationalReview': 'Revisión operativa',
    'common.statuses.noPriorityOutbreaks': 'Sin brotes prioritarios',
    'common.statuses.noPriorityMunicipality': 'Sin municipio prioritario',
    'common.statuses.priorityMunicipality': 'Municipio prioritario',
    'common.statuses.priorityFocus': 'Foco prioritario',
    'common.units.activeOutbreak': '{{count}} brote activo',
    'common.units.activeOutbreaks': '{{count}} brotes activos',
    'common.units.priorityOutbreak': '{{count}} brote prioritario',
    'common.units.priorityOutbreaks': '{{count}} brotes prioritarios',
    'common.units.bed': '{{count}} cama',
    'common.units.beds': '{{count}} camas',
    'common.units.withinKilometers': 'En {{count}} km',
    'common.units.activeCases': '{{count}} casos activos',
    'common.units.case': '{{count}} caso',
    'common.units.cases': '{{count}} casos',
    'common.units.kilometers': '{{count}} km',
    'common.units.staffing': '{{doctors}} MD / {{nurses}} RN',
    'common.units.priorityShort': '{{count}} prioritario',
    ...overrides,
  };
  return (key: string, params?: Record<string, string | number>) => {
    const template = defaults[key] ?? key;
    if (!params) return template;
    return Object.entries(params).reduce(
      (acc, [k, v]) => acc.replace(`{{${k}}}`, String(v)),
      template,
    );
  };
}

// ── translateDashboardValue ───────────────────────────────────────────────────

describe('translateDashboardValue', () => {
  it('translates "3 active outbreaks"', () => {
    expect(translateDashboardValue(makeT(), '3 active outbreaks')).toBe('3 brotes activos');
  });

  it('translates singular "1 active outbreak"', () => {
    expect(translateDashboardValue(makeT(), '1 active outbreak')).toBe('1 brote activo');
  });

  it('translates "2 priority outbreaks"', () => {
    expect(translateDashboardValue(makeT(), '2 priority outbreaks')).toBe('2 brotes prioritarios');
  });

  it('translates singular "1 priority outbreak"', () => {
    expect(translateDashboardValue(makeT(), '1 priority outbreak')).toBe('1 brote prioritario');
  });

  it('translates "50 beds"', () => {
    expect(translateDashboardValue(makeT(), '50 beds')).toBe('50 camas');
  });

  it('translates singular "1 bed"', () => {
    expect(translateDashboardValue(makeT(), '1 bed')).toBe('1 cama');
  });

  it('translates "Within 75 km"', () => {
    expect(translateDashboardValue(makeT(), 'Within 75 km')).toBe('En 75 km');
  });

  it('translates "18 active cases"', () => {
    expect(translateDashboardValue(makeT(), '18 active cases')).toBe('18 casos activos');
  });

  it('translates "12 cases"', () => {
    expect(translateDashboardValue(makeT(), '12 cases')).toBe('12 casos');
  });

  it('translates singular "1 case"', () => {
    expect(translateDashboardValue(makeT(), '1 case')).toBe('1 caso');
  });

  it('translates known risk value "HIGH"', () => {
    expect(translateDashboardValue(makeT(), 'HIGH')).toBe('Alto');
  });

  it('translates known risk value "moderate" (case-insensitive)', () => {
    expect(translateDashboardValue(makeT(), 'moderate')).toBe('Moderado');
  });

  it('translates known priority value "IMMEDIATE"', () => {
    expect(translateDashboardValue(makeT(), 'IMMEDIATE')).toBe('Inmediato');
  });

  it('returns unknown value as-is when no translation match', () => {
    expect(translateDashboardValue(makeT(), 'SomeUnknownValue')).toBe('SomeUnknownValue');
  });

  it('translates disease names as a fallback', () => {
    const t = makeT({ 'diseases.names.dengue': 'Dengue (ES)' });
    expect(translateDashboardValue(t, 'Dengue')).toBe('Dengue (ES)');
  });
});

// ── translateDashboardBadge ───────────────────────────────────────────────────

describe('translateDashboardBadge', () => {
  it('returns undefined for undefined badge', () => {
    expect(translateDashboardBadge(makeT(), undefined)).toBeUndefined();
  });

  it('returns undefined for empty string badge', () => {
    expect(translateDashboardBadge(makeT(), '')).toBeUndefined();
  });

  it('translates "75 km" badge', () => {
    expect(translateDashboardBadge(makeT(), '75 km')).toBe('75 km');
  });

  it('translates staffing badge "5 MD / 12 RN"', () => {
    expect(translateDashboardBadge(makeT(), '5 MD / 12 RN')).toBe('5 MD / 12 RN');
  });

  it('translates "3 cases" badge', () => {
    expect(translateDashboardBadge(makeT(), '3 cases')).toBe('3 casos');
  });

  it('translates singular "1 case" badge', () => {
    expect(translateDashboardBadge(makeT(), '1 case')).toBe('1 caso');
  });

  it('translates "2 priority" badge', () => {
    expect(translateDashboardBadge(makeT(), '2 priority')).toBe('2 prioritario');
  });

  it('translates known value badge "HIGH"', () => {
    expect(translateDashboardBadge(makeT(), 'HIGH')).toBe('Alto');
  });

  it('returns unknown badge value as-is', () => {
    expect(translateDashboardBadge(makeT(), 'UNKNOWN_BADGE')).toBe('UNKNOWN_BADGE');
  });
});
