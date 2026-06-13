import { AppLanguage } from '@/i18n/language';

export function isSpanish(language: AppLanguage) {
  return language === 'es';
}

export function getHospitalAdminLabel(language: AppLanguage) {
  return isSpanish(language) ? 'Administrador hospitalario' : 'Hospital Admin';
}

export function getAdminUserRoleLabel(role: 'All' | 'Hospital Administrator' | 'Doctor', language: AppLanguage) {
  if (role === 'All') return isSpanish(language) ? 'Todos' : 'All';
  if (role === 'Hospital Administrator') {
    return isSpanish(language) ? 'Administrador hospitalario' : 'Hospital Administrator';
  }
  return 'Doctor';
}

export function getAdminUserStatusLabel(status: 'All' | 'Active' | 'Inactive' | 'Suspended', language: AppLanguage) {
  if (status === 'All') return isSpanish(language) ? 'Todos' : 'All';
  if (status === 'Active') return isSpanish(language) ? 'Activo' : 'Active';
  if (status === 'Inactive') return isSpanish(language) ? 'Inactivo' : 'Inactive';
  return isSpanish(language) ? 'Suspendido' : 'Suspended';
}

export function getRecommendationStatusLabel(
  status: 'new' | 'accepted' | 'assigned' | 'completed' | 'rejected',
  language: AppLanguage,
) {
  const es = {
    new: 'Sin asignar',
    accepted: 'Aceptado',
    assigned: 'Asignado',
    completed: 'Completado',
    rejected: 'Descartado',
  } as const;
  const en = {
    new: 'Unassigned',
    accepted: 'Accepted',
    assigned: 'Assigned',
    completed: 'Completed',
    rejected: 'Rejected',
  } as const;
  return (isSpanish(language) ? es : en)[status];
}

export function formatRelativeDate(value: string, language: AppLanguage) {
  const timestamp = new Date(value).getTime();
  const diffMinutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));

  if (diffMinutes < 1) return isSpanish(language) ? 'Justo ahora' : 'Just now';
  if (diffMinutes < 60) return isSpanish(language) ? `Hace ${diffMinutes} min` : `${diffMinutes} min ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return isSpanish(language) ? `Hace ${diffHours} h` : `${diffHours} hr ago`;

  const diffDays = Math.round(diffHours / 24);
  if (isSpanish(language)) {
    return `Hace ${diffDays} dia${diffDays === 1 ? '' : 's'}`;
  }
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

export function getRecommendationSourceLabel(createdByMode: string | undefined, language: AppLanguage) {
  if (createdByMode === 'LLM_ASSISTED') {
    return isSpanish(language)
      ? 'Basada en brotes en vivo y senales de recursos hospitalarios.'
      : 'Grounded in live outbreaks and hospital resource signals.';
  }
  if (createdByMode === 'RULE_ENGINE') {
    return isSpanish(language)
      ? 'Generada a partir de reglas hospitalarias y de brotes en vivo.'
      : 'Generated from live hospital and outbreak rules.';
  }
  return isSpanish(language)
    ? 'Generada a partir del contexto operativo actual.'
    : 'Generated from current operational context.';
}
