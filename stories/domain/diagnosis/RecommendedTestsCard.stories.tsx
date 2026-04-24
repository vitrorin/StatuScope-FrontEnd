import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View } from 'react-native';
import { RecommendedTestsCard } from '../../../components/diagnosis/RecommendedTestsCard';

const meta = {
  title: 'Domain/Diagnosis/RecommendedTestsCard',
  component: RecommendedTestsCard,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
        <Story />
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof RecommendedTestsCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SingleTest: Story = {
  args: {
    title: 'Recommended Tests Card',
    tests: [
      { label: 'Complete Blood Count (CBC)' },
    ],
  },
};

export const MultipleTests: Story = {
  args: {
    title: 'Recommended Tests Card',
    tests: [
      { label: 'Complete Blood Count (CBC)' },
      { label: 'Dengue NS1 Antigen' },
      { label: 'Liver Function Test' },
    ],
  },
};

export const WithSecondaryText: Story = {
  args: {
    title: 'Recommended Tests Card',
    tests: [
      { label: 'Complete Blood Count (CBC)', secondaryText: 'Priority: High' },
      { label: 'Dengue NS1 Antigen', secondaryText: 'Priority: High' },
      { label: 'Liver Function Test', secondaryText: 'Priority: Medium' },
    ],
  },
};
