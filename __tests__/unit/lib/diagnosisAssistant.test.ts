import { describe, it, expect, vi, beforeEach, afterEach } from '@/__tests__/helpers/jestCompat';

// ── Mock firebase before importing anything that touches it ──────────────────
vi.mock('@/lib/firebase', () => ({
  firebaseAuth: { currentUser: null },
}));

vi.mock('@/i18n/language', () => ({
  getCurrentLanguage: () => 'en',
  AppLanguage: {},
}));

import {
  askAssistant,
  getAssistantThread,
  translateAssistantMessages,
} from '@/lib/diagnosisAssistant';
import type {
  AssistantRequest,
  AssistantTranslationRequest,
} from '@/lib/diagnosisAssistant';

// ── Export existence ──────────────────────────────────────────────────────────
describe('diagnosisAssistant exports', () => {
  it('exports askAssistant as a function', () => {
    expect(typeof askAssistant).toBe('function');
  });
  it('exports getAssistantThread as a function', () => {
    expect(typeof getAssistantThread).toBe('function');
  });
  it('exports translateAssistantMessages as a function', () => {
    expect(typeof translateAssistantMessages).toBe('function');
  });
});

// ── askAssistant ──────────────────────────────────────────────────────────────
describe('askAssistant', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  const baseRequest: AssistantRequest = {
    evaluationId: 'eval-001',
    messages: [{ role: 'user', content: 'Patient has fever and rash' }],
    patientContext: { ageYears: 35, sex: 'female', symptoms: 'fever, rash' },
  };

  const successResponse = {
    reply: 'Consider measles given local outbreak.',
    contextUsed: { outbreaks: [], stateName: 'Nuevo Leon' },
    messageId: 'msg-001',
    suggestions: [],
  };

  beforeEach(() => {
    fetchSpy = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => successResponse,
    });
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls POST /diagnosis/assistant/messages', async () => {
    await askAssistant(baseRequest);
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('/diagnosis/assistant/messages');
    const init = fetchSpy.mock.calls[0][1];
    expect(init.method).toBe('POST');
  });

  it('serializes the request body as JSON', async () => {
    await askAssistant(baseRequest);
    const init = fetchSpy.mock.calls[0][1];
    const parsed = JSON.parse(init.body);
    expect(parsed.evaluationId).toBe('eval-001');
    expect(parsed.messages[0].content).toBe('Patient has fever and rash');
  });

  it('resolves with the assistant response', async () => {
    const result = await askAssistant(baseRequest);
    expect(result.reply).toBe('Consider measles given local outbreak.');
    expect(result.messageId).toBe('msg-001');
    expect(Array.isArray(result.suggestions)).toBe(true);
  });

  it('works without evaluationId', async () => {
    const requestNoEval: AssistantRequest = {
      messages: [{ role: 'user', content: 'Symptoms?' }],
    };
    await askAssistant(requestNoEval);
    const init = fetchSpy.mock.calls[0][1];
    const parsed = JSON.parse(init.body);
    expect(parsed.evaluationId).toBeUndefined();
  });

  it('works without patientContext', async () => {
    const requestNoCtx: AssistantRequest = {
      evaluationId: 'eval-002',
      messages: [{ role: 'user', content: 'Any outbreaks?' }],
    };
    await askAssistant(requestNoCtx);
    const init = fetchSpy.mock.calls[0][1];
    const parsed = JSON.parse(init.body);
    expect(parsed.patientContext).toBeUndefined();
  });

  it('throws ApiError on 400 response', async () => {
    fetchSpy.mockResolvedValue({
      status: 400,
      ok: false,
      json: async () => ({ code: 'INVALID', message: 'Bad request' }),
    });
    await expect(askAssistant(baseRequest)).rejects.toThrow('Bad request');
  });

  it('throws on network failure', async () => {
    fetchSpy.mockRejectedValue(new Error('Timeout'));
    await expect(askAssistant(baseRequest)).rejects.toThrow('Timeout');
  });

  it('sends Content-Type application/json header', async () => {
    await askAssistant(baseRequest);
    const init = fetchSpy.mock.calls[0][1];
    const headers = init.headers;
    // headers is a Headers object
    const contentType = headers.get ? headers.get('Content-Type') : headers['Content-Type'];
    expect(contentType).toContain('application/json');
  });

  it('sends multiple conversation turns', async () => {
    const multiTurnRequest: AssistantRequest = {
      messages: [
        { role: 'user', content: 'First question' },
        { role: 'assistant', content: 'First reply' },
        { role: 'user', content: 'Follow-up question' },
      ],
    };
    await askAssistant(multiTurnRequest);
    const init = fetchSpy.mock.calls[0][1];
    const parsed = JSON.parse(init.body);
    expect(parsed.messages).toHaveLength(3);
    expect(parsed.messages[2].role).toBe('user');
    expect(parsed.messages[2].content).toBe('Follow-up question');
  });
});

// ── getAssistantThread ────────────────────────────────────────────────────────
describe('getAssistantThread', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  const threadResponse = {
    id: 'thread-001',
    evaluationId: 'eval-001',
    createdAt: '2026-01-01T00:00:00',
    updatedAt: '2026-01-02T00:00:00',
    messages: [],
    contextUsed: null,
  };

  beforeEach(() => {
    fetchSpy = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => threadResponse,
    });
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls GET /diagnosis/assistant/evaluations/:id/thread', async () => {
    await getAssistantThread('eval-001');
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('/diagnosis/assistant/evaluations/eval-001/thread');
  });

  it('uses GET method', async () => {
    await getAssistantThread('eval-001');
    const init = fetchSpy.mock.calls[0][1];
    const method = (init?.method ?? 'GET').toUpperCase();
    expect(method).toBe('GET');
  });

  it('resolves with the thread object', async () => {
    const result = await getAssistantThread('eval-001');
    expect(result.id).toBe('thread-001');
    expect(result.evaluationId).toBe('eval-001');
    expect(Array.isArray(result.messages)).toBe(true);
  });

  it('uses the correct evaluationId in the URL', async () => {
    await getAssistantThread('my-custom-eval-id').catch(() => {});
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('my-custom-eval-id');
  });

  it('throws ApiError on 404', async () => {
    fetchSpy.mockResolvedValue({
      status: 404,
      ok: false,
      json: async () => ({ code: 'NOT_FOUND', message: 'Thread not found' }),
    });
    await expect(getAssistantThread('missing-eval')).rejects.toThrow('Thread not found');
  });

  it('throws on network error', async () => {
    fetchSpy.mockRejectedValue(new Error('Network failure'));
    await expect(getAssistantThread('eval-001')).rejects.toThrow('Network failure');
  });
});

// ── translateAssistantMessages ────────────────────────────────────────────────
describe('translateAssistantMessages', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  const request: AssistantTranslationRequest = {
    targetLanguage: 'es' as any,
    messages: [
      { clientId: 'c1', role: 'user', content: 'Hello' },
      { clientId: 'c2', role: 'assistant', content: 'World' },
    ],
  };

  const translationResponse = {
    translations: [
      { clientId: 'c1', content: 'Hola' },
      { clientId: 'c2', content: 'Mundo' },
    ],
  };

  beforeEach(() => {
    fetchSpy = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => translationResponse,
    });
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls POST /diagnosis/assistant/translations', async () => {
    await translateAssistantMessages(request);
    const url: string = fetchSpy.mock.calls[0][0];
    expect(url).toContain('/diagnosis/assistant/translations');
    const init = fetchSpy.mock.calls[0][1];
    expect(init.method).toBe('POST');
  });

  it('serializes the request body', async () => {
    await translateAssistantMessages(request);
    const init = fetchSpy.mock.calls[0][1];
    const parsed = JSON.parse(init.body);
    expect(parsed.targetLanguage).toBe('es');
    expect(parsed.messages).toHaveLength(2);
  });

  it('resolves with translation array', async () => {
    const result = await translateAssistantMessages(request);
    expect(result.translations).toHaveLength(2);
    expect(result.translations[0].clientId).toBe('c1');
    expect(result.translations[0].content).toBe('Hola');
  });

  it('handles empty messages array', async () => {
    const emptyRequest: AssistantTranslationRequest = {
      targetLanguage: 'fr' as any,
      messages: [],
    };
    fetchSpy.mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({ translations: [] }),
    });
    const result = await translateAssistantMessages(emptyRequest);
    expect(result.translations).toEqual([]);
  });

  it('throws ApiError on 500', async () => {
    fetchSpy.mockResolvedValue({
      status: 500,
      ok: false,
      json: async () => ({ message: 'Internal error' }),
    });
    await expect(translateAssistantMessages(request)).rejects.toThrow('Internal error');
  });
});

// ── Type shape validation ─────────────────────────────────────────────────────
describe('AssistantMessage type contract', () => {
  it('user message has correct role and content', () => {
    const msg = { role: 'user' as const, content: 'test' };
    expect(msg.role).toBe('user');
    expect(msg.content).toBe('test');
  });

  it('assistant message has correct role', () => {
    const msg = { role: 'assistant' as const, content: 'response' };
    expect(msg.role).toBe('assistant');
  });
});

// ── LocalityRiskLevel type values ─────────────────────────────────────────────
describe('LocalityRiskLevel values', () => {
  it('accepts HIGH', () => {
    const risk: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' = 'HIGH';
    expect(risk).toBe('HIGH');
  });
  it('accepts MEDIUM', () => {
    const risk: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' = 'MEDIUM';
    expect(risk).toBe('MEDIUM');
  });
  it('accepts LOW', () => {
    const risk: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' = 'LOW';
    expect(risk).toBe('LOW');
  });
  it('accepts NONE', () => {
    const risk: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' = 'NONE';
    expect(risk).toBe('NONE');
  });
});
