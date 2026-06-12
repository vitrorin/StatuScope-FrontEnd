import React from 'react';
import { Feather } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { OverlayStatCard } from '@/components/overlays/OverlayStatCard';
import { CardBase } from '@/components/patterns/CardBase';
import { RecommendationFeedItem } from '@/components/views/admin/recommendations/Sub-funcionalidades/types';
import { useTranslation } from '@/i18n';
import { getRecommendationSourceLabel, isSpanish } from '@/components/views/admin/localization';
import { AppColors } from '@/constants/theme';

interface RecommendationDetailOverlayProps {
  visible: boolean;
  item: RecommendationFeedItem | null;
  onClose: () => void;
}

export function RecommendationDetailOverlay({
  visible,
  item,
  onClose,
}: RecommendationDetailOverlayProps) {
  const { language } = useTranslation();
  if (!item) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>{item.category}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.description}</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
                <Feather name="x" size={18} color={AppColors.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.metricRow}>
              <OverlayStatCard
                showAccentBar={false}
                style={styles.metricCard}
                labelStyle={styles.metricLabel}
                valueStyle={styles.metricValue}
                label={isSpanish(language) ? 'Prioridad calculada' : 'Calculated Priority'}
                value={getSeverityLabel(item.backendSeverity, language)}
              />
              <OverlayStatCard
                showAccentBar={false}
                style={styles.metricCard}
                labelStyle={styles.metricLabel}
                valueStyle={styles.metricValue}
                label={isSpanish(language) ? 'Impacto esperado' : 'Expected Impact'}
                value={item.expectedImpact}
              />
              <OverlayStatCard
                showAccentBar={false}
                style={styles.metricCard}
                labelStyle={styles.metricLabel}
                valueStyle={styles.metricValue}
                label={isSpanish(language) ? 'Ventana de urgencia' : 'Urgency Window'}
                value={item.urgencyWindow}
              />
            </View>

            <CardBase style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{isSpanish(language) ? 'Origen de generacion' : 'Generation Source'}</Text>
              <Text style={styles.sectionValue}>
                {getRecommendationSourceLabel(item.createdByMode, language)}
              </Text>
            </CardBase>

            <CardBase style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{isSpanish(language) ? 'Alcance afectado' : 'Affected Scope'}</Text>
              <Text style={styles.sectionLabel}>{isSpanish(language) ? 'Departamentos' : 'Departments'}</Text>
              <Text style={styles.sectionValue}>{item.affectedDepartments.join(', ')}</Text>
              <Text style={[styles.sectionLabel, styles.sectionLabelSpacing]}>{isSpanish(language) ? 'Recursos' : 'Resources'}</Text>
              <Text style={styles.sectionValue}>{item.affectedResources.join(', ')}</Text>
            </CardBase>

            <CardBase style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{isSpanish(language) ? 'Por que IA marco esto' : 'Why the AI flagged this'}</Text>
              {item.rationale.map((reason) => (
                <View key={reason} style={styles.bulletRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{reason}</Text>
                </View>
              ))}
            </CardBase>

            <CardBase style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{isSpanish(language) ? 'Acciones recomendadas' : 'Recommended Actions'}</Text>
              {item.recommendedActions.map((action) => (
                <View key={action} style={styles.actionRow}>
                  <Feather name="check-circle" size={15} color={AppColors.brand.action} />
                  <Text style={styles.bulletText}>{action}</Text>
                </View>
              ))}
            </CardBase>

            <CardBase style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{isSpanish(language) ? 'Historial de actividad' : 'Activity Trail'}</Text>
              {item.auditTrail.map((event) => (
                <View key={`${event.timestamp}-${event.label}`} style={styles.auditRow}>
                  <Text style={styles.auditTime}>{event.timestamp}</Text>
                  <Text style={styles.auditLabel}>{event.label}</Text>
                </View>
              ))}
            </CardBase>
          </ScrollView>
        </CardBase>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: AppColors.modal.backdrop,
  },
  dialog: {
    width: '100%',
    maxWidth: 920,
    maxHeight: '88%',
    padding: 0,
    overflow: 'hidden',
    borderRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border.soft,
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: AppColors.brand.action,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '900',
    color: AppColors.text.primary,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: AppColors.text.soft,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.border.default,
    backgroundColor: AppColors.surface.card,
  },
  content: {
    padding: 24,
    gap: 16,
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: '48%',
    width: '48%',
    borderRadius: 16,
    padding: 14,
  },
  metricLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: AppColors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '600',
    color: AppColors.text.primary,
  },
  sectionCard: {
    borderRadius: 18,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: AppColors.text.primary,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: AppColors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  sectionLabelSpacing: {
    marginTop: 12,
  },
  sectionValue: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 22,
    color: AppColors.text.body,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: AppColors.brand.action,
    marginTop: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: AppColors.text.body,
  },
  auditRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.surface.muted,
  },
  auditTime: {
    width: 110,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    color: AppColors.text.muted,
  },
  auditLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: AppColors.text.body,
  },
});

export default RecommendationDetailOverlay;

function getSeverityLabel(severity: string, language: 'en' | 'es') {
  const normalized = severity.toUpperCase();
  if (!isSpanish(language)) return normalized;
  if (normalized === 'CRITICAL') return 'CRITICA';
  if (normalized === 'HIGH') return 'ALTA';
  if (normalized === 'MEDIUM') return 'MEDIA';
  return 'BAJA';
}
