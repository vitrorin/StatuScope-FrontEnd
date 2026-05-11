import { translateDiseaseName } from './diseaseLocalization';

type Translate = (key: string, params?: Record<string, string | number>) => string;

function translateKnownValue(t: Translate, value: string): string {
  const normalized = value.trim().toLowerCase();
  const keyByValue: Record<string, string> = {
    high: 'common.risk.high',
    moderate: 'common.risk.moderate',
    low: 'common.risk.low',
    clear: 'common.risk.clear',
    monitored: 'common.risk.monitored',
    immediate: 'common.priority.immediate',
    review: 'common.priority.review',
    routine: 'common.priority.routine',
    'operational review': 'common.priority.operationalReview',
  };
  return keyByValue[normalized] ? t(keyByValue[normalized]) : value;
}

export function translateDashboardValue(t: Translate, value: string): string {
  const activeOutbreaks = value.match(/^([\d,]+) active outbreaks?$/i);
  if (activeOutbreaks) {
    const count = activeOutbreaks[1];
    return t(count === '1' ? 'common.units.activeOutbreak' : 'common.units.activeOutbreaks', { count });
  }

  const beds = value.match(/^([\d,]+) beds?$/i);
  if (beds) {
    const count = beds[1];
    return t(count === '1' ? 'common.units.bed' : 'common.units.beds', { count });
  }

  const withinKm = value.match(/^Within ([\d,]+) km$/i);
  if (withinKm) {
    return t('common.units.withinKilometers', { count: withinKm[1] });
  }

  const activeCases = value.match(/^([\d,]+) active cases?$/i);
  if (activeCases) {
    return t('common.units.activeCases', { count: activeCases[1] });
  }

  const cases = value.match(/^([\d,]+) cases?$/i);
  if (cases) {
    const count = cases[1];
    return t(count === '1' ? 'common.units.case' : 'common.units.cases', { count });
  }

  return translateKnownValue(t, translateDiseaseName(t, value));
}

export function translateDashboardBadge(t: Translate, badge: string | undefined): string | undefined {
  if (!badge) return undefined;

  const km = badge.match(/^([\d,]+) km$/i);
  if (km) {
    return t('common.units.kilometers', { count: km[1] });
  }

  const staffing = badge.match(/^([\d,]+) MD \/ ([\d,]+) RN$/i);
  if (staffing) {
    return t('common.units.staffing', {
      doctors: staffing[1],
      nurses: staffing[2],
    });
  }

  const cases = badge.match(/^([\d,]+) cases?$/i);
  if (cases) {
    const count = cases[1];
    return t(count === '1' ? 'common.units.case' : 'common.units.cases', { count });
  }

  return translateKnownValue(t, badge);
}
