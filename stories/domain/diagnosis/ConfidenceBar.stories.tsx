import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View } from 'react-native';
import { ConfidenceBar } from '../../../components/diagnosis/ConfidenceBar';

const meta = {
  title: 'Domain/Diagnosis/ConfidenceBar',
  component: ConfidenceBar,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
        <Story />
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof ConfidenceBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EightyFivePercent: Story = {
  args: {
    label: 'DENGUE',
    value: 85,
  },
};

export const HighConfidence: Story = {
  args: {
    label: 'INFLUENZA',
    value: 92,
    valueText: '92%',
  },
};

export const LowConfidence: Story = {
  args: {
    label: 'LEPTOSPIROSIS',
    value: 34,
    valueText: '34%',
  },
};

export const CustomColor: Story = {
  args: {
    label: 'TYPHOID',
    value: 67,
    valueText: '67%',
    color: '#F59E0B',
  },
};
