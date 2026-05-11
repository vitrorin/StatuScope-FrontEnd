import React, { useEffect, useState } from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, LayoutChangeEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AssistantInputBar } from '@/components/diagnosis/AssistantInputBar';
import { AssistantSuggestionsList } from '@/components/diagnosis/AssistantSuggestionsList';
import { DiagnosisChatBubble } from '@/components/diagnosis/DiagnosisChatBubble';
import { DiagnosisResponseCard } from '@/components/diagnosis/DiagnosisResponseCard';
import { FileUploadState, PatientEvaluationForm } from '@/components/diagnosis/PatientEvaluationForm';
import { RecommendedTestsCard } from '@/components/diagnosis/RecommendedTestsCard';
import { Button } from '@/components/foundation/Button';
import { useAuth } from '@/contexts/AuthContext';
import { initialsFromName } from '@/lib/format';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CardBase } from '@/components/patterns/CardBase';
import { ApiError } from '@/lib/api';
import {
  askAssistant,
  AssistantContext,
  AssistantMessage,
  getAssistantThread,
  PatientContext,
} from '@/lib/diagnosisAssistant';
import {
  AssistantFeedbackDecision,
  DiagnosisEvaluation,
  createDiagnosisEvaluation,
  getCurrentDiagnosisEvaluation,
  submitAssistantFeedback,
  updateDiagnosisEvaluation,
  uploadDiagnosisEvaluationFile,
} from '@/lib/diagnosisEvaluation';
import { InputField } from '@/components/inputs/InputField';
import { TextareaField } from '@/components/inputs/TextareaField';
import { DiagnosisDiseaseOption, searchDiagnosisDiseases } from '@/lib/diagnosisDiseases';

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

function formatOutbreakContextMessage(context: AssistantContext | null): string | undefined {
  const outbreaks = context?.outbreaks ?? [];
  const stateName = context?.stateName ?? context?.regionName;
  const regionLabel = stateName ? `Hospital state context: ${stateName}.` : 'Hospital state context.';

  if (outbreaks.length === 0) {
    return stateName ? `${regionLabel} No active outbreak signals matched this case.` : undefined;
  }

  const casesByDisease = new Map<string, number>();
  outbreaks.forEach((outbreak) => {
    const current = casesByDisease.get(outbreak.diseaseName) ?? 0;
    casesByDisease.set(outbreak.diseaseName, current + outbreak.caseCount);
  });

  const rankedDiseases = [...casesByDisease.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([diseaseName, caseCount]) => `${diseaseName} (${caseCount})`);

  const totalCases = [...casesByDisease.values()].reduce((sum, caseCount) => sum + caseCount, 0);
  const diseaseCount = casesByDisease.size;
  const summaryLabel = diseaseCount === 1 ? '1 disease signal' : `${diseaseCount} disease signals`;
  const headline = `${regionLabel} ${summaryLabel} covering ${totalCases} reported cases.`;
  const topDiseasesLabel = rankedDiseases.length > 0
    ? ` Highest activity: ${rankedDiseases.join(', ')}.`
    : '';

  return `${headline}${topDiseasesLabel}`;
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

function findLatestAssistantMessage(messages: AssistantMessage[]): AssistantMessage | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index]?.role === 'assistant') {
      return messages[index] ?? null;
    }
  }
  return null;
}

function hasUnreviewedSuggestion(messages: AssistantMessage[]): boolean {
  return !!findLatestAssistantMessage(messages)?.suggestions?.length;
}

function formatSuggestionConfidence(confidence?: number | null): string | null {
  if (confidence == null || Number.isNaN(confidence)) {
    return null;
  }
  return `${Math.round(confidence * 100)}%`;
}

function formatFeedbackStatus(decision: string | null | undefined): string | null {
  if (!decision) return null;
  if (decision === 'ASSISTANT_ACCEPTED') return 'AI diagnosis confirmed';
  if (decision === 'ASSISTANT_REJECTED_DOCTOR_OVERRIDE') return 'AI diagnosis overridden';
  if (decision === 'DOCTOR_ONLY') return 'Doctor diagnosis saved';
  return null;
}

export function DoctorDiagnosis() {
  const router = useRouter();
  const { logout, profile } = useAuth();
  const [evaluation, setEvaluation] = useState<DiagnosisEvaluation | null>(null);
  const [formPanelHeight, setFormPanelHeight] = useState<number | null>(null);
  const [isFinalizeExpanded, setIsFinalizeExpanded] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientBirthDate, setPatientBirthDate] = useState('');
  const [patientSex, setPatientSex] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [assistantQuery, setAssistantQuery] = useState('');
  const [diseaseSearchQuery, setDiseaseSearchQuery] = useState('');
  const [diseaseOptions, setDiseaseOptions] = useState<DiagnosisDiseaseOption[]>([]);
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<string>('');
  const [selectedDiseaseName, setSelectedDiseaseName] = useState('');
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [chatHistory, setChatHistory] = useState<AssistantMessage[]>([]);
  const [contextUsed, setContextUsed] = useState<AssistantContext | null>(null);
  const [assistantError, setAssistantError] = useState<string | null>(null);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [isSavingEvaluation, setIsSavingEvaluation] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);

  useEffect(() => {
    let isActive = true;

    const hydrateExistingSession = async () => {
      try {
        const currentEvaluation = await getCurrentDiagnosisEvaluation();
        if (!isActive) return;

        setEvaluation(currentEvaluation);
        setPatientName(currentEvaluation.patient.fullName ?? '');
        setPatientBirthDate(currentEvaluation.patient.birthDate ?? '');
        setPatientSex(currentEvaluation.patient.sex ?? '');
        setSymptoms(currentEvaluation.symptomsText ?? '');

        try {
          const thread = await getAssistantThread(currentEvaluation.id);
          if (!isActive) return;

          setChatHistory(
            thread.messages
              .filter(
                (message): message is AssistantMessage =>
                  message.role === 'user' || message.role === 'assistant',
              )
              .map((message) => ({
                id: message.id,
                role: message.role,
                content: message.content,
                suggestions: message.suggestions ?? [],
              })),
          );
          setContextUsed(thread.contextUsed);
        } catch (error) {
          if (error instanceof ApiError && error.status === 404) {
            return;
          }
          if (!isActive) return;
          setAssistantError(
            error instanceof Error ? error.message : 'Unable to load the saved assistant thread.',
          );
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return;
        }
        if (!isActive) return;
        setEvaluationError(
          error instanceof Error ? error.message : 'Unable to restore the active diagnosis evaluation.',
        );
      }
    };

    void hydrateExistingSession();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadDiseaseOptions = async () => {
      try {
        const options = await searchDiagnosisDiseases(diseaseSearchQuery, 8);
        if (!isActive) return;
        setDiseaseOptions(options);
      } catch (error) {
        if (!isActive) return;
        setFeedbackError(error instanceof Error ? error.message : 'Unable to load diseases.');
      }
    };

    void loadDiseaseOptions();

    return () => {
      isActive = false;
    };
  }, [diseaseSearchQuery]);

  useEffect(() => {
    if (!evaluation?.finalDiseaseId || selectedDiseaseId) {
      return;
    }
    setSelectedDiseaseId(evaluation.finalDiseaseId);
    setSelectedDiseaseName(evaluation.finalDiseaseName ?? evaluation.finalDiagnosisLabel ?? '');
    setDiseaseSearchQuery(evaluation.finalDiseaseName ?? evaluation.finalDiagnosisLabel ?? '');
    setFeedbackNotes(evaluation.doctorFeedbackNotes ?? '');
  }, [
    evaluation?.doctorFeedbackNotes,
    evaluation?.finalDiagnosisLabel,
    evaluation?.finalDiseaseId,
    evaluation?.finalDiseaseName,
    selectedDiseaseId,
  ]);

  useEffect(() => {
    const latestAssistantMessage = findLatestAssistantMessage(chatHistory);
    const primarySuggestion = latestAssistantMessage?.suggestions?.find((suggestion) => suggestion.primary)
      ?? latestAssistantMessage?.suggestions?.[0];

    if (!primarySuggestion?.diseaseId || selectedDiseaseId) {
      return;
    }

    setSelectedDiseaseId(primarySuggestion.diseaseId);
    setSelectedDiseaseName(primarySuggestion.displayName);
    setDiseaseSearchQuery(primarySuggestion.displayName);
  }, [chatHistory, selectedDiseaseId]);

  useEffect(() => {
    if (evaluation?.finalDecisionSource || hasUnreviewedSuggestion(chatHistory)) {
      setIsFinalizeExpanded(true);
    }
  }, [evaluation?.finalDecisionSource, chatHistory]);

  const handleBirthDateChange = (value: string) => {
    setPatientBirthDate(formatBirthDateInput(value));
  };

  const hydrateForm = (nextEvaluation: DiagnosisEvaluation) => {
    setEvaluation(nextEvaluation);
    setPatientName(nextEvaluation.patient.fullName ?? '');
    setPatientBirthDate(nextEvaluation.patient.birthDate ?? '');
    setPatientSex(nextEvaluation.patient.sex ?? '');
    setSymptoms(nextEvaluation.symptomsText ?? '');
    if (nextEvaluation.finalDiseaseId) {
      setSelectedDiseaseId(nextEvaluation.finalDiseaseId);
      setSelectedDiseaseName(nextEvaluation.finalDiseaseName ?? nextEvaluation.finalDiagnosisLabel ?? '');
      setDiseaseSearchQuery(nextEvaluation.finalDiseaseName ?? nextEvaluation.finalDiagnosisLabel ?? '');
    }
    if (nextEvaluation.doctorFeedbackNotes != null) {
      setFeedbackNotes(nextEvaluation.doctorFeedbackNotes);
    }
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

  const sendAssistantMessage = async (
    content: string,
    activeEvaluationOverride?: DiagnosisEvaluation,
  ) => {
    const userMessage = content.trim();
    if (!userMessage || isAssistantLoading) return;

    let activeEvaluation: DiagnosisEvaluation;
    try {
      activeEvaluation = activeEvaluationOverride ?? evaluation ?? (await persistEvaluation());
    } catch {
      return;
    }

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
        evaluationId: activeEvaluation.id,
        messages: [{ role: 'user', content: userMessage }],
        patientContext: buildPatientContext(),
      });
      setChatHistory([
        ...updatedHistory,
        {
          id: response.messageId ?? undefined,
          role: 'assistant',
          content: response.reply,
          suggestions: response.suggestions ?? [],
        },
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
      const activeEvaluation = await persistEvaluation();
      await sendAssistantMessage(contextPrompt, activeEvaluation);
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

  const handleSelectDisease = (option: DiagnosisDiseaseOption) => {
    setSelectedDiseaseId(option.id);
    setSelectedDiseaseName(option.name);
    setDiseaseSearchQuery(option.name);
    setFeedbackError(null);
    setFeedbackSuccess(null);
  };

  const handleSubmitFeedback = async (decision: AssistantFeedbackDecision) => {
    if (!selectedDiseaseId) {
      setFeedbackError('Select a normalized disease from the database before finalizing.');
      setFeedbackSuccess(null);
      return;
    }

    try {
      const activeEvaluation = await persistEvaluation();
      const latestAssistantMessage = findLatestAssistantMessage(chatHistory);
      setIsSubmittingFeedback(true);
      setFeedbackError(null);
      setFeedbackSuccess(null);
      const updatedEvaluation = await submitAssistantFeedback(activeEvaluation.id, {
        finalDecisionSource: decision,
        finalDiseaseId: selectedDiseaseId,
        doctorFeedbackNotes: feedbackNotes.trim() || undefined,
        acceptedAssistantMessageId:
          decision === 'ASSISTANT_ACCEPTED' ? latestAssistantMessage?.id : undefined,
      });
      hydrateForm(updatedEvaluation);
      setFeedbackSuccess(
        decision === 'ASSISTANT_ACCEPTED'
          ? 'Diagnosis confirmed and saved.'
          : decision === 'ASSISTANT_REJECTED_DOCTOR_OVERRIDE'
            ? 'Diagnosis override saved.'
            : 'Final diagnosis saved.',
      );
    } catch (error) {
      setFeedbackError(
        error instanceof Error ? error.message : 'Unable to record diagnosis feedback.',
      );
      setFeedbackSuccess(null);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const outbreakWarningMessage = formatOutbreakContextMessage(contextUsed);
  const latestFile = evaluation?.files?.[0] ?? null;
  const dropzoneState = deriveDropzoneState(isUploadingFile, uploadError, evaluation);
  const boundedChatHeight = formPanelHeight ?? 520;
  const latestAssistantMessage = findLatestAssistantMessage(chatHistory);
  const hasAssistantRecommendation = !!latestAssistantMessage;
  const primarySuggestion = latestAssistantMessage?.suggestions?.find((suggestion) => suggestion.primary)
    ?? latestAssistantMessage?.suggestions?.[0];
  const suggestionConfidence = formatSuggestionConfidence(primarySuggestion?.confidence);
  const feedbackStatusLabel = formatFeedbackStatus(evaluation?.finalDecisionSource);

  const handleFormPanelLayout = (event: LayoutChangeEvent) => {
    const nextHeight = Math.round(event.nativeEvent.layout.height);
    setFormPanelHeight((currentHeight) => (currentHeight === nextHeight ? currentHeight : nextHeight));
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
      <ScrollView contentContainerStyle={styles.pageScrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
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
            <View style={styles.formPanelWrap} onLayout={handleFormPanelLayout}>
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
                primaryButtonDisabled={isAssistantLoading || isSavingEvaluation}
                secondaryButtonDisabled={isSavingEvaluation || isAssistantLoading}
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
            </View>

            <View style={styles.rightColumn}>
              <CardBase style={[styles.chatCard, { height: boundedChatHeight }]}>
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

                  {isAssistantLoading ? (
                    <View style={styles.liveBadge}>
                      <View style={styles.liveBadgeDot} />
                      <Text style={styles.liveBadgeText}>Thinking</Text>
                    </View>
                  ) : null}
                </View>

                <ScrollView
                  style={styles.chatBody}
                  contentContainerStyle={styles.chatBodyContent}
                  showsVerticalScrollIndicator={false}
                >
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
                              showWarning={!!outbreakWarningMessage}
                              warningMessage={outbreakWarningMessage}
                              style={styles.responseCard}
                            />
                            {message.suggestions?.length ? (
                              <AssistantSuggestionsList suggestions={message.suggestions} />
                            ) : null}

                            {index === chatHistory.length - 1 && evaluation?.recommendedTests?.length ? (
                              <RecommendedTestsCard
                                title="Recommended Tests"
                                tests={evaluation.recommendedTests.map((test) => ({
                                  label: test.testName,
                                  secondaryText: test.reason ?? undefined,
                                }))}
                                style={styles.testsCard}
                              />
                            ) : null}
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
                </ScrollView>

                <View style={styles.chatFooter}>
                  <AssistantInputBar
                    value={assistantQuery}
                    onChangeText={setAssistantQuery}
                    onSendPress={handleSendPress}
                    disabled={isAssistantLoading}
                  />

                  <View style={styles.finalizeSection}>
                    <TouchableOpacity
                      style={styles.finalizeHeader}
                      activeOpacity={0.82}
                      onPress={() => setIsFinalizeExpanded((current) => !current)}
                    >
                      <View style={styles.finalizeHeaderCopy}>
                        <Text style={styles.finalizeTitle}>Finalize Diagnosis</Text>
                        <Text style={styles.finalizeSubtitle}>
                          Select a catalog disease, then confirm or override the assistant.
                        </Text>
                      </View>

                      <View style={styles.finalizeHeaderMeta}>
                        {feedbackStatusLabel ? (
                          <View style={styles.feedbackStatusChip}>
                            <Text style={styles.feedbackStatusChipText}>{feedbackStatusLabel}</Text>
                          </View>
                        ) : null}
                        {evaluation?.finalDiseaseName ? (
                          <View style={styles.finalizedBadge}>
                            <Text style={styles.finalizedBadgeText}>{evaluation.finalDiseaseName}</Text>
                          </View>
                        ) : null}
                        <View style={styles.finalizeChevronWrap}>
                          <Feather
                            name={isFinalizeExpanded ? 'chevron-up' : 'chevron-down'}
                            size={16}
                            color="#64748B"
                          />
                        </View>
                      </View>
                    </TouchableOpacity>

                    {isFinalizeExpanded ? (
                      <>
                        {primarySuggestion ? (
                          <View style={styles.suggestionSummaryCard}>
                            <Text style={styles.suggestionSummaryEyebrow}>Current AI recommendation</Text>
                            <View style={styles.suggestionSummaryRow}>
                              <Text style={styles.suggestionSummaryName}>{primarySuggestion.displayName}</Text>
                              {suggestionConfidence ? (
                                <Text style={styles.suggestionSummaryConfidence}>{suggestionConfidence}</Text>
                              ) : null}
                            </View>
                            <Text style={styles.suggestionSummaryMeta}>
                              Locality risk: {primarySuggestion.localityRiskLevel ?? 'Unknown'}
                            </Text>
                            {primarySuggestion.rationale ? (
                              <Text style={styles.suggestionSummaryRationale}>
                                {primarySuggestion.rationale}
                              </Text>
                            ) : null}
                          </View>
                        ) : null}

                        <InputField
                          placeholder="Search disease catalog..."
                          value={diseaseSearchQuery}
                          onChangeText={setDiseaseSearchQuery}
                          leftIcon={<Feather name="search" size={16} color="#64748B" />}
                          style={styles.diseaseSearchField}
                        />

                        {selectedDiseaseName ? (
                          <View style={styles.selectedDiseasePill}>
                            <Text style={styles.selectedDiseaseLabel}>Selected disease</Text>
                            <Text style={styles.selectedDiseaseValue}>{selectedDiseaseName}</Text>
                          </View>
                        ) : null}

                        {diseaseOptions.length ? (
                          <View style={styles.diseaseResultsList}>
                            {diseaseOptions.slice(0, 4).map((option, index, visibleOptions) => (
                              <TouchableOpacity
                                key={option.id}
                                style={[
                                  styles.diseaseResultRow,
                                  index === visibleOptions.length - 1 && styles.diseaseResultRowLast,
                                  option.id === selectedDiseaseId && styles.diseaseResultRowSelected,
                                ]}
                                activeOpacity={0.8}
                                onPress={() => handleSelectDisease(option)}
                              >
                                <View style={styles.diseaseResultCopy}>
                                  <Text style={styles.diseaseResultName}>{option.name}</Text>
                                  <Text style={styles.diseaseResultCode}>{option.code}</Text>
                                </View>
                                {option.id === selectedDiseaseId ? (
                                  <Feather name="check-circle" size={16} color="#0003B8" />
                                ) : null}
                              </TouchableOpacity>
                            ))}
                          </View>
                        ) : null}

                        <TextareaField
                          placeholder="Optional note about why this diagnosis was confirmed or overridden..."
                          value={feedbackNotes}
                          onChangeText={(value) => {
                            setFeedbackNotes(value);
                            setFeedbackSuccess(null);
                          }}
                          numberOfLines={2}
                          style={styles.feedbackNotesField}
                        />

                        {isSubmittingFeedback ? (
                          <View style={styles.feedbackInfoBanner}>
                            <ActivityIndicator size="small" color="#0003B8" />
                            <Text style={styles.feedbackInfoText}>Saving diagnosis feedback...</Text>
                          </View>
                        ) : null}

                        {feedbackSuccess ? (
                          <View style={styles.feedbackSuccessBanner}>
                            <Feather name="check-circle" size={16} color="#166534" />
                            <Text style={styles.feedbackSuccessText}>{feedbackSuccess}</Text>
                          </View>
                        ) : null}

                        {feedbackError ? <Text style={styles.errorText}>{feedbackError}</Text> : null}

                        <View style={styles.finalizeActions}>
                          {hasAssistantRecommendation ? (
                            <>
                              <Button
                                label={isSubmittingFeedback ? 'Saving...' : 'Confirm AI Diagnosis'}
                                size="md"
                                variant="secondary"
                                disabled={isSubmittingFeedback || isAssistantLoading || isSavingEvaluation}
                                onPress={() => {
                                  void handleSubmitFeedback('ASSISTANT_ACCEPTED');
                                }}
                                style={styles.confirmButton}
                                labelStyle={styles.confirmButtonLabel}
                              />
                              <Button
                                label={isSubmittingFeedback ? 'Saving...' : 'Override AI Diagnosis'}
                                size="md"
                                variant="surface"
                                disabled={isSubmittingFeedback || isAssistantLoading || isSavingEvaluation}
                                onPress={() => {
                                  void handleSubmitFeedback('ASSISTANT_REJECTED_DOCTOR_OVERRIDE');
                                }}
                                style={styles.rejectButton}
                                labelStyle={styles.rejectButtonLabel}
                              />
                            </>
                          ) : (
                            <Button
                              label={isSubmittingFeedback ? 'Saving...' : 'Save Final Diagnosis'}
                              size="md"
                              variant="primary"
                              disabled={isSubmittingFeedback || isAssistantLoading || isSavingEvaluation}
                              onPress={() => {
                                void handleSubmitFeedback('DOCTOR_ONLY');
                              }}
                              style={styles.doctorOnlyButton}
                            />
                          )}
                        </View>
                      </>
                    ) : null}
                  </View>
                </View>
              </CardBase>
            </View>
          </View>
        </View>
      </ScrollView>
    </DashboardLayout>
  );
}

export default DoctorDiagnosis;

const styles = StyleSheet.create({
  pageScrollContent: {
    paddingBottom: 32,
  },
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
  formPanelWrap: {
    width: 340,
    flexShrink: 0,
  },
  formPanel: {
    width: '100%',
  },
  rightColumn: {
    flex: 1,
    minHeight: 0,
  },
  chatCard: {
    flex: 1,
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
    flex: 1,
    minHeight: 0,
    backgroundColor: '#F8FAFF',
  },
  chatBodyContent: {
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
    gap: 14,
  },
  testsCard: {
    width: '100%',
  },
  finalizeSection: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 14,
  },
  finalizeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  finalizeHeaderCopy: {
    flex: 1,
  },
  finalizeHeaderMeta: {
    alignItems: 'flex-end',
    gap: 8,
  },
  finalizeTitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  finalizeSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
    maxWidth: 560,
  },
  finalizeChevronWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackStatusChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#DCFCE7',
  },
  feedbackStatusChipText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#166534',
  },
  finalizedBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
  },
  finalizedBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#0003B8',
  },
  diseaseSearchField: {
    marginBottom: 12,
  },
  suggestionSummaryCard: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#DCE6F5',
  },
  suggestionSummaryEyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#0003B8',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  suggestionSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  suggestionSummaryName: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  suggestionSummaryConfidence: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: '#0003B8',
  },
  suggestionSummaryMeta: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
    color: '#475569',
    fontWeight: '600',
  },
  suggestionSummaryRationale: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: '#334155',
  },
  selectedDiseasePill: {
    alignSelf: 'flex-start',
    gap: 2,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#DCE6F5',
  },
  selectedDiseaseLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  selectedDiseaseValue: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  diseaseResultsList: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    maxHeight: 216,
  },
  diseaseResultRow: {
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  diseaseResultRowLast: {
    borderBottomWidth: 0,
  },
  diseaseResultRowSelected: {
    backgroundColor: '#EEF2FF',
  },
  diseaseResultCopy: {
    flex: 1,
  },
  diseaseResultName: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  diseaseResultCode: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: '#64748B',
  },
  feedbackNotesField: {
    marginBottom: 0,
  },
  feedbackInfoBanner: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  feedbackInfoText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  feedbackSuccessBanner: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  feedbackSuccessText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#166534',
  },
  finalizeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#0003B8',
    backgroundColor: '#FFFFFF',
  },
  confirmButtonLabel: {
    color: '#0003B8',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  rejectButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: '#E8EEF7',
    borderWidth: 0,
  },
  rejectButtonLabel: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  doctorOnlyButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: '#0003B8',
    borderColor: '#0003B8',
  },
});
