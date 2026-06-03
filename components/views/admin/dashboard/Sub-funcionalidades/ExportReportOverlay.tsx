import React, { useEffect, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CardBase } from '@/components/patterns/CardBase';
import { AdminDashboardAlert, AdminDashboardMetric, AdminDashboardZone } from '@/components/views/admin/dashboard/Sub-funcionalidades/types';
import { AdminDashboardSummaryResponse } from '@/lib/adminOperational';
import { useTranslation } from '@/i18n';
import { isSpanish } from '@/components/views/admin/localization';

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
  rows: Array<{ label: string; value: string; detail?: string }>;
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

  useEffect(() => {
    if (!visible) {
      clearPreview();
      setExportingType(null);
    }
  }, [visible]);

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

  const clearPreview = () => {
    revokePdfUrl(previewUrl);
    setPreviewReport(null);
    setPreviewPdf(null);
    setPreviewUrl(null);
    setPreviewFilename(null);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={[styles.backdrop, previewReport ? styles.previewBackdrop : styles.selectionBackdrop]} onPress={onClose} />
        <CardBase style={[styles.dialog, previewReport ? styles.previewDialog : styles.selectionDialog]}>
          <View style={styles.header}>
            {previewReport ? (
              <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.75}>
                <Feather name="arrow-left" size={18} color="#0003B8" />
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
              <Feather name="x" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {previewReport ? (
            <View style={styles.previewBody}>
              {previewUrl ? (
                <PdfPreviewFrame url={previewUrl} title={previewReport.title} />
              ) : (
                <View style={styles.previewFallback}>
                  <Feather name="file-text" size={24} color="#0003B8" />
                  <Text style={styles.previewFallbackText}>
                    {isSpanish(language) ? 'La vista previa del documento no esta disponible en este entorno.' : 'Document preview is not available in this environment.'}
                  </Text>
                </View>
              )}

              <TouchableOpacity style={styles.downloadButton} activeOpacity={0.82} onPress={handleDownload}>
                <Feather name="download" size={18} color="#FFFFFF" />
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
                isLoading={exportingType === 'executive'}
                onPress={() => handlePreview('executive')}
              />
              <ReportOption
                icon="home"
                title={isSpanish(language) ? 'Resumen hospitalario' : 'Hospital Overview'}
                description={isSpanish(language) ? 'Capacidad, personal, UCI y acciones operativas relacionadas.' : 'Capacity, staffing, ICU, and related operational actions.'}
                disabled={exportingType !== null || !dashboard}
                isLoading={exportingType === 'hospital'}
                onPress={() => handlePreview('hospital')}
              />
              <ReportOption
                icon="map"
                title={isSpanish(language) ? 'Panorama epidemiologico' : 'Epidemiological Snapshot'}
                description={isSpanish(language) ? 'Brotes activos, zonas del mapa y carga regional.' : 'Active outbreaks, map zones, and regional burden.'}
                disabled={exportingType !== null || !dashboard}
                isLoading={exportingType === 'epidemiological'}
                onPress={() => handlePreview('epidemiological')}
              />
            </View>
          )}
        </CardBase>
      </View>
    </Modal>
  );
}

function ReportOption({
  icon,
  title,
  description,
  disabled,
  isLoading,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  description: string;
  disabled?: boolean;
  isLoading?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.optionCard, disabled ? styles.optionCardDisabled : null]} activeOpacity={0.82} onPress={onPress} disabled={disabled}>
      <View style={styles.optionIcon}>
        <Feather name={icon} size={18} color="#0003B8" />
      </View>
      <View style={styles.optionCopy}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      <Feather name={isLoading ? 'loader' : 'download'} size={18} color="#64748B" />
    </TouchableOpacity>
  );
}

function PdfPreviewFrame({ url, title }: { url: string; title: string }) {
  return React.createElement('iframe', {
    src: url,
    title,
    style: {
      width: '100%',
      height: '100%',
      border: '0',
      backgroundColor: '#FFFFFF',
    },
  });
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
  const subtitle = language === 'es'
    ? `${hospitalName} | Generado ${new Date(generatedAt).toLocaleString()}`
    : `${hospitalName} | Generated ${new Date(generatedAt).toLocaleString()}`;

  if (type === 'hospital') {
    return {
      type,
      title,
      subtitle,
      generatedAt,
      rows: [
        ...metrics.slice(0, 4).map((metric) => ({
          label: metric.title,
          value: metric.value,
          detail: [metric.signalLabel, metric.subtitle].filter(Boolean).join(' | '),
        })),
        ...actions.slice(0, 6).map((action) => ({
          label: action.title,
          value: action.severity,
          detail: `${action.type} | ${action.status}`,
        })),
      ],
    };
  }

  if (type === 'epidemiological') {
    return {
      type,
      title,
      subtitle,
      generatedAt,
      rows: [
        ...alerts.slice(0, 10).map((alert) => ({
          label: alert.title,
          value: alert.caseLabel ?? String(alert.caseCount ?? ''),
          detail: [alert.municipalityName ?? alert.area ?? alert.department, alert.confirmationStatus ?? alert.priority].filter(Boolean).join(' | '),
        })),
        ...zones.filter((zone) => zone.id !== 'hospital-node').slice(0, 8).map((zone) => ({
          label: zone.name,
          value: zone.cases,
          detail: `${zone.disease} | ${zone.priority}`,
        })),
      ],
    };
  }

  return {
    type,
    title,
    subtitle,
    generatedAt,
    rows: [
      { label: language === 'es' ? 'Hospital' : 'Hospital', value: hospitalName, detail: [dashboard?.municipalityName, dashboard?.stateName].filter(Boolean).join(', ') },
      { label: language === 'es' ? 'KPIs monitoreadas' : 'Monitored KPIs', value: String(metrics.length), detail: metrics.map((metric) => metric.title).join(', ') },
      { label: language === 'es' ? 'Brotes relevantes' : 'Relevant outbreaks', value: String(alerts.length), detail: alerts.slice(0, 3).map((alert) => alert.title).join(', ') },
      { label: language === 'es' ? 'Acciones prioritarias' : 'Priority actions', value: String(actions.length), detail: actions.slice(0, 3).map((action) => action.title).join(', ') },
    ],
  };
}

function reportTitle(type: AdminReportType, language: 'en' | 'es') {
  if (type === 'executive') return language === 'es' ? 'Resumen ejecutivo' : 'Executive Summary';
  if (type === 'hospital') return language === 'es' ? 'Resumen hospitalario' : 'Hospital Overview';
  return language === 'es' ? 'Panorama epidemiologico' : 'Epidemiological Snapshot';
}

function buildReportPdf(report: AdminReportPreview, language: 'en' | 'es') {
  const pdf = createSimplePdf();
  let y = 54;

  pdf.text(report.title, 48, y, 18, true);
  y += 24;
  pdf.text(report.subtitle, 48, y, 10, false, [82, 97, 116]);
  y += 16;
  pdf.text(`${language === 'es' ? 'Tipo' : 'Type'}: ${reportTitle(report.type, language)}`, 48, y, 10, false, [82, 97, 116]);
  y += 28;

  report.rows.forEach((row) => {
    y = pdf.ensureSpace(y, 58);
    const labelLines = wrapText(row.label, 44);
    const detailLines = wrapText(row.detail ?? '', 74);
    pdf.text(labelLines[0] ?? row.label, 58, y, 10, true);
    pdf.text(row.value, 455, y, 10, true, [0, 3, 184]);
    y += 14;
    detailLines.slice(0, 2).forEach((line) => {
      pdf.text(line, 58, y, 9, false, [82, 97, 116]);
      y += 12;
    });
    y += 12;
  });

  const filename = `statuscope-admin-${report.type}-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  return { pdf: pdf.output(), filename };
}

type PdfColor = [number, number, number];

interface SimplePdf {
  text: (value: string, x: number, y: number, size?: number, bold?: boolean, color?: PdfColor) => void;
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

function wrapText(value: string, maxChars: number) {
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
  selectionBackdrop: { backgroundColor: 'rgba(255,255,255,0.74)' },
  previewBackdrop: { backgroundColor: 'rgba(15, 23, 42, 0.38)' },
  dialog: { width: '100%', padding: 0, overflow: 'hidden' },
  selectionDialog: { maxWidth: 700, maxHeight: '86%', borderRadius: 24 },
  previewDialog: { flex: 1, borderRadius: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 18, paddingHorizontal: 22, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EEF2F7', minHeight: 76 },
  headerCopy: { flex: 1 },
  eyebrow: { fontSize: 12, lineHeight: 16, fontWeight: '800', color: '#1718C7', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '900', color: '#0F172A' },
  subtitle: { marginTop: 8, fontSize: 14, lineHeight: 22, color: '#70839B' },
  closeButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  backButton: {
    height: 40,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 3, 184, 0.14)',
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: { fontSize: 13, lineHeight: 16, fontWeight: '800', color: '#0003B8' },
  options: { padding: 24, gap: 12 },
  optionCard: {
    minHeight: 78,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  optionCardDisabled: { opacity: 0.58 },
  optionIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 3, 184, 0.08)', borderWidth: 1, borderColor: 'rgba(0, 3, 184, 0.16)' },
  optionCopy: { flex: 1 },
  optionTitle: { fontSize: 15, lineHeight: 20, fontWeight: '900', color: '#0F172A' },
  optionDescription: { marginTop: 4, fontSize: 12, lineHeight: 16, fontWeight: '600', color: '#64748B' },
  previewBody: { flex: 1, padding: 18, gap: 14 },
  previewFallback: {
    flex: 1,
    minHeight: 520,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  previewFallbackText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
  },
  downloadButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: '#0003B8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  downloadButtonText: { fontSize: 15, lineHeight: 20, fontWeight: '900', color: '#FFFFFF' },
});

export default ExportReportOverlay;
