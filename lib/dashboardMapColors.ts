export const HOSPITAL_NODE_COLOR = '#0003B8';
export const HIGH_SEVERITY_COLOR = '#EF4444';
export const MODERATE_SEVERITY_COLOR = '#F97316';
export const LOW_SEVERITY_COLOR = '#22C55E';
export const INACTIVE_COLOR = '#64748B';

interface ZoneSeverityInput {
  id?: string | null;
  risk?: string | null;
  priority?: string | null;
  cases?: string | number | null;
}

interface AggregateSeverityInput {
  caseCount?: number | null;
  outbreakCount?: number | null;
  diseaseName?: string | null;
}

export function zoneSeverityColor(zone: ZoneSeverityInput): string {
  if (zone.id === 'hospital-node') return HOSPITAL_NODE_COLOR;

  const risk = normalizeSeverityText(zone.risk);
  if (risk.includes('HIGH') || risk.includes('CRITICAL') || risk.includes('ALTO') || risk.includes('CRITICO')) {
    return HIGH_SEVERITY_COLOR;
  }
  if (
    risk.includes('MODERATE')
    || risk.includes('MEDIUM')
    || risk.includes('ELEVATED')
    || risk.includes('MODERADO')
    || risk.includes('MEDIO')
    || risk.includes('ELEVADO')
  ) {
    return MODERATE_SEVERITY_COLOR;
  }
  if (risk.includes('LOW') || risk.includes('ROUTINE') || risk.includes('BAJO') || risk.includes('RUTINA')) {
    return LOW_SEVERITY_COLOR;
  }

  const priority = normalizeSeverityText(zone.priority);
  if (priority.includes('IMMEDIATE') || priority.includes('CRITICAL') || priority.includes('INMEDIATA')) {
    return HIGH_SEVERITY_COLOR;
  }
  if (priority.includes('HIGH') || priority.includes('ELEVATED') || priority.includes('ALTA') || priority.includes('ELEVADA')) {
    return MODERATE_SEVERITY_COLOR;
  }
  if (priority.includes('ROUTINE') || priority.includes('LOW') || priority.includes('RUTINA') || priority.includes('BAJA')) {
    return LOW_SEVERITY_COLOR;
  }

  return aggregateOutbreakColor({ caseCount: parseCount(zone.cases), outbreakCount: undefined });
}

export function diseaseSeverityColor(item: AggregateSeverityInput): string {
  const caseCount = item.caseCount ?? 0;
  if (isPriorityDisease(item.diseaseName) && caseCount >= 25) return HIGH_SEVERITY_COLOR;
  return aggregateOutbreakColor(item);
}

export function aggregateOutbreakColor(item: AggregateSeverityInput): string {
  const caseCount = item.caseCount ?? 0;
  const outbreakCount = item.outbreakCount ?? 0;
  if (outbreakCount >= 10 || caseCount >= 500) return HIGH_SEVERITY_COLOR;
  if (outbreakCount >= 4 || caseCount >= 10) return MODERATE_SEVERITY_COLOR;
  if (outbreakCount > 0 || caseCount > 0) return LOW_SEVERITY_COLOR;
  return INACTIVE_COLOR;
}

export function severityFillColor(color: string): string {
  if (color === HIGH_SEVERITY_COLOR) return 'rgba(239, 68, 68, 0.10)';
  if (color === MODERATE_SEVERITY_COLOR) return 'rgba(249, 115, 22, 0.10)';
  if (color === LOW_SEVERITY_COLOR) return 'rgba(34, 197, 94, 0.10)';
  if (color === HOSPITAL_NODE_COLOR) return 'rgba(0, 3, 184, 0.10)';
  return 'rgba(100, 116, 139, 0.04)';
}

function normalizeSeverityText(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

function parseCount(value: string | number | null | undefined): number | undefined {
  if (typeof value === 'number') return value;
  if (!value) return undefined;
  const match = value.replace(/,/g, '').match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : undefined;
}

function isPriorityDisease(value: string | null | undefined): boolean {
  const disease = normalizeSeverityText(value).replace(/[^A-Z0-9]+/g, ' ').trim();
  return disease === 'COVID 19'
    || disease === 'COVID'
    || disease === 'INFLUENZA'
    || disease === 'SARAMPION'
    || disease === 'MEASLES';
}
