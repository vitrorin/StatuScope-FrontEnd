import { describe, it, expect, vi, beforeEach, afterEach } from '@/__tests__/helpers/jestCompat';

// ── Mock firebase & i18n before importing ────────────────────────────────────
vi.mock('@/lib/firebase', () => ({
  firebaseAuth: { currentUser: null },
}));

vi.mock('@/i18n/language', () => ({
  getCurrentLanguage: () => 'en',
  AppLanguage: {},
}));

import {
  createDiagnosisEvaluation,
  updateDiagnosisEvaluation,
  updateDiagnosisEvaluationStatus,
  uploadDiagnosisEvaluationFile,
  getCurrentDiagnosisEvaluation,
  submitAssistantFeedback,
} from '@/lib/diagnosisEvaluation';
import type {
  UpdateDiagnosisEvaluationPayload,
  UploadDiagnosisEvaluationFilePayload,
  SubmitAssistantFeedbackPayload,
} from '@/lib/diagnosisEvaluation';

// ── Export existence ──────────────────────────────────────────────────────────
describe('diagnosisEvaluation exports', () => {
  it('exports createDiagnosisEvaluation', () => expect(typeof createDiagnosisEvaluation).toBe('function'));
  it('exports updateDiagnosisEvaluation', () => expect(typeof updateDiagnosisEvaluation).toBe('function'));
  it('exports updateDiagnosisEvaluationStatus', () => expect(typeof updateDiagnosisEvaluationStatus).toBe('function'));
  it('exports uploadDiagnosisEvaluationFile', () => expect(typeof uploadDiagnosisEvaluationFile).toBe('function'));
  it('exports getCurrentDiagnosisEvaluation', () => expect(typeof getCurrentDiagnosisEvaluation).toBe('function'));
  it('exports submitAssistantFeedback', () => expect(typeof submitAssistantFeedback).toBe('function'));
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeEvaluation = () => ({
  id: 'eval-001',
  status: 'IN_PROGRESS',
  symptomsText: 'Fever and rash',
  clinicalNotes: null,
  createdAt: '2026-01-01T00:00:00',
  updatedAt: '2026-01-01T00:00:00',
  finalizedAt: null,
  finalDiseaseId: null,
  finalDiseaseName: null,
  finalDiagnosisLabel: null,
  finalDecisionSource: null,
  doctorFeedbackNotes: null,
  patient: {
    id: 'patient-001',
    fullName: 'Juan Pérez',
    sex: 'male',
    birthDate: '1990-05-15',
    ageYears: 36,
    weightKg: 75,
    heightCm: 175,
  },
  event: null,
  recommendedTests: [],
  files: [],
});

const basePayload: UpdateDiagnosisEvaluationPayload = {
  patientFullName: 'Juan Pérez',
  birthDate: '1990-05-15',
  sex: 'male',
  symptomsText: 'Fever and rash',
};

function mockFetch(data: unknown, status = 200, ok = true) {
  return vi.fn().mockResolvedValue({
    status,
    ok,
    json: async () => data,
  });
}

// ── createDiagnosisEvaluation ─────────────────────────────────────────────────
describe('createDiagnosisEvaluation', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('calls POST /diagnosis/evaluations', async () => {
    const fetchSpy = mockFetch(makeEvaluation());
    vi.stubGlobal('fetch', fetchSpy);
    await createDiagnosisEvaluation(basePayload);
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('/diagnosis/evaluations');
    expect(fetchSpy.mock.calls[0][1].method).toBe('POST');
  });

  it('serializes all fields in the request body', async () => {
    const fetchSpy = mockFetch(makeEvaluation());
    vi.stubGlobal('fetch', fetchSpy);
    await createDiagnosisEvaluation(basePayload);
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.patientFullName).toBe('Juan Pérez');
    expect(body.birthDate).toBe('1990-05-15');
    expect(body.sex).toBe('male');
    expect(body.symptomsText).toBe('Fever and rash');
  });

  it('resolves with the created evaluation', async () => {
    const fetchSpy = mockFetch(makeEvaluation());
    vi.stubGlobal('fetch', fetchSpy);
    const result = await createDiagnosisEvaluation(basePayload);
    expect(result.id).toBe('eval-001');
    expect(result.status).toBe('IN_PROGRESS');
    expect(result.patient.fullName).toBe('Juan Pérez');
  });

  it('throws ApiError on 409 conflict', async () => {
    vi.stubGlobal('fetch', mockFetch({ code: 'CONFLICT', message: 'Already active' }, 409, false));
    await expect(createDiagnosisEvaluation(basePayload)).rejects.toThrow('Already active');
  });

  it('throws ApiError on 403 forbidden', async () => {
    vi.stubGlobal('fetch', mockFetch({ message: 'Forbidden' }, 403, false));
    await expect(createDiagnosisEvaluation(basePayload)).rejects.toThrow('Forbidden');
  });

  it('throws on network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')));
    await expect(createDiagnosisEvaluation(basePayload)).rejects.toThrow('Network failure');
  });
});

// ── updateDiagnosisEvaluation ─────────────────────────────────────────────────
describe('updateDiagnosisEvaluation', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('calls PUT /diagnosis/evaluations/:id', async () => {
    const fetchSpy = mockFetch(makeEvaluation());
    vi.stubGlobal('fetch', fetchSpy);
    await updateDiagnosisEvaluation('eval-001', basePayload);
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('/diagnosis/evaluations/eval-001');
    expect(fetchSpy.mock.calls[0][1].method).toBe('PUT');
  });

  it('serializes all fields', async () => {
    const fetchSpy = mockFetch(makeEvaluation());
    vi.stubGlobal('fetch', fetchSpy);
    await updateDiagnosisEvaluation('eval-001', basePayload);
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.symptomsText).toBe('Fever and rash');
  });

  it('uses the provided evaluationId in the URL', async () => {
    const fetchSpy = mockFetch(makeEvaluation());
    vi.stubGlobal('fetch', fetchSpy);
    await updateDiagnosisEvaluation('custom-eval-xyz', basePayload);
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('custom-eval-xyz');
  });

  it('resolves with updated evaluation', async () => {
    const updated = { ...makeEvaluation(), symptomsText: 'Updated symptoms' };
    vi.stubGlobal('fetch', mockFetch(updated));
    const result = await updateDiagnosisEvaluation('eval-001', basePayload);
    expect(result.symptomsText).toBe('Updated symptoms');
  });

  it('throws ApiError on 404', async () => {
    vi.stubGlobal('fetch', mockFetch({ message: 'Not found' }, 404, false));
    await expect(updateDiagnosisEvaluation('missing', basePayload)).rejects.toThrow('Not found');
  });
});

// ── updateDiagnosisEvaluationStatus ──────────────────────────────────────────
describe('updateDiagnosisEvaluationStatus', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('calls POST /diagnosis/evaluations/:id/status', async () => {
    const fetchSpy = mockFetch(makeEvaluation());
    vi.stubGlobal('fetch', fetchSpy);
    await updateDiagnosisEvaluationStatus('eval-001', 'CONFIRMED');
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('/diagnosis/evaluations/eval-001/status');
    expect(fetchSpy.mock.calls[0][1].method).toBe('POST');
  });

  it('sends CONFIRMED status in body', async () => {
    const fetchSpy = mockFetch(makeEvaluation());
    vi.stubGlobal('fetch', fetchSpy);
    await updateDiagnosisEvaluationStatus('eval-001', 'CONFIRMED');
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.status).toBe('CONFIRMED');
  });

  it('sends REJECTED status in body', async () => {
    const fetchSpy = mockFetch(makeEvaluation());
    vi.stubGlobal('fetch', fetchSpy);
    await updateDiagnosisEvaluationStatus('eval-001', 'REJECTED');
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.status).toBe('REJECTED');
  });

  it('sends IN_PROGRESS status in body', async () => {
    const fetchSpy = mockFetch(makeEvaluation());
    vi.stubGlobal('fetch', fetchSpy);
    await updateDiagnosisEvaluationStatus('eval-001', 'IN_PROGRESS');
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.status).toBe('IN_PROGRESS');
  });

  it('resolves with updated evaluation', async () => {
    const confirmed = { ...makeEvaluation(), status: 'CONFIRMED' };
    vi.stubGlobal('fetch', mockFetch(confirmed));
    const result = await updateDiagnosisEvaluationStatus('eval-001', 'CONFIRMED');
    expect(result.status).toBe('CONFIRMED');
  });

  it('throws on 400 invalid transition', async () => {
    vi.stubGlobal('fetch', mockFetch({ message: 'Invalid status transition' }, 400, false));
    await expect(updateDiagnosisEvaluationStatus('eval-001', 'CONFIRMED')).rejects.toThrow('Invalid status transition');
  });
});

// ── uploadDiagnosisEvaluationFile ─────────────────────────────────────────────
describe('uploadDiagnosisEvaluationFile', () => {
  afterEach(() => vi.unstubAllGlobals());

  const filePayload: UploadDiagnosisEvaluationFilePayload = {
    fileName: 'xray.jpg',
    mimeType: 'image/jpeg',
    fileSizeBytes: 204800,
    documentType: 'XRAY',
    contentBase64: 'base64encodedcontent',
  };

  it('calls POST /diagnosis/evaluations/:id/files', async () => {
    const fetchSpy = mockFetch(makeEvaluation());
    vi.stubGlobal('fetch', fetchSpy);
    await uploadDiagnosisEvaluationFile('eval-001', filePayload);
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('/diagnosis/evaluations/eval-001/files');
    expect(fetchSpy.mock.calls[0][1].method).toBe('POST');
  });

  it('serializes all file fields', async () => {
    const fetchSpy = mockFetch(makeEvaluation());
    vi.stubGlobal('fetch', fetchSpy);
    await uploadDiagnosisEvaluationFile('eval-001', filePayload);
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.fileName).toBe('xray.jpg');
    expect(body.mimeType).toBe('image/jpeg');
    expect(body.fileSizeBytes).toBe(204800);
    expect(body.documentType).toBe('XRAY');
    expect(body.contentBase64).toBe('base64encodedcontent');
  });

  it('works without optional documentType', async () => {
    const fetchSpy = mockFetch(makeEvaluation());
    vi.stubGlobal('fetch', fetchSpy);
    const payloadNoDt: UploadDiagnosisEvaluationFilePayload = {
      fileName: 'report.pdf',
      mimeType: 'application/pdf',
      fileSizeBytes: 10240,
      contentBase64: 'abc',
    };
    await uploadDiagnosisEvaluationFile('eval-001', payloadNoDt);
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.documentType).toBeUndefined();
  });

  it('resolves with evaluation containing the new file', async () => {
    const withFile = {
      ...makeEvaluation(),
      files: [{
        id: 'file-001', fileName: 'xray.jpg', mimeType: 'image/jpeg',
        storageKey: 'key/xray.jpg', fileSizeBytes: 204800, documentType: 'XRAY',
        uploadedAt: '2026-01-01T00:00:00',
      }],
    };
    vi.stubGlobal('fetch', mockFetch(withFile));
    const result = await uploadDiagnosisEvaluationFile('eval-001', filePayload);
    expect(result.files).toHaveLength(1);
    expect(result.files[0].fileName).toBe('xray.jpg');
  });

  it('throws on 413 payload too large', async () => {
    vi.stubGlobal('fetch', mockFetch({ message: 'Payload Too Large' }, 413, false));
    await expect(uploadDiagnosisEvaluationFile('eval-001', filePayload)).rejects.toThrow('Payload Too Large');
  });
});

// ── getCurrentDiagnosisEvaluation ─────────────────────────────────────────────
describe('getCurrentDiagnosisEvaluation', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('calls GET /diagnosis/evaluations/current', async () => {
    const fetchSpy = mockFetch(makeEvaluation());
    vi.stubGlobal('fetch', fetchSpy);
    await getCurrentDiagnosisEvaluation();
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('/diagnosis/evaluations/current');
    const method = (fetchSpy.mock.calls[0][1]?.method ?? 'GET').toUpperCase();
    expect(method).toBe('GET');
  });

  it('resolves with current evaluation', async () => {
    vi.stubGlobal('fetch', mockFetch(makeEvaluation()));
    const result = await getCurrentDiagnosisEvaluation();
    expect(result.id).toBe('eval-001');
    expect(result.status).toBe('IN_PROGRESS');
  });

  it('throws 404 when no active evaluation', async () => {
    vi.stubGlobal('fetch', mockFetch({ message: 'No evaluation found' }, 404, false));
    await expect(getCurrentDiagnosisEvaluation()).rejects.toThrow('No evaluation found');
  });
});

// ── submitAssistantFeedback ───────────────────────────────────────────────────
describe('submitAssistantFeedback', () => {
  afterEach(() => vi.unstubAllGlobals());

  const feedbackAccepted: SubmitAssistantFeedbackPayload = {
    finalDecisionSource: 'ASSISTANT_ACCEPTED',
    finalDiagnosisLabel: 'Measles',
    doctorFeedbackNotes: 'Classic presentation',
    acceptedAssistantMessageId: 'msg-001',
    finalDiseaseId: 'disease-001',
  };

  const feedbackRejected: SubmitAssistantFeedbackPayload = {
    finalDecisionSource: 'ASSISTANT_REJECTED_DOCTOR_OVERRIDE',
    finalDiagnosisLabel: 'Dengue',
    finalDiseaseId: 'disease-002',
  };

  const feedbackDoctorOnly: SubmitAssistantFeedbackPayload = {
    finalDecisionSource: 'DOCTOR_ONLY',
    finalDiagnosisLabel: 'Influenza',
    finalDiseaseId: 'disease-003',
  };

  it('calls POST /diagnosis/evaluations/:id/assistant-feedback', async () => {
    const fetchSpy = mockFetch(makeEvaluation());
    vi.stubGlobal('fetch', fetchSpy);
    await submitAssistantFeedback('eval-001', feedbackAccepted);
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('/diagnosis/evaluations/eval-001/assistant-feedback');
    expect(fetchSpy.mock.calls[0][1].method).toBe('POST');
  });

  it('serializes ASSISTANT_ACCEPTED feedback', async () => {
    const fetchSpy = mockFetch(makeEvaluation());
    vi.stubGlobal('fetch', fetchSpy);
    await submitAssistantFeedback('eval-001', feedbackAccepted);
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.finalDecisionSource).toBe('ASSISTANT_ACCEPTED');
    expect(body.finalDiagnosisLabel).toBe('Measles');
    expect(body.acceptedAssistantMessageId).toBe('msg-001');
    expect(body.finalDiseaseId).toBe('disease-001');
  });

  it('serializes ASSISTANT_REJECTED_DOCTOR_OVERRIDE feedback', async () => {
    const fetchSpy = mockFetch(makeEvaluation());
    vi.stubGlobal('fetch', fetchSpy);
    await submitAssistantFeedback('eval-001', feedbackRejected);
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.finalDecisionSource).toBe('ASSISTANT_REJECTED_DOCTOR_OVERRIDE');
    expect(body.finalDiagnosisLabel).toBe('Dengue');
  });

  it('serializes DOCTOR_ONLY feedback', async () => {
    const fetchSpy = mockFetch(makeEvaluation());
    vi.stubGlobal('fetch', fetchSpy);
    await submitAssistantFeedback('eval-001', feedbackDoctorOnly);
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.finalDecisionSource).toBe('DOCTOR_ONLY');
  });

  it('uses the correct evaluationId in path', async () => {
    const fetchSpy = mockFetch(makeEvaluation());
    vi.stubGlobal('fetch', fetchSpy);
    await submitAssistantFeedback('custom-eval-id', feedbackDoctorOnly);
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('custom-eval-id');
  });

  it('resolves with the finalized evaluation', async () => {
    const finalized = {
      ...makeEvaluation(),
      status: 'CONFIRMED',
      finalDiagnosisLabel: 'Measles',
      finalDecisionSource: 'ASSISTANT_ACCEPTED',
    };
    vi.stubGlobal('fetch', mockFetch(finalized));
    const result = await submitAssistantFeedback('eval-001', feedbackAccepted);
    expect(result.status).toBe('CONFIRMED');
    expect(result.finalDiagnosisLabel).toBe('Measles');
    expect(result.finalDecisionSource).toBe('ASSISTANT_ACCEPTED');
  });

  it('throws ApiError on 400 when invalid decision', async () => {
    vi.stubGlobal('fetch', mockFetch({ message: 'Invalid decision source' }, 400, false));
    await expect(submitAssistantFeedback('eval-001', feedbackAccepted)).rejects.toThrow('Invalid decision source');
  });

  it('throws on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network down')));
    await expect(submitAssistantFeedback('eval-001', feedbackAccepted)).rejects.toThrow('Network down');
  });
});

// ── DiagnosisEvaluation status type values ────────────────────────────────────
describe('Evaluation status values', () => {
  it('IN_PROGRESS is valid', () => {
    const s: 'IN_PROGRESS' | 'CONFIRMED' | 'REJECTED' = 'IN_PROGRESS';
    expect(s).toBe('IN_PROGRESS');
  });
  it('CONFIRMED is valid', () => {
    const s: 'IN_PROGRESS' | 'CONFIRMED' | 'REJECTED' = 'CONFIRMED';
    expect(s).toBe('CONFIRMED');
  });
  it('REJECTED is valid', () => {
    const s: 'IN_PROGRESS' | 'CONFIRMED' | 'REJECTED' = 'REJECTED';
    expect(s).toBe('REJECTED');
  });
});
