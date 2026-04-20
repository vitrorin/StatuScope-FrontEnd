import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View } from 'react-native';
import { MiniBarChartCard } from '../../components/dashboard/MiniBarChartCard';

const meta = {
  title: 'Dashboard/MiniBarChartCard',
  component: MiniBarChartCard,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
        <View style={{ maxWidth: 360 }}>
          <Story />
        </View>
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof MiniBarChartCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WeeklyCases: Story = {
  args: {
    title: 'Case Analytics',
    subtitle: 'Weekly distribution',
    bars: [
      { label: 'Mon', value: 45 },
      { label: 'Tue', value: 62 },
      { label: 'Wed', value: 58 },
      { label: 'Thu', value: 71 },
      { label: 'Fri', value: 55 },
      { label: 'Sat', value: 38 },
      { label: 'Sun', value: 29 },
    ],
    listItems: [
      { label: 'Total this week', value: '358' },
      { label: 'Daily average', value: '51' },
    ],
    buttonLabel: 'View Details',
  },
};

export const HighPeak: Story = {
  args: {
    title: 'Case Analytics',
    subtitle: 'Weekly distribution',
    bars: [
      { label: 'Mon', value: 120 },
      { label: 'Tue', value: 185 },
      { label: 'Wed', value: 210 },
      { label: 'Thu', value: 195 },
      { label: 'Fri', value: 165 },
      { label: 'Sat', value: 90 },
      { label: 'Sun', value: 65 },
    ],
    listItems: [
      { label: 'Peak day', value: 'Wednesday' },
      { label: 'Total cases', value: '1,030' },
    ],
    buttonLabel: 'View Details',
  },
};

export const BalancedDistribution: Story = {
  args: {
    title: 'Case Analytics',
    subtitle: 'Weekly distribution',
    bars: [
      { label: 'Mon', value: 50, active: true },
      { label: 'Tue', value: 55 },
      { label: 'Wed', value: 48 },
      { label: 'Thu', value: 52 },
      { label: 'Fri', value: 58 },
      { label: 'Sat', value: 45 },
      { label: 'Sun', value: 42 },
    ],
    listItems: [
      { label: 'Total this week', value: '350' },
      { label: 'vs last week', value: '-12%', valueColor: '#22C55E' },
    ],
    buttonLabel: 'View Details',
  },
};