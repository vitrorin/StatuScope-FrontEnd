import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CardBase } from '@/components/patterns/CardBase';
import { useTranslation } from '@/i18n';
import { getDoctorDashboardReport, DoctorDashboardReportResponse, DoctorDashboardReportScope } from '@/lib/doctorDashboard';
import { translateDiseaseName } from '@/lib/diseaseLocalization';

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
  const { t } = useTranslation();
  const [exportingScope, setExportingScope] = useState<DoctorDashboardReportScope | null>(null);

  const handleExport = async (scope: DoctorDashboardReportScope) => {
    setExportingScope(scope);
    try {
      const report = await getDoctorDashboardReport(scope, radiusKm);
      exportReportPdf({ report, t });
      onClose();
    } finally {
      setExportingScope(null);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>{t('doctor.dashboard.overlays.reportPreview')}</Text>
              <Text style={styles.title}>{t('doctor.dashboard.overlays.reportTitle')}</Text>
              <Text style={styles.subtitle}>{t('doctor.dashboard.overlays.reportSubtitle')}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.options}>
            <ReportOption
              icon="map-pin"
              title={t('doctor.dashboard.reports.localOptionTitle')}
              description={localSection.contextValue}
              disabled={exportingScope !== null}
              isLoading={exportingScope === 'local'}
              onPress={() => { void handleExport('local'); }}
            />
            <ReportOption
              icon="map"
              title={t('doctor.dashboard.reports.stateOptionTitle')}
              description={stateSection.contextValue}
              disabled={exportingScope !== null}
              isLoading={exportingScope === 'state'}
              onPress={() => { void handleExport('state'); }}
            />
            <ReportOption
              icon="layers"
              title={t('doctor.dashboard.reports.bothOptionTitle')}
              description={t('doctor.dashboard.reports.bothOptionDescription')}
              disabled={exportingScope !== null}
              isLoading={exportingScope === 'both'}
              onPress={() => { void handleExport('both'); }}
            />
          </View>
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

function exportReportPdf({
  report,
  t,
}: {
  report: DoctorDashboardReportResponse;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const pdf = createSimplePdf();
  const reportDate = report.generatedAt ? new Date(report.generatedAt) : new Date();
  const totalCases = report.outbreaks.reduce((sum, outbreak) => sum + outbreak.caseCount, 0);

  let y = 54;
  pdf.text(t('doctor.dashboard.reports.pdfTitle'), 48, y, 18, true);
  y += 24;
  pdf.text(`${t('doctor.dashboard.reports.hospital')}: ${report.hospitalName ?? ''}`, 48, y, 10, false, [82, 97, 116]);
  y += 16;
  pdf.text(`${t('doctor.dashboard.reports.generatedAt')}: ${reportDate.toLocaleString()}`, 48, y, 10, false, [82, 97, 116]);
  y += 16;
  pdf.text(`${t('doctor.dashboard.reports.scope')}: ${scopeLabel(report.scope, t)}`, 48, y, 10, false, [82, 97, 116]);
  y += 16;
  pdf.text(`${t('doctor.dashboard.diseaseBreakdown.totalActiveCases')}: ${formatNumber(totalCases)}`, 48, y, 10, false, [82, 97, 116]);
  y += 28;

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
    y = pdf.ensureSpace(y, 52);
    pdf.text(scopeGroup.title, 48, y, 13, true);
    y += 30;

    (['CONFIRMED', 'SUSPECTED'] as const).forEach((status) => {
      const rows = scopeGroup.rows.filter((outbreak) => outbreak.confirmationStatus === status);
      if (rows.length === 0) return;
      y = drawStatusSection(pdf, y, status, rows, t);
    });
  });

  const filename = `statuscope-${report.scope}-outbreak-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  pdf.save(filename);
}

function drawStatusSection(
  pdf: SimplePdf,
  y: number,
  status: 'CONFIRMED' | 'SUSPECTED',
  rows: DoctorDashboardReportResponse['outbreaks'],
  t: (key: string, params?: Record<string, string | number>) => string,
) {
  y = pdf.ensureSpace(y, 56);
  pdf.text(
    status === 'CONFIRMED' ? t('doctor.dashboard.reports.confirmedSection') : t('doctor.dashboard.reports.suspectedSection'),
    58,
    y,
    11,
    true,
    status === 'CONFIRMED' ? [22, 101, 52] : [180, 83, 9],
  );
  y += 18;
  y = drawReportHeader(pdf, y, t);

  rows.forEach((outbreak) => {
    y = pdf.ensureSpace(y, 42);
    const diseaseLines = wrapText(translateDiseaseName(t, outbreak.diseaseName), 28);
    const locationLines = wrapText(outbreak.location, 34);
    const rowHeight = Math.max(diseaseLines.length, locationLines.length, 1) * 12 + 8;
    diseaseLines.forEach((line, index) => pdf.text(line, 58, y + index * 12, 9));
    locationLines.forEach((line, index) => pdf.text(line, 240, y + index * 12, 9));
    pdf.text(formatNumber(outbreak.caseCount), 475, y, 9);
    y += rowHeight;
  });

  return y + 8;
}

function drawReportHeader(pdf: SimplePdf, y: number, t: (key: string, params?: Record<string, string | number>) => string) {
  pdf.text(t('doctor.dashboard.reports.diseaseColumn'), 58, y + 4, 9, true, [100, 116, 139]);
  pdf.text(t('doctor.dashboard.reports.locationColumn'), 240, y + 4, 9, true, [100, 116, 139]);
  pdf.text(t('doctor.dashboard.reports.casesColumn'), 475, y + 4, 9, true, [100, 116, 139]);
  return y + 28;
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

type PdfColor = [number, number, number];

interface SimplePdf {
  text: (value: string, x: number, y: number, size?: number, bold?: boolean, color?: PdfColor) => void;
  ensureSpace: (y: number, minSpace: number) => number;
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
    ensureSpace(y, minSpace) {
      if (y + minSpace <= 740) return y;
      addPage();
      return 54;
    },
    save(filename) {
      const pdf = buildPdfDocument(pages, pageWidth, pageHeight);
      const webGlobal = globalThis as typeof globalThis & {
        Blob?: typeof Blob;
        URL?: typeof URL;
        document?: Document;
      };
      if (!webGlobal.Blob || !webGlobal.URL || !webGlobal.document) {
        return;
      }
      const blob = new webGlobal.Blob([pdf], { type: 'application/pdf' });
      const url = webGlobal.URL.createObjectURL(blob);
      const link = webGlobal.document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      webGlobal.URL.revokeObjectURL(url);
    },
  };
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
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.74)' },
  dialog: { width: '100%', maxWidth: 700, borderRadius: 24, padding: 0, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 18, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
  headerCopy: { flex: 1 },
  eyebrow: { fontSize: 12, lineHeight: 16, fontWeight: '800', color: '#1718C7', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '900', color: '#0F172A' },
  subtitle: { marginTop: 8, fontSize: 14, lineHeight: 22, color: '#70839B' },
  closeButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
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
});

export default EpidemiologicalReportOverlay;
