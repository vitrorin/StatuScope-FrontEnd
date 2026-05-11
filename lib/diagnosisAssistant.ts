import { api } from './api';

export type LocalityRiskLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export interface AssistantSuggestion {
  id?: string;
  messageId?: string;
  diseaseId?: string | null;
  displayName: string;
  rankOrder: number;
  confidence?: number | null;
  rationale?: string | null;
  localityRiskLevel?: LocalityRiskLevel | null;
  primary: boolean;
}

export interface AssistantMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
  suggestions?: AssistantSuggestion[];
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
  messageId?: string | null;
  suggestions?: AssistantSuggestion[];
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
