import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { jsPDF } from 'jspdf';
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
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const reportDate = report.generatedAt ? new Date(report.generatedAt) : new Date();
  const totalCases = report.outbreaks.reduce((sum, outbreak) => sum + outbreak.caseCount, 0);

  let y = 54;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(t('doctor.dashboard.reports.pdfTitle'), 48, y);
  y += 24;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(82, 97, 116);
  doc.text(`${t('doctor.dashboard.reports.hospital')}: ${report.hospitalName ?? ''}`, 48, y);
  y += 16;
  doc.text(`${t('doctor.dashboard.reports.generatedAt')}: ${reportDate.toLocaleString()}`, 48, y);
  y += 16;
  doc.text(`${t('doctor.dashboard.reports.scope')}: ${scopeLabel(report.scope, t)}`, 48, y);
  y += 16;
  doc.text(`${t('doctor.dashboard.diseaseBreakdown.totalActiveCases')}: ${formatNumber(totalCases)}`, 48, y);
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
    y = ensureSpace(doc, y, 52);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(scopeGroup.title, 48, y);
    y += 30;

    (['CONFIRMED', 'SUSPECTED'] as const).forEach((status) => {
      const rows = scopeGroup.rows.filter((outbreak) => outbreak.confirmationStatus === status);
      if (rows.length === 0) return;
      y = drawStatusSection(doc, y, status, rows, t);
    });
  });

  const filename = `statuscope-${report.scope}-outbreak-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

function drawStatusSection(
  doc: jsPDF,
  y: number,
  status: 'CONFIRMED' | 'SUSPECTED',
  rows: DoctorDashboardReportResponse['outbreaks'],
  t: (key: string, params?: Record<string, string | number>) => string,
) {
  y = ensureSpace(doc, y, 56);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(status === 'CONFIRMED' ? 22 : 180, status === 'CONFIRMED' ? 101 : 83, status === 'CONFIRMED' ? 52 : 9);
  doc.text(status === 'CONFIRMED' ? t('doctor.dashboard.reports.confirmedSection') : t('doctor.dashboard.reports.suspectedSection'), 58, y);
  y += 18;
  y = drawReportHeader(doc, y, t);

  rows.forEach((outbreak) => {
    y = ensureSpace(doc, y, 42);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    const diseaseLines = doc.splitTextToSize(translateDiseaseName(t, outbreak.diseaseName), 165);
    const locationLines = doc.splitTextToSize(outbreak.location, 205);
    const rowHeight = Math.max(diseaseLines.length, locationLines.length, 1) * 12 + 8;
    doc.text(diseaseLines, 58, y);
    doc.text(locationLines, 240, y);
    doc.text(formatNumber(outbreak.caseCount), 475, y);
    y += rowHeight;
  });

  return y + 8;
}

function drawReportHeader(doc: jsPDF, y: number, t: (key: string, params?: Record<string, string | number>) => string) {
  doc.setFillColor(248, 250, 252);
  doc.rect(48, y - 12, 516, 24, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(t('doctor.dashboard.reports.diseaseColumn'), 58, y + 4);
  doc.text(t('doctor.dashboard.reports.locationColumn'), 240, y + 4);
  doc.text(t('doctor.dashboard.reports.casesColumn'), 475, y + 4);
  return y + 28;
}

function ensureSpace(doc: jsPDF, y: number, minSpace: number) {
  if (y + minSpace <= 740) return y;
  doc.addPage();
  return 54;
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
