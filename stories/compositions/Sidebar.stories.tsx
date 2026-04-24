import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View } from 'react-native';
import { Sidebar } from '../../components/Sidebar';

const meta = {
  title: 'Compositions/Sidebar',
  component: Sidebar,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <Story />
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Sidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DashboardActive: Story = {
  args: {
    active: 'dashboard',
  },
};

export const DiagnosisActive: Story = {
  args: {
    active: 'diagnosis',
  },
};

export const AnalyticsActive: Story = {
  args: {
    active: 'analytics',
  },
};
