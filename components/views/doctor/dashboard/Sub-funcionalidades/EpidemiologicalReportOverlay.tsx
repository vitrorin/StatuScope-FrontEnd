import React, { useEffect, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PdfPreviewFrame, ReportOption } from '@/components/overlays';
import { CardBase } from '@/components/patterns/CardBase';
import { useTranslation } from '@/i18n';
import { getDoctorDashboardReport, DoctorDashboardReportResponse, DoctorDashboardReportScope } from '@/lib/doctorDashboard';
import { translateDiseaseName } from '@/lib/diseaseLocalization';
import { AppColors, withAlpha } from '@/constants/theme';

export interface ReportDiseaseRow {
  disease: string;
  cases: number;
  outbreaks: number;
}

export interface ReportSection {
  title: string;
  contextLabel: string;
  contextValue: string;
  totalCases: number;
  rows: ReportDiseaseRow[];
}

interface EpidemiologicalReportOverlayProps {
  visible: boolean;
  hospitalName?: string | null;
  generatedAt?: string | null;
  radiusKm?: number;
  localSection: ReportSection;
  stateSection: ReportSection;
  onClose: () => void;
}

export function EpidemiologicalReportOverlay({
  visible,
  radiusKm,
  localSection,
  stateSection,
  onClose,
}: EpidemiologicalReportOverlayProps) {
  const { t, language } = useTranslation();
  const [exportingScope, setExportingScope] = useState<DoctorDashboardReportScope | null>(null);
  const [previewReport, setPreviewReport] = useState<DoctorDashboardReportResponse | null>(null);
  const [previewPdf, setPreviewPdf] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFilename, setPreviewFilename] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setPreviewReport(null);
      setPreviewPdf(null);
      setPreviewUrl(null);
      setPreviewFilename(null);
      setExportingScope(null);
    }
  }, [visible]);

  useEffect(() => () => {
    revokePdfUrl(previewUrl);
  }, [previewUrl]);

  const handlePreview = async (scope: DoctorDashboardReportScope) => {
    setExportingScope(scope);
    try {
      const report = await getDoctorDashboardReport(scope, radiusKm);
      const { pdf, filename } = buildReportPdf({ report, t, language });
      setPreviewReport(report);
      setPreviewPdf(pdf);
      setPreviewFilename(filename);
      setPreviewUrl(createPdfUrl(pdf));
    } finally {
      setExportingScope(null);
    }
  };

  const handleDownload = () => {
    if (!previewPdf || !previewFilename) return;
    savePdfDocument(previewPdf, previewFilename);
    onClose();
  };

  const handleBack = () => {
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
                <Feather name="arrow-left" size={18} color={AppColors.brand.primary} />
                <Text style={styles.backText}>{t('doctor.dashboard.reports.back')}</Text>
              </TouchableOpacity>
            ) : null}
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>{t('doctor.dashboard.overlays.reportPreview')}</Text>
              <Text style={styles.title}>
                {previewReport ? scopeLabel(previewReport.scope, t) : t('doctor.dashboard.overlays.reportTitle')}
              </Text>
              <Text style={styles.subtitle}>
                {previewReport
                  ? t('doctor.dashboard.reports.previewSubtitle', { count: previewReport.outbreaks.length })
                  : t('doctor.dashboard.overlays.reportSubtitle')}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>

          {previewReport ? (
            <View style={styles.previewBody}>
              {previewUrl ? (
                <PdfPreviewFrame url={previewUrl} title={t('doctor.dashboard.overlays.reportPreview')} />
              ) : (
                <View style={styles.previewFallback}>
                  <Feather name="file-text" size={24} color={AppColors.brand.primary} />
                  <Text style={styles.previewFallbackText}>{t('doctor.dashboard.reports.previewUnavailable')}</Text>
                </View>
              )}

              <TouchableOpacity style={styles.downloadButton} activeOpacity={0.82} onPress={handleDownload}>
                <Feather name="download" size={18} color={AppColors.surface.card} />
                <Text style={styles.downloadButtonText}>{t('doctor.dashboard.reports.downloadReport')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.options}>
              <ReportOption
                icon="map-pin"
                title={t('doctor.dashboard.reports.localOptionTitle')}
                description={localSection.contextValue}
                disabled={exportingScope !== null}
                loading={exportingScope === 'local'}
                onPress={() => { void handlePreview('local'); }}
              />
              <ReportOption
                icon="map"
                title={t('doctor.dashboard.reports.stateOptionTitle')}
                description={stateSection.contextValue}
                disabled={exportingScope !== null}
                loading={exportingScope === 'state'}
                onPress={() => { void handlePreview('state'); }}
              />
              <ReportOption
                icon="layers"
                title={t('doctor.dashboard.reports.bothOptionTitle')}
                description={t('doctor.dashboard.reports.bothOptionDescription')}
                disabled={exportingScope !== null}
                loading={exportingScope === 'both'}
                onPress={() => { void handlePreview('both'); }}
              />
            </View>
          )}
        </CardBase>
      </View>
    </Modal>
  );
}

function buildReportPdf({
  report,
  t,
  language,
}: {
  report: DoctorDashboardReportResponse;
  t: (key: string, params?: Record<string, string | number>) => string;
  language: 'en' | 'es';
}) {
  const pdf = createSimplePdf();
  const reportDate = report.generatedAt ? new Date(report.generatedAt) : new Date();
  const totalCases = report.outbreaks.reduce((sum, outbreak) => sum + outbreak.caseCount, 0);
  const confirmedRows = report.outbreaks.filter((outbreak) => outbreak.confirmationStatus === 'CONFIRMED');
  const suspectedRows = report.outbreaks.filter((outbreak) => outbreak.confirmationStatus !== 'CONFIRMED');
  const location = [report.municipalityName, report.stateName].filter(Boolean).join(', ');

  let y = 54;
  pdf.rect(36, 34, 540, 88, [246, 247, 255], [218, 220, 251]);
  pdf.text(t('doctor.dashboard.reports.pdfTitle'), 54, y, 18, true, [15, 23, 42]);
  y += 24;
  pdf.text(`${t('doctor.dashboard.reports.hospital')}: ${report.hospitalName ?? ''}`, 54, y, 10, false, [82, 97, 116]);
  y += 17;
  pdf.text(`${t('doctor.dashboard.reports.generatedAt')}: ${reportDate.toLocaleString(language === 'es' ? 'es-MX' : 'en-US')} | ${t('doctor.dashboard.reports.scope')}: ${scopeLabel(report.scope, t)}`, 54, y, 9, false, [82, 97, 116]);
  y += 17;
  pdf.text(location || 'StatuScope', 54, y, 9, false, [82, 97, 116]);
  y = 146;

  y = drawSummaryCards(pdf, y, [
    { label: language === 'es' ? 'Brotes analizados' : 'Analyzed Outbreaks', value: formatNumber(report.outbreaks.length), detail: scopeLabel(report.scope, t), tone: report.outbreaks.length > 0 ? 'info' : 'positive' },
    { label: t('doctor.dashboard.diseaseBreakdown.totalActiveCases'), value: formatNumber(totalCases), detail: language === 'es' ? 'Casos acumulados del alcance' : 'Scope-level accumulated cases', tone: totalCases > 0 ? 'warning' : 'positive' },
    { label: language === 'es' ? 'Confirmados' : 'Confirmed', value: formatNumber(confirmedRows.length), detail: language === 'es' ? 'Brotes con confirmacion' : 'Confirmed outbreaks', tone: confirmedRows.length > 0 ? 'critical' : 'positive' },
    { label: language === 'es' ? 'Sospechosos' : 'Suspected', value: formatNumber(suspectedRows.length), detail: language === 'es' ? 'Requieren seguimiento' : 'Need follow-up', tone: suspectedRows.length > 0 ? 'warning' : 'positive' },
  ], language === 'es' ? 'Resumen epidemiologico' : 'Epidemiological Summary');

  const diseaseItems = buildDiseaseChartItems(report.outbreaks, t).slice(0, 8);
  if (diseaseItems.length > 0) {
    y = drawBarChart(pdf, y, {
      title: language === 'es' ? 'Top enfermedades por casos' : 'Top Diseases by Cases',
      subtitle: language === 'es' ? 'Carga clinica agregada por enfermedad.' : 'Aggregated clinical burden by disease.',
      items: diseaseItems,
    });
  }

  const statusItems = buildStatusChartItems(report.outbreaks, language);
  if (statusItems.length > 0) {
    y = drawBarChart(pdf, y, {
      title: language === 'es' ? 'Distribucion por estado de confirmacion' : 'Confirmation Status Distribution',
      subtitle: language === 'es' ? 'Conteo de brotes por clasificacion epidemiologica.' : 'Outbreak count by epidemiological classification.',
      items: statusItems,
    });
  }

  const scopeGroups = report.scope === 'both'
    ? [
      { title: t('doctor.dashboard.reports.stateSectionTitle'), rows: report.outbreaks.filter((outbreak) => outbreak.scope === 'STATE') },
      { title: t('doctor.dashboard.reports.localSectionTitle'), rows: report.outbreaks.filter((outbreak) => outbreak.scope === 'MUNICIPALITY') },
    ]
    : [
      { title: scopeLabel(report.scope, t), rows: report.outbreaks },
    ];

  scopeGroups.forEach((scopeGroup) => {
    if (scopeGroup.rows.length === 0) return;
    y = drawPdfTable(
      pdf,
      y,
      scopeGroup.title,
      [
        t('doctor.dashboard.reports.diseaseColumn'),
        t('doctor.dashboard.reports.locationColumn'),
        t('doctor.dashboard.reports.casesColumn'),
        language === 'es' ? 'Estado' : 'Status',
        language === 'es' ? 'Inicio' : 'Started',
      ],
      [148, 156, 58, 82, 72],
      scopeGroup.rows
        .sort((first, second) => second.caseCount - first.caseCount)
        .map((outbreak) => [
          translateDiseaseName(t, outbreak.diseaseName),
          outbreak.location,
          formatNumber(outbreak.caseCount),
          localizeOutbreakStatus(outbreak.confirmationStatus, language),
          formatDate(outbreak.startedAt, language),
        ]),
    );
  });

  const filename = `statuscope-${report.scope}-outbreak-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  return { pdf: pdf.output(), filename };
}

function scopeLabel(scope: string | null | undefined, t: (key: string) => string) {
  if (scope === 'local' || scope === 'MUNICIPALITY') return t('doctor.dashboard.reports.localScope');
  if (scope === 'state' || scope === 'STATE') return t('doctor.dashboard.reports.stateScope');
  if (scope === 'both') return t('doctor.dashboard.reports.bothScope');
  return scope ?? '';
}

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

function formatDate(value: string | null | undefined, language: 'en' | 'es') {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString(language === 'es' ? 'es-MX' : 'en-US');
}

function localizeOutbreakStatus(status: string | null | undefined, language: 'en' | 'es') {
  const normalized = (status ?? '').toUpperCase();
  if (language !== 'es') {
    if (normalized === 'CONFIRMED') return 'Confirmed';
    if (normalized === 'SUSPECTED') return 'Suspected';
    return normalized || '-';
  }
  if (normalized === 'CONFIRMED') return 'Confirmado';
  if (normalized === 'SUSPECTED') return 'Sospechoso';
  return normalized || '-';
}

function buildDiseaseChartItems(
  outbreaks: DoctorDashboardReportResponse['outbreaks'],
  t: (key: string, params?: Record<string, string | number>) => string,
) {
  const groups = new Map<string, number>();
  outbreaks.forEach((outbreak) => {
    const disease = translateDiseaseName(t, outbreak.diseaseName);
    groups.set(disease, (groups.get(disease) ?? 0) + outbreak.caseCount);
  });
  return [...groups.entries()]
    .sort((first, second) => second[1] - first[1])
    .map(([label, value]) => ({ label, value, displayValue: formatNumber(value), color: [23, 24, 199] as PdfColor }));
}

function buildStatusChartItems(outbreaks: DoctorDashboardReportResponse['outbreaks'], language: 'en' | 'es') {
  const groups = new Map<string, number>();
  outbreaks.forEach((outbreak) => {
    const label = localizeOutbreakStatus(outbreak.confirmationStatus, language);
    groups.set(label, (groups.get(label) ?? 0) + 1);
  });
  return [...groups.entries()]
    .sort((first, second) => second[1] - first[1])
    .map(([label, value]) => ({
      label,
      value,
      displayValue: formatNumber(value),
      color: label.toLowerCase().startsWith(language === 'es' ? 'confirm' : 'confirm') ? [22, 163, 74] as PdfColor : [245, 158, 11] as PdfColor,
    }));
}

interface PdfSummaryCard {
  label: string;
  value: string;
  detail?: string;
  tone?: 'default' | 'critical' | 'warning' | 'positive' | 'info';
}

interface PdfBarChart {
  title: string;
  subtitle?: string;
  items: { label: string; value: number; displayValue?: string; color?: PdfColor }[];
}

function drawPdfSectionTitle(pdf: SimplePdf, y: number, title: string) {
  y = pdf.ensureSpace(y, 52);
  pdf.text(title, 48, y, 13, true, [23, 24, 199]);
  return y + 24;
}

function drawSummaryCards(pdf: SimplePdf, y: number, cards: PdfSummaryCard[], title: string) {
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
    wrapText(card.value, 24).slice(0, 1).forEach((line) => {
      pdf.text(line, x + 16, cardY + 40, 15, true, [15, 23, 42]);
    });
    wrapText(card.detail ?? '', 34).slice(0, 1).forEach((line) => {
      pdf.text(line, x + 16, cardY + 58, 8.3, false, [82, 97, 116]);
    });
  });

  return y + Math.ceil(Math.min(cards.length, 4) / 2) * (cardHeight + gap) + 12;
}

function drawBarChart(pdf: SimplePdf, y: number, chart: PdfBarChart) {
  y = drawPdfSectionTitle(pdf, y, chart.title);
  const chartHeight = Math.max(128, chart.items.length * 28 + 54);
  y = pdf.ensureSpace(y, chartHeight + 20);
  const x = 48;
  const width = 516;
  pdf.rect(x, y, width, chartHeight, [255, 255, 255], [226, 232, 240]);
  if (chart.subtitle) pdf.text(chart.subtitle, x + 14, y + 20, 8.6, false, [82, 97, 116]);

  const maxValue = Math.max(1, ...chart.items.map((item) => item.value));
  let cursorY = y + 44;
  chart.items.forEach((item) => {
    const barX = x + 174;
    const barWidth = 258;
    const fillWidth = Math.max(4, (item.value / maxValue) * barWidth);
    pdf.text(wrapText(item.label, 26)[0] ?? item.label, x + 14, cursorY + 8, 8.5, true, [15, 23, 42]);
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

  rows.forEach((row) => {
    const cellLines = row.map((cell, index) => wrapText(cell, Math.max(8, Math.floor((widths[index] - 14) / 5.2))));
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

function toneColor(tone?: PdfSummaryCard['tone']): PdfColor {
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
  save: (filename: string) => void;
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
    save(filename) {
      savePdfDocument(buildPdfDocument(pages, pageWidth, pageHeight), filename);
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
  if (!webGlobal.Blob || !webGlobal.URL || !webGlobal.document) {
    return;
  }
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
  previewStats: { flexDirection: 'row', gap: 12 },
  previewStat: {
    flex: 1,
    minHeight: 76,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.border.default,
    backgroundColor: AppColors.surface.subtle,
    padding: 14,
    justifyContent: 'center',
  },
  previewStatLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    color: AppColors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  previewStatValue: { marginTop: 6, fontSize: 18, lineHeight: 24, fontWeight: '900', color: AppColors.text.primary },
  previewScroll: {
    maxHeight: 300,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.border.default,
    backgroundColor: AppColors.surface.card,
  },
  previewList: { padding: 12, gap: 10 },
  previewRow: {
    minHeight: 72,
    borderRadius: 14,
    backgroundColor: AppColors.surface.subtle,
    borderWidth: 1,
    borderColor: AppColors.border.soft,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewRowCopy: { flex: 1, minWidth: 0 },
  previewDisease: { fontSize: 14, lineHeight: 18, fontWeight: '900', color: AppColors.text.primary },
  previewLocation: { marginTop: 4, fontSize: 12, lineHeight: 16, fontWeight: '600', color: AppColors.text.secondary },
  previewMeta: { alignItems: 'flex-end', maxWidth: 140 },
  previewCases: { fontSize: 15, lineHeight: 20, fontWeight: '900', color: AppColors.brand.primary },
  previewStatus: { marginTop: 4, fontSize: 11, lineHeight: 14, fontWeight: '800', color: AppColors.text.secondary },
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

export default EpidemiologicalReportOverlay;
