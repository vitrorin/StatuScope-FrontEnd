import { api } from './api';

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

export interface PatientContext {
  ageYears?: number;
  sex?: string;
  symptoms?: string;
}

export interface OutbreakSummary {
  diseaseName: string;
  caseCount: number;
  startedAt: string;
}

export interface AssistantContext {
  regionName: string | null;
  outbreaks: OutbreakSummary[];
}

export interface AssistantRequest {
  evaluationId?: string;
  messages: AssistantMessage[];
  patientContext?: PatientContext;
}

export interface AssistantResponse {
  reply: string;
  contextUsed: AssistantContext;
}

export interface AssistantThread {
  id: string;
  evaluationId: string;
  createdAt: string;
  updatedAt: string;
  messages: AssistantMessage[];
  contextUsed: AssistantContext | null;
}

export async function askAssistant(body: AssistantRequest): Promise<AssistantResponse> {
  return api<AssistantResponse>('/diagnosis/assistant/messages', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getAssistantThread(evaluationId: string): Promise<AssistantThread> {
  return api<AssistantThread>(`/diagnosis/assistant/evaluations/${evaluationId}/thread`);
}
