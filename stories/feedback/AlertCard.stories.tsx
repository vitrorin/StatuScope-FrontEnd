import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View } from 'react-native';
import { AlertCard } from '../../components/feedback/AlertCard';

const meta = {
  title: 'Feedback/AlertCard',
  component: AlertCard,
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
} satisfies Meta<typeof AlertCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Critical: Story = {
  args: {
    title: 'Influenza A Spike',
    description: 'Confirmed 45% increase in pediatric cases in the last 6 hours.',
    variant: 'critical',
  },
};

export const Warning: Story = {
  args: {
    title: 'Dengue Risk Alert',
    description: '7 suspected dengue cases reported within a 3 km radius today.',
    variant: 'warning',
  },
};

export const Info: Story = {
  args: {
    title: 'Vaccine Supply Update',
    description: 'New shipment of booster doses arrived in Pharmacy Unit B.',
    variant: 'info',
  },
};

export const Neutral: Story = {
  args: {
    title: 'System Maintenance',
    description: 'Scheduled maintenance window: Sunday 2AM - 6AM EST.',
    variant: 'neutral',
  },
};