import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View } from 'react-native';
import { RangeSelector } from '../../components/dashboard/RangeSelector';

const meta = {
  title: 'Dashboard/RangeSelector',
  component: RangeSelector,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
        <Story />
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof RangeSelector>;

export default meta;

type Story = StoryObj<typeof meta>;

const rangeOptions = [
  { label: '1km', value: '1' },
  { label: '5km', value: '5' },
  { label: '10km', value: '10' },
];

export const OneKm: Story = {
  args: {
    options: rangeOptions,
    value: '1',
    label: 'RADAR RANGE:',
  },
};

export const FiveKm: Story = {
  args: {
    options: rangeOptions,
    value: '5',
    label: 'RADAR RANGE:',
  },
};

export const TenKm: Story = {
  args: {
    options: rangeOptions,
    value: '10',
    label: 'RADAR RANGE:',
  },
};