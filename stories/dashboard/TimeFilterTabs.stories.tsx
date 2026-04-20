import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View } from 'react-native';
import { TimeFilterTabs } from '../../components/dashboard/TimeFilterTabs';

const meta = {
  title: 'Dashboard/TimeFilterTabs',
  component: TimeFilterTabs,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
        <Story />
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof TimeFilterTabs>;

export default meta;

type Story = StoryObj<typeof meta>;

const timeOptions = [
  { label: 'Last 24 Hours', value: '24h' },
  { label: 'Last 72 Hours', value: '72h' },
  { label: 'Last Week', value: '1w' },
];

export const Last24Hours: Story = {
  args: {
    options: timeOptions,
    value: '24h',
  },
};

export const Last72Hours: Story = {
  args: {
    options: timeOptions,
    value: '72h',
  },
};

export const LastWeek: Story = {
  args: {
    options: timeOptions,
    value: '1w',
  },
};