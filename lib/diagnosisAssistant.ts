import { api } from './api';

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface PatientContext {
  ageYears?: number;
  sex?: string;
  symptoms?: string;
}

export interface OutbreakSummary {
  diseaseName: string;
  municipalityName?: string | null;
  cityName?: string | null;
  stateName?: string | null;
  regionName?: string | null;
  caseCount: number;
  startedAt: string;
}

export interface AssistantContext {
  stateName?: string | null;
  regionName?: string | null;
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
