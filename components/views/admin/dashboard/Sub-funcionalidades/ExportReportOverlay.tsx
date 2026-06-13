import React, { useCallback, useEffect, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PdfPreviewFrame, ReportOption } from '@/components/overlays';
import { CardBase } from '@/components/patterns/CardBase';
import { AdminDashboardAlert, AdminDashboardMetric, AdminDashboardZone } from '@/components/views/admin/dashboard/Sub-funcionalidades/types';
import { AdminDashboardSummaryResponse } from '@/lib/adminOperational';
import { useTranslation } from '@/i18n';
import { isSpanish } from '@/components/views/admin/localization';
import { AppColors, withAlpha } from '@/constants/theme';

type AdminReportType = 'executive' | 'hospital' | 'epidemiological';

interface ExportReportOverlayProps {
  visible: boolean;
  dashboard: AdminDashboardSummaryResponse | null;
  metrics: AdminDashboardMetric[];
  alerts: AdminDashboardAlert[];
  actions: AdminDashboardSummaryResponse['recommendedActions'];
  zones: AdminDashboardZone[];
  onClose: () => void;
}

interface AdminReportPreview {
  type: AdminReportType;
  title: string;
  subtitle: string;
  generatedAt: string;
  hospitalName: string;
  summaryCards: { label: string; value: string; detail?: string; tone?: 'default' | 'critical' | 'warning' | 'positive' | 'info' }[];
  charts: AdminReportChart[];
  tables: AdminReportTable[];
}

interface AdminReportChart {
  title: string;
  subtitle?: string;
  maxLabel?: string;
  items: { label: string; value: number; displayValue?: string; color?: PdfColor }[];
}

interface AdminReportTable {
  title: string;
  headers: string[];
  widths: number[];
  rows: string[][];
}

export function ExportReportOverlay({
  visible,
  dashboard,
  metrics,
  alerts,
  actions,
  zones,
  onClose,
}: ExportReportOverlayProps) {
  const { language } = useTranslation();
  const [exportingType, setExportingType] = useState<AdminReportType | null>(null);
  const [previewReport, setPreviewReport] = useState<AdminReportPreview | null>(null);
  const [previewPdf, setPreviewPdf] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFilename, setPreviewFilename] = useState<string | null>(null);

  const clearPreview = useCallback(() => {
    revokePdfUrl(previewUrl);
    setPreviewReport(null);
    setPreviewPdf(null);
    setPreviewUrl(null);
    setPreviewFilename(null);
  }, [previewUrl]);

  useEffect(() => {
    if (!visible) {
      clearPreview();
      setExportingType(null);
    }
  }, [clearPreview, visible]);

  useEffect(() => () => {
    revokePdfUrl(previewUrl);
  }, [previewUrl]);

  const handlePreview = (type: AdminReportType) => {
    setExportingType(type);
    try {
      const report = buildAdminReport({ type, dashboard, metrics, alerts, actions, zones, language });
      const { pdf, filename } = buildReportPdf(report, language);
      revokePdfUrl(previewUrl);
      setPreviewReport(report);
      setPreviewPdf(pdf);
      setPreviewFilename(filename);
      setPreviewUrl(createPdfUrl(pdf));
    } finally {
      setExportingType(null);
    }
  };

  const handleDownload = () => {
    if (!previewPdf || !previewFilename) return;
    savePdfDocument(previewPdf, previewFilename);
    onClose();
  };

  const handleBack = () => {
    clearPreview();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={[styles.backdrop, previewReport ? styles.previewBackdrop : styles.selectionBackdrop]} onPress={onClose} />
        <CardBase style={[styles.dialog, previewReport ? styles.previewDialog : styles.selectionDialog]}>
          <View style={styles.header}>
            {previewReport ? (
              <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.75}>
                <Feather name="arrow-left" size={18} color={AppColors.brand.primary} />
                <Text style={styles.backText}>{isSpanish(language) ? 'Regresar' : 'Back'}</Text>
              </TouchableOpacity>
            ) : null}
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>{isSpanish(language) ? 'Vista previa del reporte' : 'Report Preview'}</Text>
              <Text style={styles.title}>
                {previewReport ? previewReport.title : isSpanish(language) ? 'Exportacion del panel hospitalario' : 'Hospital Dashboard Export'}
              </Text>
              <Text style={styles.subtitle}>
                {previewReport
                  ? previewReport.subtitle
                  : isSpanish(language)
                    ? 'Elige el tipo de reporte para generar una vista previa antes de descargar.'
                    : 'Choose a report type to generate a preview before downloading.'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>

          {previewReport ? (
            <View style={styles.previewBody}>
              {previewUrl ? (
                <PdfPreviewFrame url={previewUrl} title={previewReport.title} />
              ) : (
                <View style={styles.previewFallback}>
                  <Feather name="file-text" size={24} color={AppColors.brand.primary} />
                  <Text style={styles.previewFallbackText}>
                    {isSpanish(language) ? 'La vista previa del documento no esta disponible en este entorno.' : 'Document preview is not available in this environment.'}
                  </Text>
                </View>
              )}

              <TouchableOpacity style={styles.downloadButton} activeOpacity={0.82} onPress={handleDownload}>
                <Feather name="download" size={18} color={AppColors.surface.card} />
                <Text style={styles.downloadButtonText}>{isSpanish(language) ? 'Descargar reporte' : 'Download report'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.options}>
              <ReportOption
                icon="clipboard"
                title={isSpanish(language) ? 'Resumen ejecutivo' : 'Executive Summary'}
                description={isSpanish(language) ? 'KPIs principales y alertas hospitalarias prioritarias.' : 'Primary KPIs and priority hospital alerts.'}
                disabled={exportingType !== null || !dashboard}
                loading={exportingType === 'executive'}
                onPress={() => handlePreview('executive')}
              />
              <ReportOption
                icon="home"
                title={isSpanish(language) ? 'Resumen hospitalario' : 'Hospital Overview'}
                description={isSpanish(language) ? 'Capacidad, personal, UCI y acciones operativas relacionadas.' : 'Capacity, staffing, ICU, and related operational actions.'}
                disabled={exportingType !== null || !dashboard}
                loading={exportingType === 'hospital'}
                onPress={() => handlePreview('hospital')}
              />
              <ReportOption
                icon="map"
                title={isSpanish(language) ? 'Panorama epidemiologico' : 'Epidemiological Snapshot'}
                description={isSpanish(language) ? 'Brotes activos, zonas del mapa y carga regional.' : 'Active outbreaks, map zones, and regional burden.'}
                disabled={exportingType !== null || !dashboard}
                loading={exportingType === 'epidemiological'}
                onPress={() => handlePreview('epidemiological')}
              />
            </View>
          )}
        </CardBase>
      </View>
    </Modal>
  );
}

function buildAdminReport({
  type,
  dashboard,
  metrics,
  alerts,
  actions,
  zones,
  language,
}: {
  type: AdminReportType;
  dashboard: AdminDashboardSummaryResponse | null;
  metrics: AdminDashboardMetric[];
  alerts: AdminDashboardAlert[];
  actions: AdminDashboardSummaryResponse['recommendedActions'];
  zones: AdminDashboardZone[];
  language: 'en' | 'es';
}): AdminReportPreview {
  const hospitalName = dashboard?.hospitalName ?? (language === 'es' ? 'Hospital' : 'Hospital');
  const generatedAt = dashboard?.generatedAt ?? new Date().toISOString();
  const title = reportTitle(type, language);
  const generatedLabel = new Date(generatedAt).toLocaleString(language === 'es' ? 'es-MX' : 'en-US');
  const subtitle = language === 'es'
    ? `${hospitalName} | Generado ${generatedLabel}`
    : `${hospitalName} | Generated ${generatedLabel}`;
  const location = [dashboard?.municipalityName, dashboard?.stateName].filter(Boolean).join(', ');
  const totalAlertCases = alerts.reduce((sum, alert) => sum + (alert.caseCount ?? parseNumericValue(alert.caseLabel ?? '0')), 0);
  const criticalAlerts = alerts.filter((alert) => alert.variant === 'critical' || normalizedSeverity(alert.priority) === 'critical').length;
  const highActions = actions.filter((action) => ['CRITICAL', 'HIGH'].includes(normalizedSeverity(action.severity))).length;
  const activeZones = zones.filter((zone) => zone.id !== 'hospital-node');
  const metricCards = metrics.slice(0, 4).map((metric) => ({
    label: metric.title,
    value: metric.value,
    detail: [metric.signalLabel, metric.subtitle].filter(Boolean).join(' | '),
    tone: metric.tone,
  }));

  if (type === 'hospital') {
    return {
      type,
      title,
      subtitle,
      generatedAt,
      hospitalName,
      summaryCards: metricCards,
      charts: [
        {
          title: language === 'es' ? 'Lectura operativa de KPIs' : 'Operational KPI Reading',
          subtitle: language === 'es' ? 'Porcentaje disponible o nivel operativo reportado por cada KPI.' : 'Available percentage or reported operational level by KPI.',
          maxLabel: '100%',
          items: metrics
            .filter((metric) => typeof metric.progressValue === 'number')
            .slice(0, 6)
            .map((metric) => ({
              label: metric.title,
              value: Math.max(0, Math.min(100, metric.progressValue ?? 0)),
              displayValue: `${Math.round(metric.progressValue ?? 0)}%`,
              color: metric.tone === 'critical' ? [239, 68, 68] : metric.tone === 'warning' ? [245, 158, 11] : [23, 24, 199],
            })),
        },
        {
          title: language === 'es' ? 'Acciones por estado' : 'Actions by Status',
          subtitle: language === 'es' ? 'Distribucion del trabajo operativo recomendado.' : 'Distribution of recommended operational work.',
          items: buildCountChart(groupBy(actions, (action) => localizeActionStatus(action.status, language)), [14, 116, 144]),
        },
      ],
      tables: [
        {
          title: language === 'es' ? 'Capacidad, personal y recursos' : 'Capacity, Staffing, and Resources',
          headers: [language === 'es' ? 'Indicador' : 'Metric', language === 'es' ? 'Valor' : 'Value', language === 'es' ? 'Senal' : 'Signal', language === 'es' ? 'Accion recomendada' : 'Recommended Action'],
          widths: [144, 72, 126, 174],
          rows: metrics.map((metric) => [
            metric.title,
            metric.value,
            metric.signalLabel,
            metric.recommendedAction,
          ]),
        },
        {
          title: language === 'es' ? 'Acciones operativas relacionadas' : 'Related Operational Actions',
          headers: [language === 'es' ? 'Accion' : 'Action', language === 'es' ? 'Tipo' : 'Type', language === 'es' ? 'Severidad' : 'Severity', language === 'es' ? 'Estado' : 'Status'],
          widths: [252, 96, 84, 84],
          rows: actions.slice(0, 12).map((action) => [
            localizeRecommendedActionTitle(action, language),
            localizeRecommendedActionType(action.type, language),
            localizePriorityLabel(action.severity, language),
            localizeActionStatus(action.status, language),
          ]),
        },
      ],
    };
  }

  if (type === 'epidemiological') {
    return {
      type,
      title,
      subtitle,
      generatedAt,
      hospitalName,
      summaryCards: [
        { label: language === 'es' ? 'Brotes activos' : 'Active Outbreaks', value: String(alerts.length), detail: language === 'es' ? 'Alertas vinculadas al hospital' : 'Alerts linked to the hospital', tone: criticalAlerts > 0 ? 'critical' : 'info' },
        { label: language === 'es' ? 'Casos reportados' : 'Reported Cases', value: formatNumber(totalAlertCases), detail: language === 'es' ? 'Suma de alertas priorizadas' : 'Sum of prioritized alerts', tone: totalAlertCases > 0 ? 'warning' : 'positive' },
        { label: language === 'es' ? 'Zonas en mapa' : 'Map Zones', value: String(activeZones.length), detail: language === 'es' ? 'Municipios con carga regional' : 'Municipalities with regional burden', tone: 'info' },
        { label: language === 'es' ? 'Criticas' : 'Critical', value: String(criticalAlerts), detail: language === 'es' ? 'Alertas de maxima prioridad' : 'Highest priority alerts', tone: criticalAlerts > 0 ? 'critical' : 'positive' },
      ],
      charts: [
        {
          title: language === 'es' ? 'Top brotes por casos' : 'Top Outbreaks by Cases',
          subtitle: language === 'es' ? 'Alertas con mayor carga clinica reportada.' : 'Alerts with the largest reported clinical burden.',
          items: alerts
            .slice(0, 8)
            .map((alert) => ({
              label: alert.title,
              value: alert.caseCount ?? parseNumericValue(alert.caseLabel ?? '0'),
              displayValue: alert.caseLabel ?? formatNumber(alert.caseCount ?? 0),
              color: alert.variant === 'critical' ? [239, 68, 68] : alert.variant === 'warning' ? [245, 158, 11] : [23, 24, 199],
            })),
        },
        {
          title: language === 'es' ? 'Carga por zona del mapa' : 'Map Zone Burden',
          subtitle: language === 'es' ? 'Municipios cercanos ordenados por casos visibles.' : 'Nearby municipalities ordered by visible cases.',
          items: activeZones.slice(0, 8).map((zone) => ({
            label: zone.name,
            value: parseNumericValue(zone.cases),
            displayValue: zone.cases,
            color: [14, 116, 144],
          })),
        },
      ],
      tables: [
        {
          title: language === 'es' ? 'Brotes activos y alertas' : 'Active Outbreaks and Alerts',
          headers: [language === 'es' ? 'Brote' : 'Outbreak', language === 'es' ? 'Casos' : 'Cases', language === 'es' ? 'Ubicacion' : 'Location', language === 'es' ? 'Estado' : 'Status', language === 'es' ? 'Prioridad' : 'Priority'],
          widths: [176, 58, 118, 82, 82],
          rows: alerts.slice(0, 12).map((alert) => [
            alert.title,
            alert.caseLabel ?? formatNumber(alert.caseCount ?? 0),
            [alert.municipalityName ?? alert.area, alert.stateName].filter(Boolean).join(', ') || alert.department,
            localizeConfirmationStatus(alert.confirmationStatus, language),
            localizePriorityLabel(alert.priority, language),
          ]),
        },
        {
          title: language === 'es' ? 'Zonas epidemiologicas del mapa' : 'Epidemiological Map Zones',
          headers: [language === 'es' ? 'Zona' : 'Zone', language === 'es' ? 'Enfermedad' : 'Disease', language === 'es' ? 'Casos' : 'Cases', language === 'es' ? 'Riesgo' : 'Risk', language === 'es' ? 'Accion' : 'Action'],
          widths: [136, 104, 58, 78, 140],
          rows: activeZones.slice(0, 12).map((zone) => [zone.name, zone.disease, zone.cases, `${zone.risk} | ${zone.radius}`, zone.recommendedAction]),
        },
      ],
    };
  }

  return {
    type,
    title,
    subtitle,
    generatedAt,
    hospitalName,
    summaryCards: [
      { label: language === 'es' ? 'Hospital' : 'Hospital', value: hospitalName, detail: location || '-', tone: 'info' },
      { label: language === 'es' ? 'KPIs monitoreadas' : 'Monitored KPIs', value: String(metrics.length), detail: metrics.slice(0, 3).map((metric) => metric.title).join(', '), tone: 'default' },
      { label: language === 'es' ? 'Brotes relevantes' : 'Relevant Outbreaks', value: String(alerts.length), detail: `${formatNumber(totalAlertCases)} ${language === 'es' ? 'casos reportados' : 'reported cases'}`, tone: alerts.length > 0 ? 'warning' : 'positive' },
      { label: language === 'es' ? 'Acciones prioritarias' : 'Priority Actions', value: String(highActions), detail: language === 'es' ? 'Criticas o altas' : 'Critical or high', tone: highActions > 0 ? 'critical' : 'positive' },
    ],
    charts: [
      {
        title: language === 'es' ? 'KPIs operativos' : 'Operational KPIs',
        subtitle: language === 'es' ? 'Lectura porcentual de los indicadores principales.' : 'Percentage reading of the main indicators.',
        maxLabel: '100%',
        items: metrics
          .filter((metric) => typeof metric.progressValue === 'number')
          .slice(0, 6)
          .map((metric) => ({
            label: metric.title,
            value: Math.max(0, Math.min(100, metric.progressValue ?? 0)),
            displayValue: `${Math.round(metric.progressValue ?? 0)}%`,
            color: metric.tone === 'critical' ? [239, 68, 68] : metric.tone === 'warning' ? [245, 158, 11] : [23, 24, 199],
          })),
      },
      {
        title: language === 'es' ? 'Distribucion de alertas' : 'Alert Distribution',
        subtitle: language === 'es' ? 'Alertas agrupadas por prioridad visual.' : 'Alerts grouped by visual priority.',
        items: buildCountChart(groupBy(alerts, (alert) => alert.variant), [239, 68, 68]),
      },
    ],
    tables: [
      {
        title: language === 'es' ? 'KPIs principales' : 'Primary KPIs',
        headers: [language === 'es' ? 'Indicador' : 'Metric', language === 'es' ? 'Valor' : 'Value', language === 'es' ? 'Interpretacion' : 'Interpretation', language === 'es' ? 'Siguiente accion' : 'Next Action'],
        widths: [132, 70, 142, 172],
        rows: metrics.map((metric) => [metric.title, metric.value, metric.detailSummary, metric.recommendedAction]),
      },
      {
        title: language === 'es' ? 'Alertas prioritarias' : 'Priority Alerts',
        headers: [language === 'es' ? 'Alerta' : 'Alert', language === 'es' ? 'Casos' : 'Cases', language === 'es' ? 'Area' : 'Area', language === 'es' ? 'Accion recomendada' : 'Recommended Action'],
        widths: [174, 62, 118, 162],
        rows: alerts.slice(0, 10).map((alert) => [
          alert.title,
          alert.caseLabel ?? formatNumber(alert.caseCount ?? 0),
          [alert.municipalityName ?? alert.area, alert.department].filter(Boolean).join(' | '),
          alert.recommendedAction,
        ]),
      },
      {
        title: language === 'es' ? 'Acciones recomendadas' : 'Recommended Actions',
        headers: [language === 'es' ? 'Accion' : 'Action', language === 'es' ? 'Severidad' : 'Severity', language === 'es' ? 'Estado' : 'Status'],
        widths: [318, 98, 100],
        rows: actions.slice(0, 10).map((action) => [
          localizeRecommendedActionTitle(action, language),
          localizePriorityLabel(action.severity, language),
          localizeActionStatus(action.status, language),
        ]),
      },
    ],
  };
}

function normalizedSeverity(value?: string | null) {
  return (value ?? '').trim().toUpperCase();
}

function parseNumericValue(value: string) {
  const parsed = Number(value.replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

function groupBy<T>(items: T[], keyGetter: (item: T) => string) {
  return items.reduce<Record<string, number>>((groups, item) => {
    const key = keyGetter(item) || 'N/A';
    groups[key] = (groups[key] ?? 0) + 1;
    return groups;
  }, {});
}

function buildCountChart(groups: Record<string, number>, color: PdfColor) {
  return Object.entries(groups)
    .sort((first, second) => second[1] - first[1])
    .slice(0, 8)
    .map(([label, value]) => ({ label, value, displayValue: formatNumber(value), color }));
}

function localizeRecommendedActionTitle(
  action: AdminDashboardSummaryResponse['recommendedActions'][number],
  language: 'en' | 'es',
) {
  const localized = action.translations?.[language]?.title ?? action.translations?.en?.title;
  if (localized && localized.trim().length > 0) return localized.trim();
  if (language !== 'es') return action.title;
  const titles: Record<string, string> = {
    'Expand Monitored Bed Capacity': 'Expandir capacidad de camas monitoreadas',
    'Monitor Bed Occupancy Trend': 'Monitorear tendencia de ocupacion de camas',
    'Increase Emergency Physician Staffing': 'Aumentar cobertura de medicos de urgencias',
    'ICU Capacity Critical - Activate Surge Protocol': 'Activar protocolo de expansion UCI',
    'Implement Respiratory Isolation Measures': 'Implementar medidas de aislamiento respiratorio',
    'Replenish Critical Protective and Respiratory Supplies': 'Reabastecer insumos criticos de proteccion respiratoria',
    'Review PPE Stock Levels': 'Revisar niveles de inventario de EPP',
  };
  return titles[action.title] ?? action.title;
}

function localizeRecommendedActionType(type: string, language: 'en' | 'es') {
  const normalized = type.toUpperCase();
  if (language !== 'es') {
    const englishLabels: Record<string, string> = {
      SUPPLY: 'Supplies',
      BED_CAPACITY: 'Hospital Capacity',
      STAFFING: 'Staffing',
      ISOLATION: 'Local Epidemiology',
      LOCAL_EPIDEMIOLOGY: 'Local Epidemiology',
      EPIDEMIOLOGY_HOSPITAL: 'Hospital Epidemiology',
      EPIDEMIOLOGY_MUNICIPAL: 'Municipal Epidemiology',
    };
    return englishLabels[normalized] ?? type.replace(/_/g, ' ');
  }
  const labels: Record<string, string> = {
    SUPPLY: 'Insumos',
    BED_CAPACITY: 'Capacidad hospitalaria',
    STAFFING: 'Personal',
    ISOLATION: 'Epidemiologia local',
    LOCAL_EPIDEMIOLOGY: 'Epidemiologia local',
    EPIDEMIOLOGY_HOSPITAL: 'Epidemiologia hospitalaria',
    EPIDEMIOLOGY_MUNICIPAL: 'Epidemiologia municipal',
  };
  return labels[normalized] ?? type.replace(/_/g, ' ');
}

function localizePriorityLabel(severity: string, language: 'en' | 'es') {
  const normalized = severity.toUpperCase();
  if (language !== 'es') {
    const labels: Record<string, string> = {
      CRITICAL: 'Critical',
      HIGH: 'High',
      MEDIUM: 'Medium',
      MODERATE: 'Medium',
      LOW: 'Low',
    };
    return labels[normalized] ?? normalized;
  }
  const labels: Record<string, string> = {
    CRITICAL: 'Critica',
    HIGH: 'Alta',
    MEDIUM: 'Media',
    MODERATE: 'Media',
    LOW: 'Baja',
  };
  return labels[normalized] ?? severity;
}

function localizeConfirmationStatus(status: string | null | undefined, language: 'en' | 'es') {
  const normalized = (status ?? '').toUpperCase();
  if (!normalized) return '-';
  if (language !== 'es') {
    const labels: Record<string, string> = {
      CONFIRMED: 'Confirmed',
      SUSPECTED: 'Suspected',
    };
    return labels[normalized] ?? normalized.replace(/_/g, ' ');
  }
  const labels: Record<string, string> = {
    CONFIRMED: 'Confirmado',
    SUSPECTED: 'Sospechoso',
  };
  return labels[normalized] ?? normalized.replace(/_/g, ' ');
}

function localizeActionStatus(status: string, language: 'en' | 'es') {
  const normalized = status.toUpperCase();
  if (language !== 'es') {
    const labels: Record<string, string> = {
      NEW: 'New',
      ACCEPTED: 'Accepted',
      ASSIGNED: 'Assigned',
      COMPLETED: 'Completed',
      REJECTED: 'Rejected',
    };
    return labels[normalized] ?? normalized;
  }
  const labels: Record<string, string> = {
    NEW: 'Nueva',
    ACCEPTED: 'Aceptada',
    ASSIGNED: 'Asignada',
    COMPLETED: 'Completada',
    REJECTED: 'Rechazada',
  };
  return labels[normalized] ?? status;
}

function reportTitle(type: AdminReportType, language: 'en' | 'es') {
  if (type === 'executive') return language === 'es' ? 'Resumen ejecutivo' : 'Executive Summary';
  if (type === 'hospital') return language === 'es' ? 'Resumen hospitalario' : 'Hospital Overview';
  return language === 'es' ? 'Panorama epidemiologico' : 'Epidemiological Snapshot';
}

function buildReportPdf(report: AdminReportPreview, language: 'en' | 'es') {
  const pdf = createSimplePdf();
  let y = 54;

  pdf.rect(36, 34, 540, 86, [246, 247, 255], [218, 220, 251]);
  pdf.text(report.title, 54, y, 18, true, [15, 23, 42]);
  y += 24;
  pdf.text(report.subtitle, 54, y, 10, false, [82, 97, 116]);
  y += 17;
  pdf.text(`${language === 'es' ? 'Tipo' : 'Type'}: ${reportTitle(report.type, language)} | StatuScope`, 54, y, 9, false, [82, 97, 116]);
  y = 144;

  y = drawSummaryCards(pdf, y, report.summaryCards, language === 'es' ? 'Resumen de indicadores' : 'Indicator Summary');
  report.charts.forEach((chart) => {
    if (chart.items.length > 0) y = drawBarChart(pdf, y, chart);
  });
  report.tables.forEach((table) => {
    y = drawPdfTable(pdf, y, table.title, table.headers, table.widths, table.rows);
  });

  const filename = `statuscope-admin-${report.type}-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  return { pdf: pdf.output(), filename };
}

function drawPdfSectionTitle(pdf: SimplePdf, y: number, title: string) {
  y = pdf.ensureSpace(y, 52);
  pdf.text(title, 48, y, 13, true, [23, 24, 199]);
  return y + 24;
}

function drawSummaryCards(pdf: SimplePdf, y: number, cards: AdminReportPreview['summaryCards'], title: string) {
  if (cards.length === 0) return y;
  y = drawPdfSectionTitle(pdf, y, title);
  const cardWidth = 252;
  const cardHeight = 72;
  const gap = 12;

  cards.slice(0, 4).forEach((card, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = 48 + column * (cardWidth + gap);
    const cardY = y + row * (cardHeight + gap);
    const accent = toneColor(card.tone);
    pdf.rect(x, cardY, cardWidth, cardHeight, [248, 250, 252], [226, 232, 240]);
    pdf.rect(x, cardY, 4, cardHeight, accent, accent);
    pdf.text(card.label, x + 16, cardY + 18, 8.5, true, [100, 116, 139]);
    wrapPdfText(card.value, 24).slice(0, 1).forEach((line) => {
      pdf.text(line, x + 16, cardY + 40, 15, true, [15, 23, 42]);
    });
    wrapPdfText(card.detail ?? '', 34).slice(0, 1).forEach((line) => {
      pdf.text(line, x + 16, cardY + 58, 8.3, false, [82, 97, 116]);
    });
  });

  return y + Math.ceil(Math.min(cards.length, 4) / 2) * (cardHeight + gap) + 12;
}

function drawBarChart(pdf: SimplePdf, y: number, chart: AdminReportChart) {
  y = drawPdfSectionTitle(pdf, y, chart.title);
  const chartHeight = Math.max(128, chart.items.length * 28 + 54);
  y = pdf.ensureSpace(y, chartHeight + 20);
  const x = 48;
  const width = 516;
  pdf.rect(x, y, width, chartHeight, [255, 255, 255], [226, 232, 240]);
  if (chart.subtitle) pdf.text(chart.subtitle, x + 14, y + 20, 8.6, false, [82, 97, 116]);
  if (chart.maxLabel) pdf.text(chart.maxLabel, x + width - 58, y + 20, 8.2, true, [100, 116, 139]);

  const maxValue = Math.max(1, ...chart.items.map((item) => item.value));
  let cursorY = y + 44;
  chart.items.forEach((item) => {
    const labelLines = wrapPdfText(item.label, 26);
    const barX = x + 174;
    const barWidth = 258;
    const fillWidth = Math.max(4, (item.value / maxValue) * barWidth);
    pdf.text(labelLines[0] ?? item.label, x + 14, cursorY + 8, 8.5, true, [15, 23, 42]);
    pdf.rect(barX, cursorY, barWidth, 10, [238, 242, 247], [238, 242, 247]);
    pdf.rect(barX, cursorY, fillWidth, 10, item.color ?? [23, 24, 199], item.color ?? [23, 24, 199]);
    pdf.text(item.displayValue ?? formatNumber(item.value), barX + barWidth + 14, cursorY + 9, 8.5, true, [71, 85, 105]);
    cursorY += 28;
  });

  return y + chartHeight + 20;
}

function drawPdfTable(
  pdf: SimplePdf,
  y: number,
  title: string,
  headers: string[],
  widths: number[],
  rows: string[][],
) {
  y = drawPdfSectionTitle(pdf, y, title);
  const x = 48;
  const tableWidth = widths.reduce((sum, width) => sum + width, 0);
  const headerHeight = 26;
  y = pdf.ensureSpace(y, headerHeight + 28);
  pdf.rect(x, y, tableWidth, headerHeight, [248, 250, 252], [226, 232, 240]);
  let cursorX = x;
  headers.forEach((header, index) => {
    pdf.text(header, cursorX + 7, y + 17, 8.2, true, [100, 116, 139]);
    if (index > 0) pdf.line(cursorX, y, cursorX, y + headerHeight, [226, 232, 240]);
    cursorX += widths[index];
  });
  y += headerHeight;

  const safeRows = rows.length > 0 ? rows : [['Sin datos disponibles']];
  safeRows.forEach((row) => {
    const paddedRow = headers.map((_, index) => row[index] ?? '');
    const cellLines = paddedRow.map((cell, index) => wrapPdfText(cell, Math.max(8, Math.floor((widths[index] - 14) / 5.2))));
    const rowHeight = Math.max(32, Math.max(...cellLines.map((lines) => lines.length)) * 11 + 14);
    y = pdf.ensureSpace(y, rowHeight + 18);
    pdf.rect(x, y, tableWidth, rowHeight, undefined, [226, 232, 240]);
    cursorX = x;
    cellLines.forEach((lines, columnIndex) => {
      lines.slice(0, 4).forEach((line, lineIndex) => {
        pdf.text(line, cursorX + 7, y + 16 + lineIndex * 11, 8.2, columnIndex === 0, columnIndex === 0 ? [15, 23, 42] : [71, 85, 105]);
      });
      if (columnIndex > 0) pdf.line(cursorX, y, cursorX, y + rowHeight, [226, 232, 240]);
      cursorX += widths[columnIndex];
    });
    y += rowHeight;
  });

  return y + 20;
}

function toneColor(tone?: AdminReportPreview['summaryCards'][number]['tone']): PdfColor {
  if (tone === 'critical') return [239, 68, 68];
  if (tone === 'warning') return [245, 158, 11];
  if (tone === 'positive') return [16, 185, 129];
  if (tone === 'info') return [14, 116, 144];
  return [23, 24, 199];
}

type PdfColor = [number, number, number];

interface SimplePdf {
  text: (value: string, x: number, y: number, size?: number, bold?: boolean, color?: PdfColor) => void;
  line: (x1: number, y1: number, x2: number, y2: number, color?: PdfColor, width?: number) => void;
  rect: (x: number, y: number, width: number, height: number, fill?: PdfColor, stroke?: PdfColor) => void;
  ensureSpace: (y: number, minSpace: number) => number;
  output: () => string;
}

function createSimplePdf(): SimplePdf {
  const pages: string[][] = [[]];
  const pageWidth = 612;
  const pageHeight = 792;

  const currentPage = () => pages[pages.length - 1];
  const addPage = () => pages.push([]);

  return {
    text(value, x, y, size = 10, bold = false, color = [15, 23, 42]) {
      const pdfY = pageHeight - y;
      const [r, g, b] = color.map((component) => (component / 255).toFixed(3));
      currentPage().push(
        `BT /${bold ? 'F2' : 'F1'} ${size} Tf ${r} ${g} ${b} rg ${x.toFixed(2)} ${pdfY.toFixed(2)} Td (${escapePdfText(value)}) Tj ET`,
      );
    },
    line(x1, y1, x2, y2, color = [226, 232, 240], width = 0.7) {
      const [r, g, b] = color.map((component) => (component / 255).toFixed(3));
      currentPage().push(
        `q ${r} ${g} ${b} RG ${width.toFixed(2)} w ${x1.toFixed(2)} ${(pageHeight - y1).toFixed(2)} m ${x2.toFixed(2)} ${(pageHeight - y2).toFixed(2)} l S Q`,
      );
    },
    rect(x, y, width, height, fill, stroke = [226, 232, 240]) {
      const pdfY = pageHeight - y - height;
      const strokeColor = stroke.map((component) => (component / 255).toFixed(3)).join(' ');
      if (fill) {
        const fillColor = fill.map((component) => (component / 255).toFixed(3)).join(' ');
        currentPage().push(
          `q ${fillColor} rg ${strokeColor} RG ${x.toFixed(2)} ${pdfY.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re B Q`,
        );
        return;
      }
      currentPage().push(
        `q ${strokeColor} RG ${x.toFixed(2)} ${pdfY.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re S Q`,
      );
    },
    ensureSpace(y, minSpace) {
      if (y + minSpace <= 740) return y;
      addPage();
      return 54;
    },
    output() {
      return buildPdfDocument(pages, pageWidth, pageHeight);
    },
  };
}

function createPdfUrl(pdf: string) {
  const webGlobal = globalThis as typeof globalThis & {
    Blob?: typeof Blob;
    URL?: typeof URL;
  };
  if (!webGlobal.Blob || !webGlobal.URL) return null;
  const blob = new webGlobal.Blob([pdf], { type: 'application/pdf' });
  return webGlobal.URL.createObjectURL(blob);
}

function revokePdfUrl(url: string | null) {
  const webGlobal = globalThis as typeof globalThis & { URL?: typeof URL };
  if (url && webGlobal.URL) {
    webGlobal.URL.revokeObjectURL(url);
  }
}

function savePdfDocument(pdf: string, filename: string) {
  const webGlobal = globalThis as typeof globalThis & {
    Blob?: typeof Blob;
    URL?: typeof URL;
    document?: Document;
  };
  if (!webGlobal.Blob || !webGlobal.URL || !webGlobal.document) return;
  const url = createPdfUrl(pdf);
  if (!url) return;
  const link = webGlobal.document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  webGlobal.URL.revokeObjectURL(url);
}

function buildPdfDocument(pages: string[][], pageWidth: number, pageHeight: number) {
  const objects: string[] = [];
  const addObject = (content: string) => {
    objects.push(content);
    return objects.length;
  };

  const catalogId = addObject('');
  const pagesId = addObject('');
  const fontRegularId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const fontBoldId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  const pageIds: number[] = [];

  pages.forEach((lines) => {
    const content = lines.join('\n');
    const contentId = addObject(`<< /Length ${latin1Length(content)} >>\nstream\n${content}\nendstream`);
    const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    pageIds.push(pageId);
  });

  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(latin1Length(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = latin1Length(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}

function latin1Length(value: string) {
  return value.length;
}

function escapePdfText(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\r?\n/g, ' ');
}

function wrapPdfText(value: string, maxChars: number) {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [''];
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  backdrop: { ...StyleSheet.absoluteFillObject },
  selectionBackdrop: { backgroundColor: AppColors.modal.backdrop },
  previewBackdrop: { backgroundColor: withAlpha(AppColors.text.primary, 0.38) },
  dialog: { width: '100%', padding: 0, overflow: 'hidden' },
  selectionDialog: { maxWidth: 700, maxHeight: '86%', borderRadius: 24 },
  previewDialog: { flex: 1, borderRadius: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 18, paddingHorizontal: 22, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: AppColors.border.soft, minHeight: 76 },
  headerCopy: { flex: 1 },
  eyebrow: { fontSize: 12, lineHeight: 16, fontWeight: '800', color: AppColors.brand.action, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '900', color: AppColors.text.primary },
  subtitle: { marginTop: 8, fontSize: 14, lineHeight: 22, color: AppColors.text.soft },
  closeButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: AppColors.border.default },
  backButton: {
    height: 40,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: withAlpha(AppColors.brand.primary, 0.14),
    backgroundColor: AppColors.surface.subtle,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: { fontSize: 13, lineHeight: 16, fontWeight: '800', color: AppColors.brand.primary },
  options: { padding: 24, gap: 12 },
  previewBody: { flex: 1, padding: 18, gap: 14 },
  previewFallback: {
    flex: 1,
    minHeight: 520,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.border.default,
    backgroundColor: AppColors.surface.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  previewFallbackText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: AppColors.text.secondary,
    textAlign: 'center',
  },
  downloadButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: AppColors.brand.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  downloadButtonText: { fontSize: 15, lineHeight: 20, fontWeight: '900', color: AppColors.surface.card },
});

export default ExportReportOverlay;
