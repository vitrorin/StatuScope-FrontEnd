import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { AppColors } from '@/constants/theme';
import { AssistantSuggestionsList } from '@/components/diagnosis/AssistantSuggestionsList';

const suggestions = [
  {
    id: 'suggestion_1',
    displayName: 'Dengue fever',
    rankOrder: 1,
    confidence: 0.86,
    rationale: 'High fever, headache, and locality outbreak data increase the estimated probability.',
    localityRiskLevel: 'HIGH' as const,
    primary: true,
  },
  {
    id: 'suggestion_2',
    displayName: 'Influenza',
    rankOrder: 2,
    confidence: 0.48,
    rationale: 'Respiratory symptoms overlap with current seasonal activity.',
    localityRiskLevel: 'MEDIUM' as const,
    primary: false,
  },
  {
    id: 'suggestion_3',
    displayName: 'Viral gastroenteritis',
    rankOrder: 3,
    confidence: 0.22,
    rationale: 'Lower confidence differential based on reported nausea and fatigue.',
    localityRiskLevel: 'LOW' as const,
    primary: false,
  },
];

const localizedRiskLabels: Record<string, string> = {
  HIGH: 'Alto',
  MEDIUM: 'Medio',
  LOW: 'Bajo',
  NONE: 'Ninguno',
};

const meta = {
  title: 'Componentes únicos/Diagnosis/AssistantSuggestionsList',
  component: AssistantSuggestionsList,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}>
        <View style={{ maxWidth: 720 }}>
          <Story />
        </View>
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof AssistantSuggestionsList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { suggestions },
};

export const LocalizedLabels: Story = {
  args: {
    suggestions,
    heading: 'Sugerencias diferenciales',
    primaryLabel: 'principal',
    localityRiskLabel: 'Riesgo local',
    formatRiskLevel: (riskLevel) => localizedRiskLabels[riskLevel ?? 'NONE'] ?? localizedRiskLabels.NONE,
  },
};

export const Empty: Story = {
  args: { suggestions: [] },
};
