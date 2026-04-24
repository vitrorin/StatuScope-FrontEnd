import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View } from 'react-native';
import { DiagnosisResponseCard } from '../../../components/diagnosis/DiagnosisResponseCard';

const meta = {
  title: 'Domain/Diagnosis/DiagnosisResponseCard',
  component: DiagnosisResponseCard,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
        <Story />
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof DiagnosisResponseCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Diagnosis Response Card',
    responseText: 'Based on the patient symptoms and lab results, the most likely diagnosis is Dengue Fever (90% confidence). The platelet count is within normal limits but shows a downward trend.',
  },
};

export const WithWarningBanner: Story = {
  args: {
    title: 'Diagnosis Response Card',
    responseText: 'Based on the patient symptoms and lab results, the most likely diagnosis is Dengue Fever (90% confidence). HOWEVER, the patient shows warning signs requiring immediate medical attention.',
    highlightText: 'HOWEVER',
    showWarning: true,
    warningMessage: 'Warning: Patient shows signs of severe dengue. Immediate clinical review recommended.',
  },
};

export const LongClinicalResponse: Story = {
  args: {
    title: 'Diagnosis Response Card',
    responseText: 'Primary diagnosis: Dengue Fever (85% confidence) with secondary considerations of: 1) Leptospirosis (8% confidence) - recommended if patient has conjunctival suffusion, 2) Typhoid fever (5% confidence) - consider if persistent fever beyond 5 days, 3) Malaria (2% confidence) - unlikely given travel history. Recommend CBC, liver function tests, and NS1 antigen test.',
  },
};
