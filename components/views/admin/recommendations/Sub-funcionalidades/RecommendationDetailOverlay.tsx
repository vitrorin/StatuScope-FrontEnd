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
import { CardBase } from '@/components/patterns/CardBase';
import { SeverityBadge } from '@/components/recommendations/SeverityBadge';
import { RecommendationFeedItem } from '@/components/views/admin/recommendations/Sub-funcionalidades/types';

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
              <SeverityBadge label={item.severity.toUpperCase()} severity={item.severity} />
              <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
                <Feather name="x" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.metricRow}>
              <MetricCard label="Confidence" value={`${item.confidenceScore}%`} />
              <MetricCard label="Expected Impact" value={item.expectedImpact} />
              <MetricCard label="Urgency Window" value={item.urgencyWindow} />
            </View>

            <CardBase style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Affected Scope</Text>
              <Text style={styles.sectionLabel}>Departments</Text>
              <Text style={styles.sectionValue}>{item.affectedDepartments.join(', ')}</Text>
              <Text style={[styles.sectionLabel, styles.sectionLabelSpacing]}>Resources</Text>
              <Text style={styles.sectionValue}>{item.affectedResources.join(', ')}</Text>
            </CardBase>

            <CardBase style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Why the AI flagged this</Text>
              {item.rationale.map((reason) => (
                <View key={reason} style={styles.bulletRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{reason}</Text>
                </View>
              ))}
            </CardBase>

            <CardBase style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Recommended Actions</Text>
              {item.recommendedActions.map((action) => (
                <View key={action} style={styles.actionRow}>
                  <Feather name="check-circle" size={15} color="#1718C7" />
                  <Text style={styles.bulletText}>{action}</Text>
                </View>
              ))}
            </CardBase>

            <CardBase style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Activity Trail</Text>
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

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <CardBase style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </CardBase>
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
    backgroundColor: 'rgba(255,255,255,0.74)',
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
    borderBottomColor: '#EEF2F7',
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
    color: '#1718C7',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '900',
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: '#70839B',
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
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 24,
    gap: 16,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
  },
  metricLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: '#8A9AAF',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
    color: '#0F172A',
  },
  sectionCard: {
    borderRadius: 18,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: '#8A9AAF',
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
    color: '#526174',
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
    backgroundColor: '#1718C7',
    marginTop: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: '#526174',
  },
  auditRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  auditTime: {
    width: 110,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    color: '#8A9AAF',
  },
  auditLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#526174',
  },
});

export default RecommendationDetailOverlay;
