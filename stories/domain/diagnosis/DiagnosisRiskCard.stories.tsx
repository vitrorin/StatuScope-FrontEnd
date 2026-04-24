import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View } from 'react-native';
import { DiagnosisRiskCard } from '../../../components/diagnosis/DiagnosisRiskCard';

const meta = {
  title: 'Domain/Diagnosis/DiagnosisRiskCard',
  component: DiagnosisRiskCard,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
        <Story />
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof DiagnosisRiskCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Critical: Story = {
  args: {
    title: 'Diagnosis Risk Card',
    subtitle: 'Critical',
    statusText: 'ALERT',
    variant: 'critical',
  },
};

export const Warning: Story = {
  args: {
    title: 'Diagnosis Risk Card',
    subtitle: 'Warning',
    statusText: 'WARNING',
    variant: 'warning',
  },
};

export const Info: Story = {
  args: {
    title: 'Diagnosis Risk Card',
    subtitle: 'Info',
    statusText: 'MONITOR',
    variant: 'info',
  },
};
