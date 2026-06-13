const evaluation = {
  id: 'eval-storybook',
  status: 'IN_PROGRESS',
  symptomsText: 'High fever, headache, joint pain and fatigue for three days.',
  clinicalNotes: 'Patient lives near an active dengue cluster.',
  createdAt: '2026-06-10T10:00:00.000Z',
  updatedAt: '2026-06-10T11:00:00.000Z',
  finalizedAt: null,
  finalDiseaseId: null,
  finalDiseaseName: null,
  finalDiagnosisLabel: null,
  finalDecisionSource: null,
  doctorFeedbackNotes: null,
  patient: {
    id: 'patient-storybook',
    fullName: 'Sofia Herrera',
    sex: 'FEMALE',
    birthDate: '1993-04-18',
    ageYears: 33,
    weightKg: 62,
    heightCm: 165,
  },
  event: {
    id: 'event-dengue',
    diseaseName: 'Dengue',
    diseaseCode: 'A90',
    status: 'ACTIVE',
    startedAt: '2026-06-01',
  },
  recommendedTests: [
    { id: 'test-cbc', testName: 'Complete blood count', reason: 'Check platelet count.', source: 'assistant', sortOrder: 1 },
    { id: 'test-ns1', testName: 'Dengue NS1 antigen', reason: 'Confirm acute infection.', source: 'assistant', sortOrder: 2 },
  ],
  files: [
    { id: 'file-1', fileName: 'triage-notes.pdf', mimeType: 'application/pdf', storageKey: 'storybook/triage-notes.pdf', fileSizeBytes: 128000, documentType: 'Clinical note', uploadedAt: '2026-06-10T10:20:00.000Z' },
  ],
};

export async function createDiagnosisEvaluation() { return evaluation; }
export async function updateDiagnosisEvaluation() { return evaluation; }
export async function updateDiagnosisEvaluationStatus() { return { ...evaluation, status: 'CONFIRMED' }; }
export async function uploadDiagnosisEvaluationFile() { return evaluation; }
export async function getCurrentDiagnosisEvaluation() { return evaluation; }
export async function submitAssistantFeedback() { return { ...evaluation, status: 'CONFIRMED', finalDiagnosisLabel: 'Dengue' }; }
