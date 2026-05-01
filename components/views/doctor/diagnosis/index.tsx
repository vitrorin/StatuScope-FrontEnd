import React, { useState } from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AssistantInputBar } from '@/components/diagnosis/AssistantInputBar';
import { DiagnosisChatBubble } from '@/components/diagnosis/DiagnosisChatBubble';
import { DiagnosisResponseCard } from '@/components/diagnosis/DiagnosisResponseCard';
import { FileUploadState, PatientEvaluationForm } from '@/components/diagnosis/PatientEvaluationForm';
import { RecommendedTestsCard } from '@/components/diagnosis/RecommendedTestsCard';
import { Button } from '@/components/foundation/Button';
import { useAuth } from '@/contexts/AuthContext';
import { initialsFromName } from '@/lib/format';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CardBase } from '@/components/patterns/CardBase';
import { askAssistant, AssistantContext, AssistantMessage, PatientContext } from '@/lib/diagnosisAssistant';
import {
  DiagnosisEvaluation,
  createDiagnosisEvaluation,
  updateDiagnosisEvaluation,
  updateDiagnosisEvaluationStatus,
  uploadDiagnosisEvaluationFile,
} from '@/lib/diagnosisEvaluation';

const navigationLinks = {
  dashboard: '/dashboard/doctor',
  diagnosis: '/diagnosis',
  analytics: '/analytics',
} as const;

interface PickedDiagnosisFile {
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  contentBase64: string;
}

function formatBirthDateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) {
    return digits;
  }
  if (digits.length <= 6) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

function calculateAgeYears(birthDate: string): number | undefined {
  const parsed = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  const today = new Date();
  let age = today.getFullYear() - parsed.getFullYear();
  const monthDiff = today.getMonth() - parsed.getMonth();
  const dayDiff = today.getDate() - parsed.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }
  return age >= 0 ? age : undefined;
}

function formatCaseMeta(evaluation: DiagnosisEvaluation | null): string {
  if (!evaluation) {
    return 'New case - not saved yet';
  }

  const shortId = evaluation.id.slice(0, 8).toUpperCase();
  const startedLabel = new Date(evaluation.createdAt).toLocaleString();
  return `Case ID: #${shortId} - Started ${startedLabel}`;
}

function deriveDropzoneState(
  isUploading: boolean,
  uploadError: string | null,
  evaluation: DiagnosisEvaluation | null,
): FileUploadState {
  if (uploadError) return 'error';
  if (isUploading) return 'dragging';
  if ((evaluation?.files?.length ?? 0) > 0) return 'uploaded';
  return 'empty';
}

async function pickDiagnosisFile(): Promise<PickedDiagnosisFile | null> {
  if (typeof document === 'undefined') {
    throw new Error('File upload is currently available in the web app only.');
  }

  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png,.dcm,.dicom,application/pdf,image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== 'string') {
          reject(new Error('Unable to read the selected file.'));
          return;
        }

        const contentBase64 = reader.result.includes(',')
          ? reader.result.split(',')[1] ?? ''
          : reader.result;

        resolve({
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          fileSizeBytes: file.size,
          contentBase64,
        });
      };
      reader.onerror = () => reject(new Error('Unable to read the selected file.'));
      reader.readAsDataURL(file);
    };
    input.click();
  });
}

export function DoctorDiagnosis() {
  const router = useRouter();
  const { logout, profile } = useAuth();
  const [evaluation, setEvaluation] = useState<DiagnosisEvaluation | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientBirthDate, setPatientBirthDate] = useState('');
  const [patientSex, setPatientSex] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [assistantQuery, setAssistantQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<AssistantMessage[]>([]);
  const [contextUsed, setContextUsed] = useState<AssistantContext | null>(null);
  const [assistantError, setAssistantError] = useState<string | null>(null);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSavingEvaluation, setIsSavingEvaluation] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);

  const handleBirthDateChange = (value: string) => {
    setPatientBirthDate(formatBirthDateInput(value));
  };

  const hydrateForm = (nextEvaluation: DiagnosisEvaluation) => {
    setEvaluation(nextEvaluation);
    setPatientName(nextEvaluation.patient.fullName ?? '');
    setPatientBirthDate(nextEvaluation.patient.birthDate ?? '');
    setPatientSex(nextEvaluation.patient.sex ?? '');
    setSymptoms(nextEvaluation.symptomsText ?? '');
  };

  const buildPatientContext = (): PatientContext => {
    const parsedAge = calculateAgeYears(patientBirthDate);

    return {
      ageYears: parsedAge,
      sex: patientSex || undefined,
      symptoms: symptoms.trim() || undefined,
    };
  };

  const persistEvaluation = async (): Promise<DiagnosisEvaluation> => {
    if (!patientName.trim()) {
      throw new Error('Patient name is required.');
    }

    if (!patientBirthDate.trim()) {
      throw new Error('Birth date is required.');
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(patientBirthDate.trim())) {
      throw new Error('Birth date must use YYYY-MM-DD format.');
    }

    if (!patientSex.trim()) {
      throw new Error('Patient sex is required.');
    }

    if (!symptoms.trim()) {
      throw new Error('Symptoms are required.');
    }

    setIsSavingEvaluation(true);
    setEvaluationError(null);
    try {
      const payload = {
        patientFullName: patientName.trim(),
        birthDate: patientBirthDate.trim(),
        sex: patientSex,
        symptomsText: symptoms.trim(),
      };
      const updatedEvaluation = evaluation
        ? await updateDiagnosisEvaluation(evaluation.id, payload)
        : await createDiagnosisEvaluation(payload);
      hydrateForm(updatedEvaluation);
      return updatedEvaluation;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to save the patient evaluation.';
      setEvaluationError(message);
      throw error;
    } finally {
      setIsSavingEvaluation(false);
    }
  };

  const sendAssistantMessage = async (content: string) => {
    const userMessage = content.trim();
    if (!userMessage || isAssistantLoading) return;

    setAssistantQuery('');
    setAssistantError(null);
    setIsAssistantLoading(true);

    const updatedHistory: AssistantMessage[] = [
      ...chatHistory,
      { role: 'user' as const, content: userMessage },
    ].slice(-19);
    setChatHistory(updatedHistory);

    try {
      const response = await askAssistant({
        messages: updatedHistory,
        patientContext: buildPatientContext(),
      });
      setChatHistory([
        ...updatedHistory,
        { role: 'assistant', content: response.reply },
      ]);
      setContextUsed(response.contextUsed);
    } catch (error) {
      setAssistantError(error instanceof Error ? error.message : 'Unable to reach the diagnosis assistant.');
    } finally {
      setIsAssistantLoading(false);
    }
  };

  const handleSendPress = () => {
    void sendAssistantMessage(assistantQuery);
  };

  const handleRunAnalysisPress = async () => {
    const contextPrompt = symptoms.trim()
      ? `Evaluate this patient and suggest differential diagnoses, risk factors, and next diagnostic steps. Symptoms: ${symptoms.trim()}`
      : 'Evaluate this patient and suggest differential diagnoses, risk factors, and next diagnostic steps.';

    try {
      await persistEvaluation();
      await sendAssistantMessage(contextPrompt);
    } catch {
      return;
    }
  };

  const handleSaveDraftPress = async () => {
    try {
      await persistEvaluation();
    } catch {
      return;
    }
  };

  const handleUploadPress = async () => {
    setUploadError(null);
    try {
      const selectedFile = await pickDiagnosisFile();
      if (!selectedFile) return;

      const activeEvaluation = await persistEvaluation();
      setIsUploadingFile(true);
      const updatedEvaluation = await uploadDiagnosisEvaluationFile(activeEvaluation.id, {
        ...selectedFile,
        documentType: 'LAB_RESULT',
      });
      hydrateForm(updatedEvaluation);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Unable to upload the selected file.');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleStatusChange = async (status: 'CONFIRMED' | 'REJECTED') => {
    try {
      const activeEvaluation = await persistEvaluation();
      setIsUpdatingStatus(true);
      setEvaluationError(null);
      const updatedEvaluation = await updateDiagnosisEvaluationStatus(activeEvaluation.id, status);
      hydrateForm(updatedEvaluation);
    } catch (error) {
      setEvaluationError(
        error instanceof Error ? error.message : 'Unable to update the diagnosis status.',
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const outbreakCount = contextUsed?.outbreaks?.length ?? 0;
  const latestFile = evaluation?.files?.[0] ?? null;
  const dropzoneState = deriveDropzoneState(isUploadingFile, uploadError, evaluation);

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
            <Text style={styles.heroBadgeText}>
              {evaluation?.status ? `Status: ${evaluation.status.replace('_', ' ')}` : 'Ready to start'}
            </Text>
          </View>
        </View>

        {evaluationError ? <Text style={styles.pageErrorText}>{evaluationError}</Text> : null}

        <View style={styles.workspace}>
          <PatientEvaluationForm
            title="Patient Evaluation"
            caseMeta={formatCaseMeta(evaluation)}
            patientNameValue={patientName}
            birthDateValue={patientBirthDate}
            sexValue={patientSex}
            symptomsValue={symptoms}
            dropzoneState={dropzoneState}
            uploadedFileName={latestFile?.fileName ?? undefined}
            dropzoneError={uploadError ?? undefined}
            primaryButtonLabel={
              isAssistantLoading
                ? 'Analyzing...'
                : isSavingEvaluation
                  ? 'Saving...'
                  : 'Run AI Analysis'
            }
            primaryButtonDisabled={isAssistantLoading || isSavingEvaluation || isUpdatingStatus}
            secondaryButtonDisabled={isSavingEvaluation || isAssistantLoading || isUpdatingStatus}
            showSecondaryAction
            onPatientNameChange={setPatientName}
            onBirthDateChange={handleBirthDateChange}
            onSexChange={setPatientSex}
            onSymptomsChange={setSymptoms}
            onBrowsePress={handleUploadPress}
            onPrimaryActionPress={handleRunAnalysisPress}
            onSecondaryActionPress={handleSaveDraftPress}
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
                  <Text style={styles.liveBadgeText}>{isAssistantLoading ? 'Thinking' : 'Live Monitor'}</Text>
                </View>
              </View>

              <View style={styles.chatBody}>
                {chatHistory.length === 0 ? (
                  <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="stethoscope" size={24} color="#0003B8" />
                    <Text style={styles.emptyTitle}>Ready for patient context</Text>
                    <Text style={styles.emptyText}>
                      Run the analysis or ask a follow-up question to query the backend assistant.
                    </Text>
                  </View>
                ) : (
                  chatHistory.map((message, index) =>
                    message.role === 'user' ? (
                      <DiagnosisChatBubble
                        key={`${message.role}-${index}`}
                        sender="user"
                        message={message.content}
                        style={styles.userBubble}
                      />
                    ) : (
                      <View key={`${message.role}-${index}`} style={styles.responseRow}>
                        <View style={styles.assistantAvatar}>
                          <MaterialCommunityIcons name="robot-excited-outline" size={16} color="#FFFFFF" />
                        </View>

                        <View style={styles.responseStack}>
                          <DiagnosisResponseCard
                            responseText={message.content}
                            highlightText="HOWEVER"
                            showWarning={!!contextUsed?.regionName || outbreakCount > 0}
                            warningMessage={
                              contextUsed?.regionName
                                ? `Hospital region context: ${contextUsed.regionName} with ${outbreakCount} active outbreak signal${outbreakCount === 1 ? '' : 's'}.`
                                : outbreakCount > 0
                                  ? `Hospital region context: ${outbreakCount} active outbreak signal${outbreakCount === 1 ? '' : 's'}.`
                                  : undefined
                            }
                            style={styles.responseCard}
                          />
                        </View>
                      </View>
                    ),
                  )
                )}

                {isAssistantLoading ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color="#0003B8" />
                    <Text style={styles.loadingText}>Consulting diagnosis assistant...</Text>
                  </View>
                ) : null}

                {assistantError ? (
                  <Text style={styles.errorText}>{assistantError}</Text>
                ) : null}
              </View>

              <View style={styles.chatFooter}>
                <AssistantInputBar
                  value={assistantQuery}
                  onChangeText={setAssistantQuery}
                  onSendPress={handleSendPress}
                  disabled={isAssistantLoading}
                />
              </View>
            </CardBase>

            <View style={styles.bottomRow}>
              <RecommendedTestsCard
                title="Recommended Tests"
                tests={
                  evaluation?.recommendedTests?.length
                    ? evaluation.recommendedTests.map((test) => ({
                        label: test.testName,
                        secondaryText: test.reason ?? undefined,
                      }))
                    : [{ label: 'No recommended tests available yet.' }]
                }
                style={styles.testsCard}
              />

              <View style={styles.actionGroup}>
                <Button
                  label="Confirm Diagnosis"
                  size="lg"
                  variant="secondary"
                  leadingIcon={<Feather name="check-circle" size={18} color="#0003B8" />}
                  disabled={isAssistantLoading || isSavingEvaluation || isUpdatingStatus}
                  onPress={() => {
                    void handleStatusChange('CONFIRMED');
                  }}
                  style={styles.confirmButton}
                  labelStyle={styles.confirmButtonLabel}
                />

                <Button
                  label="Reject Suggestion"
                  size="lg"
                  variant="surface"
                  leadingIcon={<Feather name="x-circle" size={18} color="#475569" />}
                  disabled={isAssistantLoading || isSavingEvaluation || isUpdatingStatus}
                  onPress={() => {
                    void handleStatusChange('REJECTED');
                  }}
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
  pageErrorText: {
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    color: '#B91C1C',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
    paddingHorizontal: 24,
    paddingVertical: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 6,
    maxWidth: 420,
    fontSize: 14,
    lineHeight: 22,
    color: '#64748B',
    textAlign: 'center',
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
  loadingRow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  loadingText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#334155',
  },
  errorText: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    color: '#B91C1C',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
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
