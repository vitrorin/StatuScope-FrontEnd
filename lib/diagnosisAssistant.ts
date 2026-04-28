import { api } from './api';

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface PatientContext {
  ageYears?: number;
  sex?: string;
  postalCode?: string;
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
  messages: AssistantMessage[];
  patientContext?: PatientContext;
}

export interface AssistantResponse {
  reply: string;
  contextUsed: AssistantContext;
}

export async function askAssistant(body: AssistantRequest): Promise<AssistantResponse> {
  return api<AssistantResponse>('/diagnosis/assistant/messages', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
