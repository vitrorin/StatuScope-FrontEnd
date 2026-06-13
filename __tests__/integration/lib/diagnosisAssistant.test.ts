/**
 * Integration tests for lib/diagnosisAssistant.ts
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
  askAssistant,
  getAssistantThread,
  translateAssistantMessages,
  type AssistantRequest,
  type AssistantResponse,
  type AssistantThread,
  type AssistantTranslationRequest,
  type AssistantTranslationResponse,
} from '@/lib/diagnosisAssistant';

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

const BASE = 'http://localhost:8080';

const ASSISTANT_REQUEST: AssistantRequest = {
  messages: [{ role: 'user', content: 'Patient has high fever and rash.' }],
};

const ASSISTANT_RESPONSE: AssistantResponse = {
  reply: 'Consider dengue or measles based on the symptoms.',
  contextUsed: {
    stateName: 'Nuevo León',
    outbreaks: [
      { diseaseName: 'Dengue', caseCount: 22, startedAt: '2026-05-01T00:00:00Z' },
    ],
  },
  messageId: 'msg-001',
  suggestions: [],
};

const THREAD: AssistantThread = {
  id: 'thread-001',
  evaluationId: 'eval-001',
  createdAt: '2026-05-31T00:00:00Z',
  updatedAt: '2026-05-31T12:00:00Z',
  messages: [
    { role: 'user', content: 'First question.' },
    { role: 'assistant', content: 'First answer.' },
  ],
  contextUsed: null,
};

const TRANSLATION_REQUEST: AssistantTranslationRequest = {
  targetLanguage: 'es',
  messages: [
    { clientId: 'c1', role: 'assistant', content: 'Consider dengue.' },
    { clientId: 'c2', role: 'assistant', content: 'Monitor blood count.' },
  ],
};

const TRANSLATION_RESPONSE: AssistantTranslationResponse = {
  translations: [
    { clientId: 'c1', content: 'Considere dengue.' },
    { clientId: 'c2', content: 'Monitorear el recuento sanguíneo.' },
  ],
};

// ── askAssistant ──────────────────────────────────────────────────────────────

describe('askAssistant', () => {
  it('calls POST /diagnosis/assistant/messages', async () => {
    const spy = mockFetch(ASSISTANT_RESPONSE);
    await askAssistant(ASSISTANT_REQUEST);
    expect(spy).toHaveBeenCalledOnce();
    const [url] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/diagnosis/assistant/messages');
  });

  it('uses POST method', async () => {
    const spy = mockFetch(ASSISTANT_RESPONSE);
    await askAssistant(ASSISTANT_REQUEST);
    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(init?.method).toBe('POST');
  });

  it('serializes the request body as JSON', async () => {
    const spy = mockFetch(ASSISTANT_RESPONSE);
    await askAssistant(ASSISTANT_REQUEST);
    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init?.body as string)).toMatchObject({
      messages: [{ role: 'user', content: 'Patient has high fever and rash.' }],
    });
  });

  it('includes evaluationId in the body when provided', async () => {
    const spy = mockFetch(ASSISTANT_RESPONSE);
    await askAssistant({ ...ASSISTANT_REQUEST, evaluationId: 'eval-abc' });
    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init?.body as string).evaluationId).toBe('eval-abc');
  });

  it('includes patientContext in the body when provided', async () => {
    const spy = mockFetch(ASSISTANT_RESPONSE);
    const ctx = { ageYears: 7, sex: 'female', symptoms: 'Fever' };
    await askAssistant({ ...ASSISTANT_REQUEST, patientContext: ctx });
    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init?.body as string).patientContext).toMatchObject(ctx);
  });

  it('returns the assistant response unchanged', async () => {
    mockFetch(ASSISTANT_RESPONSE);
    const result = await askAssistant(ASSISTANT_REQUEST);
    expect(result).toMatchObject({
      reply: ASSISTANT_RESPONSE.reply,
      contextUsed: expect.objectContaining({ stateName: 'Nuevo León' }),
    });
  });

  it('sets Authorization header with the Firebase token', async () => {
    const spy = mockFetch(ASSISTANT_RESPONSE);
    await askAssistant(ASSISTANT_REQUEST);
    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init?.headers);
    expect(headers.get('Authorization')).toBe('Bearer mock-jwt-token');
  });

  it('throws on non-2xx status', async () => {
    mockFetch({ error: 'Unauthorized' }, 401);
    await expect(askAssistant(ASSISTANT_REQUEST)).rejects.toThrow();
  });

  it('sends Content-Type application/json', async () => {
    const spy = mockFetch(ASSISTANT_RESPONSE);
    await askAssistant(ASSISTANT_REQUEST);
    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init?.headers);
    expect(headers.get('Content-Type')).toBe('application/json');
  });
});

// ── getAssistantThread ────────────────────────────────────────────────────────

describe('getAssistantThread', () => {
  it('calls GET /diagnosis/assistant/evaluations/{id}/thread', async () => {
    const spy = mockFetch(THREAD);
    await getAssistantThread('eval-001');
    const [url] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/diagnosis/assistant/evaluations/eval-001/thread');
  });

  it('uses GET method (no method override)', async () => {
    const spy = mockFetch(THREAD);
    await getAssistantThread('eval-001');
    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(init?.method ?? 'GET').toBe('GET');
  });

  it('interpolates evaluationId into the URL correctly', async () => {
    const spy = mockFetch(THREAD);
    await getAssistantThread('eval-xyz-999');
    const [url] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('eval-xyz-999');
  });

  it('returns the thread with messages', async () => {
    mockFetch(THREAD);
    const result = await getAssistantThread('eval-001');
    expect(result.id).toBe('thread-001');
    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].role).toBe('user');
    expect(result.messages[1].role).toBe('assistant');
  });

  it('throws on 404', async () => {
    mockFetch({ error: 'Not found' }, 404);
    await expect(getAssistantThread('nonexistent')).rejects.toThrow();
  });
});

// ── translateAssistantMessages ────────────────────────────────────────────────

describe('translateAssistantMessages', () => {
  it('calls POST /diagnosis/assistant/translations', async () => {
    const spy = mockFetch(TRANSLATION_RESPONSE);
    await translateAssistantMessages(TRANSLATION_REQUEST);
    const [url] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/diagnosis/assistant/translations');
  });

  it('uses POST method', async () => {
    const spy = mockFetch(TRANSLATION_RESPONSE);
    await translateAssistantMessages(TRANSLATION_REQUEST);
    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(init?.method).toBe('POST');
  });

  it('serializes targetLanguage and messages in the body', async () => {
    const spy = mockFetch(TRANSLATION_RESPONSE);
    await translateAssistantMessages(TRANSLATION_REQUEST);
    const [, init] = spy.mock.calls[0] as [string, RequestInit];
    const parsed = JSON.parse(init?.body as string);
    expect(parsed.targetLanguage).toBe('es');
    expect(parsed.messages).toHaveLength(2);
    expect(parsed.messages[0].clientId).toBe('c1');
  });

  it('returns translations array with correct clientIds', async () => {
    mockFetch(TRANSLATION_RESPONSE);
    const result = await translateAssistantMessages(TRANSLATION_REQUEST);
    expect(result.translations).toHaveLength(2);
    expect(result.translations[0].clientId).toBe('c1');
    expect(result.translations[1].clientId).toBe('c2');
  });

  it('returns translated content for each message', async () => {
    mockFetch(TRANSLATION_RESPONSE);
    const result = await translateAssistantMessages(TRANSLATION_REQUEST);
    expect(result.translations[0].content).toBe('Considere dengue.');
    expect(result.translations[1].content).toBe('Monitorear el recuento sanguíneo.');
  });

  it('throws on non-2xx status', async () => {
    mockFetch({ error: 'Forbidden' }, 403);
    await expect(translateAssistantMessages(TRANSLATION_REQUEST)).rejects.toThrow();
  });
});
