import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View } from 'react-native';
import { ProgressMetricRow } from '../../components/dashboard/ProgressMetricRow';

const meta = {
  title: 'Patterns/ProgressMetricRow',
  component: ProgressMetricRow,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
        <View style={{ maxWidth: 400 }}>
          <Story />
        </View>
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof ProgressMetricRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ShortBar: Story = {
  args: {
    label: 'Measles',
    valueText: '124 cases',
    progress: 25,
  },
};

export const MediumBar: Story = {
  args: {
    label: 'Dengue',
    valueText: '89 cases',
    progress: 50,
  },
};

export const LongBar: Story = {
  args: {
    label: 'Influenza',
    valueText: '312 cases',
    progress: 75,
  },
};

export const CriticalColor: Story = {
  args: {
    label: 'COVID-like illness',
    valueText: '245 cases',
    progress: 85,
    barColor: '#EF4444',
  },
};

export const NeutralColor: Story = {
  args: {
    label: 'Pertussis',
    valueText: '12 cases',
    progress: 10,
    barColor: '#9CA3AF',
  },
};
