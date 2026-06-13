const suggestions = [
  { id: 'sug-dengue', displayName: 'Dengue', rankOrder: 1, confidence: 0.86, rationale: 'Symptoms and locality risk strongly match current dengue activity.', localityRiskLevel: 'HIGH', primary: true },
  { id: 'sug-flu', displayName: 'Influenza', rankOrder: 2, confidence: 0.42, rationale: 'Fever and fatigue overlap with respiratory infections.', localityRiskLevel: 'MEDIUM', primary: false },
];

const messages = [
  { id: 'msg-user', clientId: 'msg-user', role: 'user', content: 'Patient has fever, headache and joint pain.', createdAt: '2026-06-10T10:05:00.000Z' },
  { id: 'msg-assistant', clientId: 'msg-assistant', role: 'assistant', content: 'Dengue should be prioritized. Consider CBC and NS1 antigen testing.', createdAt: '2026-06-10T10:06:00.000Z', suggestions },
];

export async function askAssistant() {
  return {
    reply: 'Dengue is the leading suggestion based on symptoms and local outbreak data. Request CBC and NS1 antigen testing.',
    contextUsed: {
      stateName: 'Yucatan',
      regionName: 'Merida',
      outbreaks: [{ diseaseName: 'Dengue', municipalityName: 'Merida', stateName: 'Yucatan', caseCount: 42, startedAt: '2026-06-01' }],
    },
    messageId: 'msg-assistant-new',
    suggestions,
  };
}

export async function getAssistantThread() {
  return {
    id: 'thread-storybook',
    evaluationId: 'eval-storybook',
    createdAt: '2026-06-10T10:00:00.000Z',
    updatedAt: '2026-06-10T10:06:00.000Z',
    messages,
    contextUsed: {
      stateName: 'Yucatan',
      regionName: 'Merida',
      outbreaks: [{ diseaseName: 'Dengue', municipalityName: 'Merida', stateName: 'Yucatan', caseCount: 42, startedAt: '2026-06-01' }],
    },
  };
}

export async function translateAssistantMessages(body: { messages: Array<{ clientId: string; content: string }> }) {
  return {
    translations: body.messages.map((message) => ({
      clientId: message.clientId,
      content: message.content,
    })),
  };
}
