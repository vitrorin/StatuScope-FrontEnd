import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CardBase } from '@/components/patterns/CardBase';

interface EpidemiologicalReportOverlayProps {
  visible: boolean;
  onClose: () => void;
  hospitalName?: string | null;
  municipalityName?: string | null;
  stateName?: string | null;
  generatedAt?: string | null;
  topCards?: { title: string; value: string; status?: string | null }[];
  alerts?: { disease: string; severity: string; location: string; caseCount: number }[];
  mapZones?: { municipalityName: string; status: string; outbreakCount: number }[];
  recommendedActions?: { title: string; type: string; severity: string; status: string }[];
}

export function EpidemiologicalReportOverlay({
  visible,
  onClose,
  hospitalName,
  municipalityName,
  stateName,
  generatedAt,
  topCards,
  alerts,
  mapZones,
  recommendedActions,
}: EpidemiologicalReportOverlayProps) {
  const criticalZones = (mapZones ?? []).filter((z) => z.status.toUpperCase().includes('CRITICAL'));
  const warningZones = (mapZones ?? []).filter((z) => z.status.toUpperCase().includes('WARNING'));
  const highAlerts = (alerts ?? []).filter((a) => a.severity === 'HIGH');
  const totalActiveCases = (alerts ?? []).reduce((sum, a) => sum + a.caseCount, 0);

  const locationLabel = [municipalityName, stateName].filter(Boolean).join(', ') || 'your hospital region';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Report Preview</Text>
              <Text style={styles.title}>Epidemiological Summary</Text>
              <Text style={styles.subtitle}>
                {hospitalName
                  ? `${hospitalName} — operational report for ${locationLabel}.`
                  : `Regional respiratory and hospital load overview for ${locationLabel}.`}
                {generatedAt ? ` Last updated: ${new Date(generatedAt).toLocaleString()}.` : ''}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
              <Feather name="x" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.sections} showsVerticalScrollIndicator={false}>
            {highAlerts.length > 0 ? (
              <CardBase style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>High-Priority Alerts</Text>
                {highAlerts.slice(0, 3).map((alert) => (
                  <View key={alert.disease} style={styles.sectionRow}>
                    <View style={[styles.sectionDot, { backgroundColor: '#EF4444' }]} />
                    <View style={styles.sectionTextContainer}>
                      <Text style={styles.sectionRowTitle}>{alert.disease}</Text>
                      <Text style={styles.sectionRowDetail}>
                        {alert.caseCount} active case{alert.caseCount === 1 ? '' : 's'} in {alert.location}
                      </Text>
                    </View>
                  </View>
                ))}
                {highAlerts.length > 3 ? (
                  <Text style={styles.sectionMore}>+{highAlerts.length - 3} more high-priority alert{highAlerts.length - 3 === 1 ? '' : 's'}</Text>
                ) : null}
              </CardBase>
            ) : null}

            {criticalZones.length > 0 || warningZones.length > 0 ? (
              <CardBase style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Zone Status</Text>
                {criticalZones.length > 0 ? (
                  <View style={styles.sectionRow}>
                    <View style={[styles.sectionDot, { backgroundColor: '#EF4444' }]} />
                    <View style={styles.sectionTextContainer}>
                      <Text style={styles.sectionRowTitle}>{criticalZones.length} Critical Zone{criticalZones.length === 1 ? '' : 's'}</Text>
                      <Text style={styles.sectionRowDetail}>
                        {criticalZones.map((z) => z.municipalityName).join(', ')}
                      </Text>
                    </View>
                  </View>
                ) : null}
                {warningZones.length > 0 ? (
                  <View style={styles.sectionRow}>
                    <View style={[styles.sectionDot, { backgroundColor: '#F97316' }]} />
                    <View style={styles.sectionTextContainer}>
                      <Text style={styles.sectionRowTitle}>{warningZones.length} Warning Zone{warningZones.length === 1 ? '' : 's'}</Text>
                      <Text style={styles.sectionRowDetail}>
                        {warningZones.map((z) => z.municipalityName).join(', ')}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </CardBase>
            ) : null}

            {topCards && topCards.length > 0 ? (
              <CardBase style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Operational Metrics</Text>
                {topCards.slice(0, 4).map((card) => (
                  <View key={card.title} style={styles.sectionRow}>
                    <View style={[styles.sectionDot, { backgroundColor: (card.status ?? '').toUpperCase().includes('CRITICAL') ? '#EF4444' : (card.status ?? '').toUpperCase().includes('WARNING') ? '#F59E0B' : '#22C55E' }]} />
                    <View style={styles.sectionTextContainer}>
                      <Text style={styles.sectionRowTitle}>{card.title}</Text>
                      <Text style={styles.sectionRowDetail}>{card.value}</Text>
                    </View>
                  </View>
                ))}
              </CardBase>
            ) : null}

            {recommendedActions && recommendedActions.length > 0 ? (
              <CardBase style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Operational Recommendation</Text>
                {recommendedActions.slice(0, 2).map((action) => (
                  <View key={action.title} style={styles.sectionRow}>
                    <View style={[styles.sectionDot, { backgroundColor: action.severity === 'HIGH' ? '#EF4444' : action.severity === 'MEDIUM' ? '#F59E0B' : '#0003B8' }]} />
                    <View style={styles.sectionTextContainer}>
                      <Text style={styles.sectionRowTitle}>{action.title}</Text>
                      <Text style={styles.sectionRowDetail}>{action.type.replace(/_/g, ' ')} · {action.status.replace(/_/g, ' ').toLowerCase()}</Text>
                    </View>
                  </View>
                ))}
              </CardBase>
            ) : null}

            {highAlerts.length === 0 && criticalZones.length === 0 && warningZones.length === 0 ? (
              <CardBase style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>All Clear</Text>
                <Text style={styles.sectionText}>
                  No critical alerts or zone warnings are active. The hospital is operating within normal parameters.
                </Text>
              </CardBase>
            ) : null}

            <CardBase style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <Text style={styles.sectionText}>
                {topCards && topCards.length > 0
                  ? `${topCards.length} operational metric${topCards.length === 1 ? '' : 's'} monitored. `
                  : ''}
                {(alerts ?? []).length > 0
                  ? `${totalActiveCases} total active case${totalActiveCases === 1 ? '' : 's'} across ${(alerts ?? []).length} alert${(alerts ?? []).length === 1 ? '' : 's'}. `
                  : 'No active disease alerts. '}
                {(mapZones ?? []).length > 0
                  ? `${(mapZones ?? []).length} municipalit${(mapZones ?? []).length === 1 ? 'y' : 'ies'} tracked.`
                  : ''}
              </Text>
            </CardBase>
          </ScrollView>
        </CardBase>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.74)' },
  dialog: { width: '100%', maxWidth: 700, maxHeight: '85%', borderRadius: 24, padding: 0, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 18, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
  eyebrow: { fontSize: 12, lineHeight: 16, fontWeight: '800', color: '#1718C7', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '900', color: '#0F172A' },
  subtitle: { marginTop: 8, fontSize: 14, lineHeight: 22, color: '#70839B' },
  closeButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  sections: { padding: 24, gap: 14 },
  sectionCard: { borderRadius: 18, padding: 16 },
  sectionTitle: { fontSize: 14, lineHeight: 18, fontWeight: '800', color: '#1718C7', marginBottom: 12 },
  sectionText: { fontSize: 14, lineHeight: 22, color: '#526174' },
  sectionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  sectionDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, flexShrink: 0 },
  sectionTextContainer: { flex: 1 },
  sectionRowTitle: { fontSize: 13, lineHeight: 18, fontWeight: '600', color: '#243347' },
  sectionRowDetail: { fontSize: 12, lineHeight: 16, color: '#70839B' },
  sectionMore: { fontSize: 12, lineHeight: 16, color: '#64748B', marginTop: 4 },
});

export default EpidemiologicalReportOverlay;