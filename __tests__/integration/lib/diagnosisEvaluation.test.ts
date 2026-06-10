/**
 * Integration tests for lib/diagnosisEvaluation.ts
 *
 * Strategy:
 *  - Mock `firebaseAuth` so no real Firebase connection is needed.
 *  - Mock global `fetch` so no real HTTP calls are made.
 *  - Verify the correct endpoint, method, body, and response handling.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from '@/__tests__/helpers/jestCompat';

vi.mock('@/lib/firebase', () => ({
  firebaseApp: {},
  firebaseAuth: {
    currentUser: {
      getIdToken: async () => 'mock-jwt-token',
    },
    signOut: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/i18n/language', () => ({
  getCurrentLanguage: () => 'en',
}));

import {
  createDiagnosisEvaluation,
  updateDiagnosisEvaluation,
  updateDiagnosisEvaluationStatus,
  uploadDiagnosisEvaluationFile,
  getCurrentDiagnosisEvaluation,
  submitAssistantFeedback,
  type DiagnosisEvaluation,
  type UpdateDiagnosisEvaluationPayload,
  type UploadDiagnosisEvaluationFilePayload,
  type SubmitAssistantFeedbackPayload,
} from '@/lib/diagnosisEvaluation';

// ── Fetch mock helpers ────────────────────────────────────────────────────────

function mockFetch(body: unknown, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.restoreAllMocks());

// ── Test data ─────────────────────────────────────────────────────────────────

const EVAL_ID = 'eval-abc-123';

const EVALUATION: DiagnosisEvaluation = {
  id: EVAL_ID,
  status: 'IN_PROGRESS',
  symptomsText: 'Fever and cough.',
  clinicalNotes: null,
  createdAt: '2026-05-31T00:00:00Z',
  updatedAt: '2026-05-31T01:00:00Z',
  finalizedAt: null,
  finalDiseaseId: null,
  finalDiseaseName: null,
  finalDiagnosisLabel: null,
  finalDecisionSource: null,
  doctorFeedbackNotes: null,
  patient: {
    id: 'pat-001',
    fullName: 'Ana García',
    sex: 'female',
    birthDate: '2015-03-12',
    ageYears: 11,
    weightKg: 38.5,
    heightCm: 148.0,
  },
  event: {
    id: 'event-001',
    diseaseName: 'COVID-19',
    diseaseCode: 'COVID19',
    status: 'ACTIVE',
    startedAt: '2026-05-31T00:00:00Z',
  },
  recommendedTests: [],
  files: [],
};

const UPDATE_PAYLOAD: UpdateDiagnosisEvaluationPayload = {
  patientFullName: 'Ana García',
  birthDate: '2015-03-12',
  sex: 'female',
  symptomsText: 'Fever and cough.',
};

const UPLOAD_PAYLOAD: UploadDiagnosisEvaluationFilePayload = {
  fileName: 'lab-panel.pdf',
  mimeType: 'application/pdf',
  fileSizeBytes: 2048,
  documentType: 'LAB_RESULT',
  contentBase64: 'dGVzdA==',
};

// ── createDiagnosisEvaluation ─────────────────────────────────────────────────

describe('createDiagnosisEvaluation', () => {
  it('calls POST /diagnosis/evaluations', async () => {
    const spy = mockFetch(EVALUATION);
    await createDiagnosisEvaluation(UPDATE_PAYLOAD);
    const [url] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/diagnosis/evaluations');
  });

  it('uses POST method', async () => {
    const spy = mockFetch(EVALUATION);
    await createDiagnosisEvaluation(UPDATE_PAYLOAD);
    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(init?.method).toBe('POST');
  });

  it('serializes the payload as JSON', async () => {
    const spy = mockFetch(EVALUATION);
    await createDiagnosisEvaluation(UPDATE_PAYLOAD);
    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init?.body as string)).toMatchObject(UPDATE_PAYLOAD);
  });

  it('returns the created evaluation', async () => {
    mockFetch(EVALUATION);
    const result = await createDiagnosisEvaluation(UPDATE_PAYLOAD);
    expect(result.id).toBe(EVAL_ID);
    expect(result.status).toBe('IN_PROGRESS');
    expect(result.patient.fullName).toBe('Ana García');
  });

  it('throws on server error', async () => {
    mockFetch({ message: 'Conflict' }, 409);
    await expect(createDiagnosisEvaluation(UPDATE_PAYLOAD)).rejects.toThrow();
  });
});

// ── updateDiagnosisEvaluation ─────────────────────────────────────────────────

describe('updateDiagnosisEvaluation', () => {
  it('calls PUT /diagnosis/evaluations/{id}', async () => {
    const spy = mockFetch(EVALUATION);
    await updateDiagnosisEvaluation(EVAL_ID, UPDATE_PAYLOAD);
    const [url] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain(`/diagnosis/evaluations/${EVAL_ID}`);
  });

  it('uses PUT method', async () => {
    const spy = mockFetch(EVALUATION);
    await updateDiagnosisEvaluation(EVAL_ID, UPDATE_PAYLOAD);
    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(init?.method).toBe('PUT');
  });

  it('interpolates the evaluationId correctly', async () => {
    const spy = mockFetch(EVALUATION);
    await updateDiagnosisEvaluation('custom-id-456', UPDATE_PAYLOAD);
    const [url] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('custom-id-456');
  });

  it('serializes the payload as JSON', async () => {
    const spy = mockFetch(EVALUATION);
    await updateDiagnosisEvaluation(EVAL_ID, UPDATE_PAYLOAD);
    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init?.body as string).symptomsText).toBe('Fever and cough.');
  });

  it('returns the updated evaluation', async () => {
    const updated = { ...EVALUATION, symptomsText: 'Persistent fever and fatigue.' };
    mockFetch(updated);
    const result = await updateDiagnosisEvaluation(EVAL_ID, UPDATE_PAYLOAD);
    expect(result.symptomsText).toBe('Persistent fever and fatigue.');
  });

  it('throws on 404', async () => {
    mockFetch({ error: 'Not found' }, 404);
    await expect(updateDiagnosisEvaluation('nonexistent', UPDATE_PAYLOAD)).rejects.toThrow();
  });
});

// ── updateDiagnosisEvaluationStatus ──────────────────────────────────────────

describe('updateDiagnosisEvaluationStatus', () => {
  it('calls POST /diagnosis/evaluations/{id}/status', async () => {
    const spy = mockFetch(EVALUATION);
    await updateDiagnosisEvaluationStatus(EVAL_ID, 'CONFIRMED');
    const [url] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain(`/diagnosis/evaluations/${EVAL_ID}/status`);
  });

  it('uses POST method', async () => {
    const spy = mockFetch(EVALUATION);
    await updateDiagnosisEvaluationStatus(EVAL_ID, 'CONFIRMED');
    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(init?.method).toBe('POST');
  });

  it('sends status CONFIRMED in the body', async () => {
    const spy = mockFetch(EVALUATION);
    await updateDiagnosisEvaluationStatus(EVAL_ID, 'CONFIRMED');
    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init?.body as string)).toEqual({ status: 'CONFIRMED' });
  });

  it('sends status REJECTED in the body', async () => {
    const spy = mockFetch(EVALUATION);
    await updateDiagnosisEvaluationStatus(EVAL_ID, 'REJECTED');
    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init?.body as string)).toEqual({ status: 'REJECTED' });
  });

  it('sends status IN_PROGRESS in the body', async () => {
    const spy = mockFetch(EVALUATION);
    await updateDiagnosisEvaluationStatus(EVAL_ID, 'IN_PROGRESS');
    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init?.body as string)).toEqual({ status: 'IN_PROGRESS' });
  });

  it('returns the evaluation with updated status', async () => {
    mockFetch({ ...EVALUATION, status: 'CONFIRMED', finalizedAt: '2026-05-31T10:00:00Z' });
    const result = await updateDiagnosisEvaluationStatus(EVAL_ID, 'CONFIRMED');
    expect(result.status).toBe('CONFIRMED');
    expect(result.finalizedAt).not.toBeNull();
  });

  it('throws on error', async () => {
    mockFetch({ error: 'Bad request' }, 400);
    await expect(updateDiagnosisEvaluationStatus(EVAL_ID, 'CONFIRMED')).rejects.toThrow();
  });
});

// ── getCurrentDiagnosisEvaluation ─────────────────────────────────────────────

describe('getCurrentDiagnosisEvaluation', () => {
  it('calls GET /diagnosis/evaluations/current', async () => {
    const spy = mockFetch(EVALUATION);
    await getCurrentDiagnosisEvaluation();
    const [url] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/diagnosis/evaluations/current');
  });

  it('uses GET method (no method override)', async () => {
    const spy = mockFetch(EVALUATION);
    await getCurrentDiagnosisEvaluation();
    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(init?.method ?? 'GET').toBe('GET');
  });

  it('returns the current evaluation with patient data', async () => {
    mockFetch(EVALUATION);
    const result = await getCurrentDiagnosisEvaluation();
    expect(result.id).toBe(EVAL_ID);
    expect(result.patient.ageYears).toBe(11);
    expect(result.event?.diseaseName).toBe('COVID-19');
  });

  it('throws on 404 when no current evaluation exists', async () => {
    mockFetch({ error: 'Not found' }, 404);
    await expect(getCurrentDiagnosisEvaluation()).rejects.toThrow();
  });
});

// ── uploadDiagnosisEvaluationFile ─────────────────────────────────────────────

describe('uploadDiagnosisEvaluationFile', () => {
  it('calls POST /diagnosis/evaluations/{id}/files', async () => {
    const spy = mockFetch(EVALUATION);
    await uploadDiagnosisEvaluationFile(EVAL_ID, UPLOAD_PAYLOAD);
    const [url] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain(`/diagnosis/evaluations/${EVAL_ID}/files`);
  });

  it('uses POST method', async () => {
    const spy = mockFetch(EVALUATION);
    await uploadDiagnosisEvaluationFile(EVAL_ID, UPLOAD_PAYLOAD);
    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(init?.method).toBe('POST');
  });

  it('serializes file metadata in the body', async () => {
    const spy = mockFetch(EVALUATION);
    await uploadDiagnosisEvaluationFile(EVAL_ID, UPLOAD_PAYLOAD);
    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    const parsed = JSON.parse(init?.body as string);
    expect(parsed.fileName).toBe('lab-panel.pdf');
    expect(parsed.mimeType).toBe('application/pdf');
    expect(parsed.contentBase64).toBe('dGVzdA==');
  });

  it('returns the updated evaluation', async () => {
    const withFile = {
      ...EVALUATION,
      files: [{ id: 'file-001', fileName: 'lab-panel.pdf', mimeType: 'application/pdf', storageKey: 'test/lab.pdf', fileSizeBytes: 2048, documentType: 'LAB_RESULT', uploadedAt: '2026-05-31T00:00:00Z' }],
    };
    mockFetch(withFile);
    const result = await uploadDiagnosisEvaluationFile(EVAL_ID, UPLOAD_PAYLOAD);
    expect(result.files).toHaveLength(1);
    expect(result.files[0].fileName).toBe('lab-panel.pdf');
  });

  it('throws on error', async () => {
    mockFetch({ error: 'Payload too large' }, 413);
    await expect(uploadDiagnosisEvaluationFile(EVAL_ID, UPLOAD_PAYLOAD)).rejects.toThrow();
  });
});

// ── submitAssistantFeedback ───────────────────────────────────────────────────

describe('submitAssistantFeedback', () => {
  const FEEDBACK: SubmitAssistantFeedbackPayload = {
    finalDecisionSource: 'ASSISTANT_ACCEPTED',
    finalDiseaseId: 'disease-001',
    doctorFeedbackNotes: 'Confirmed after review.',
  };

  it('calls POST /diagnosis/evaluations/{id}/assistant-feedback', async () => {
    const spy = mockFetch(EVALUATION);
    await submitAssistantFeedback(EVAL_ID, FEEDBACK);
    const [url] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain(`/diagnosis/evaluations/${EVAL_ID}/assistant-feedback`);
  });

  it('uses POST method', async () => {
    const spy = mockFetch(EVALUATION);
    await submitAssistantFeedback(EVAL_ID, FEEDBACK);
    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(init?.method).toBe('POST');
  });

  it('serializes finalDecisionSource in the body', async () => {
    const spy = mockFetch(EVALUATION);
    await submitAssistantFeedback(EVAL_ID, FEEDBACK);
    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init?.body as string).finalDecisionSource).toBe('ASSISTANT_ACCEPTED');
  });

  it('serializes finalDiseaseId in the body', async () => {
    const spy = mockFetch(EVALUATION);
    await submitAssistantFeedback(EVAL_ID, FEEDBACK);
    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init?.body as string).finalDiseaseId).toBe('disease-001');
  });

  it('serializes DOCTOR_ONLY source correctly', async () => {
    const spy = mockFetch(EVALUATION);
    await submitAssistantFeedback(EVAL_ID, { ...FEEDBACK, finalDecisionSource: 'DOCTOR_ONLY' });
    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init?.body as string).finalDecisionSource).toBe('DOCTOR_ONLY');
  });

  it('returns the evaluation after feedback', async () => {
    const confirmed = {
      ...EVALUATION,
      status: 'CONFIRMED',
      finalDecisionSource: 'ASSISTANT_ACCEPTED',
      finalDiseaseId: 'disease-001',
      finalDiseaseName: 'COVID-19',
    };
    mockFetch(confirmed);
    const result = await submitAssistantFeedback(EVAL_ID, FEEDBACK);
    expect(result.finalDecisionSource).toBe('ASSISTANT_ACCEPTED');
    expect(result.finalDiseaseName).toBe('COVID-19');
  });

  it('throws on error', async () => {
    mockFetch({ error: 'Not found' }, 404);
    await expect(submitAssistantFeedback('nonexistent', FEEDBACK)).rejects.toThrow();
  });
});
