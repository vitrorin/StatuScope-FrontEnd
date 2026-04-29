import React, { useState } from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AssistantInputBar } from '@/components/diagnosis/AssistantInputBar';
import { ConfidenceBar } from '@/components/diagnosis/ConfidenceBar';
import { DiagnosisChatBubble } from '@/components/diagnosis/DiagnosisChatBubble';
import { DiagnosisResponseCard } from '@/components/diagnosis/DiagnosisResponseCard';
import { DiagnosisRiskCard } from '@/components/diagnosis/DiagnosisRiskCard';
import { PatientEvaluationForm } from '@/components/diagnosis/PatientEvaluationForm';
import { RecommendedTestsCard } from '@/components/diagnosis/RecommendedTestsCard';
import { Button } from '@/components/foundation/Button';
import { useAuth } from '@/contexts/AuthContext';
import { initialsFromName } from '@/lib/format';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CardBase } from '@/components/patterns/CardBase';
import { askAssistant, AssistantMessage } from '@/lib/diagnosisAssistant';

const navigationLinks = {
  dashboard: '/dashboard/doctor',
  diagnosis: '/diagnosis',
  analytics: '/analytics',
} as const;

export function DoctorDiagnosis() {
  const router = useRouter();
  const { logout, profile } = useAuth();
  const [assistantQuery, setAssistantQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<AssistantMessage[]>([]);

  const handleSendPress = async () => {
    const userMessage = assistantQuery.trim();
    if (!userMessage) return;
    setAssistantQuery('');

    const updatedHistory: AssistantMessage[] = [
      ...chatHistory,
      { role: 'user', content: userMessage },
    ];
    setChatHistory(updatedHistory);

    try {
      const response = await askAssistant({ messages: updatedHistory });
      setChatHistory([
        ...updatedHistory,
        { role: 'assistant', content: response.reply },
      ]);
    } catch {
      // keep the user message in history even if request fails
    }
  };

  return (
    <DashboardLayout
      active="diagnosis"
      sectionLabel="Diagnosis"
      searchPlaceholder="Search medical records..."
      userName={profile?.fullName ?? 'Doctor'}
      userId={profile?.hospitalName ? profile.hospitalName : profile?.email}
      avatarText={initialsFromName(profile?.fullName)}
      links={navigationLinks}
      onLogout={async () => {
        await logout();
        router.replace('/login');
      }}
    >
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.heroStrip}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>Clinical Intelligence Workspace</Text>
            <Text style={styles.heroTitle}>Differential diagnosis with locality-aware risk context</Text>
            <Text style={styles.heroDescription}>
              Evaluate the patient, contrast symptoms with nearby outbreaks, and confirm the most reliable diagnostic path.
            </Text>
          </View>

          <View style={styles.heroBadge}>
            <View style={styles.heroBadgeDot} />
            <Text style={styles.heroBadgeText}>Case monitored live</Text>
          </View>
        </View>

        <View style={styles.workspace}>
          <PatientEvaluationForm
            title="Patient Evaluation"
            caseMeta="Case ID: #88291 - Started 4m ago"
            ageValue="7"
            sexValue="male"
            postalCodeValue="90210"
            symptomsValue="High fever, watery eyes, reddish spots appearing on face."
            dropzoneState="empty"
            showSecondaryAction
            style={styles.formPanel}
          />

          <View style={styles.rightColumn}>
            <CardBase style={styles.chatCard}>
              <View style={styles.chatHeader}>
                <View style={styles.chatTitleGroup}>
                  <View style={styles.chatIconWrap}>
                    <MaterialCommunityIcons name="brain" size={18} color="#0003B8" />
                  </View>

                  <View style={styles.chatCopy}>
                    <Text style={styles.chatTitle}>Diagnosis Assistant</Text>
                    <Text style={styles.chatSubtitle}>
                      Cross-checking symptoms with nearby epidemiological activity
                    </Text>
                  </View>
                </View>

                <View style={styles.liveBadge}>
                  <View style={styles.liveBadgeDot} />
                  <Text style={styles.liveBadgeText}>Live Monitor</Text>
                </View>
              </View>

              <View style={styles.chatBody}>
                <DiagnosisChatBubble
                  sender="user"
                  message="Patient with fever 39 C, conjunctivitis, rash"
                  style={styles.userBubble}
                />

                <View style={styles.responseRow}>
                  <View style={styles.assistantAvatar}>
                    <MaterialCommunityIcons name="robot-excited-outline" size={16} color="#FFFFFF" />
                  </View>

                  <View style={styles.responseStack}>
                    <DiagnosisResponseCard
                      responseText="Symptoms are consistent with dengue. HOWEVER, within a 5 km radius there have been 12 confirmed measles cases in the last 72 hours."
                      highlightText="HOWEVER"
                      showWarning
                      warningMessage="Please check for Koplik spots and review vaccination history. Locality risk factor is extremely high for this profile."
                      style={styles.responseCard}
                    />

                    <View style={styles.riskRow}>
                      <ConfidenceBar
                        label="Dengue"
                        value={85}
                        valueText="85%"
                        color="#0003B8"
                        style={styles.confidenceCard}
                      />

                      <DiagnosisRiskCard
                        title="Measles"
                        subtitle="High Risk (Locality)"
                        statusText="Alert"
                        variant="critical"
                        statusTone="text"
                        style={styles.riskCard}
                      />
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.chatFooter}>
                <AssistantInputBar
                  value={assistantQuery}
                  onChangeText={setAssistantQuery}
                  onSendPress={handleSendPress}
                />
              </View>
            </CardBase>

            <View style={styles.bottomRow}>
              <RecommendedTestsCard
                title="Recommended Tests"
                tests={[
                  { label: 'Complete Blood Count' },
                  { label: 'Measles IgM' },
                ]}
                style={styles.testsCard}
              />

              <View style={styles.actionGroup}>
                <Button
                  label="Confirm Diagnosis"
                  size="lg"
                  variant="secondary"
                  leadingIcon={<Feather name="check-circle" size={18} color="#0003B8" />}
                  style={styles.confirmButton}
                  labelStyle={styles.confirmButtonLabel}
                />

                <Button
                  label="Reject Suggestion"
                  size="lg"
                  variant="surface"
                  leadingIcon={<Feather name="x-circle" size={18} color="#475569" />}
                  style={styles.rejectButton}
                  labelStyle={styles.rejectButtonLabel}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </DashboardLayout>
  );
}

export default DoctorDiagnosis;

const styles = StyleSheet.create({
  contentContainer: {
    padding: 24,
  },
  heroStrip: {
    marginBottom: 24,
    paddingHorizontal: 24,
    paddingVertical: 22,
    borderRadius: 24,
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 3, 184, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000F6B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 26,
    elevation: 4,
  },
  heroCopy: {
    flex: 1,
    paddingRight: 24,
  },
  heroEyebrow: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#0003B8',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    maxWidth: 720,
  },
  heroDescription: {
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
    maxWidth: 760,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heroBadgeDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#22C55E',
  },
  heroBadgeText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#334155',
  },
  workspace: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'stretch',
  },
  formPanel: {
    width: 340,
    flexShrink: 0,
  },
  rightColumn: {
    flex: 1,
    gap: 24,
  },
  chatCard: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: 22,
    borderColor: 'rgba(148, 163, 184, 0.24)',
    shadowColor: '#000F6B',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 5,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FCFDFF',
  },
  chatTitleGroup: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
    paddingRight: 16,
  },
  chatIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 3, 184, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatCopy: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700',
    color: '#0F172A',
  },
  chatSubtitle: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  liveBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#16A34A',
  },
  liveBadgeText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    color: '#15803D',
    textTransform: 'uppercase',
  },
  chatBody: {
    backgroundColor: '#F8FAFF',
    padding: 26,
    gap: 24,
  },
  userBubble: {
    maxWidth: 340,
    alignSelf: 'flex-end',
  },
  responseRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  assistantAvatar: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: '#0003B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#0003B8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 4,
  },
  responseStack: {
    flex: 1,
    gap: 14,
  },
  responseCard: {
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  riskRow: {
    flexDirection: 'row',
    gap: 12,
  },
  confidenceCard: {
    flex: 1,
    minHeight: 78,
  },
  riskCard: {
    flex: 1,
    minHeight: 78,
  },
  chatFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: '#FFFFFF',
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'stretch',
  },
  testsCard: {
    width: 216,
    flexShrink: 0,
  },
  actionGroup: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0003B8',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0003B8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  confirmButtonLabel: {
    color: '#0003B8',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  rejectButton: {
    flex: 1,
    minHeight: 46,
    borderWidth: 0,
    borderRadius: 16,
    backgroundColor: '#E8EEF7',
  },
  rejectButtonLabel: {
    color: '#334155',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
});
