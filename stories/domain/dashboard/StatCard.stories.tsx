import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View } from 'react-native';
import { StatCard } from '../../../components/dashboard/StatCard';

const meta = {
  title: 'Domain/Dashboard/StatCard',
  component: StatCard,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
        <Story />
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof StatCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ActiveCasesNearby: Story = {
  args: {
    title: 'Stat Card',
    value: '1,284',
    badge: '+2%',
    status: 'positive',
  },
};

export const FastestGrowingDisease: Story = {
  args: {
    title: 'Stat Card',
    value: 'Influenza',
    subtitle: 'Fastest Growing Disease',
    badge: '+25%',
    status: 'danger',
  },
};

export const LocalRiskLevel: Story = {
  args: {
    title: 'Stat Card',
    value: 'Moderate',
    subtitle: 'Local Risk Level',
    badge: '3 clusters',
    status: 'warning',
  },
};

export const AvailableBeds: Story = {
  args: {
    title: 'Stat Card',
    value: '142',
    subtitle: 'Available Beds',
    status: 'positive',
  },
};

export const OccupiedBedsWarning: Story = {
  args: {
    title: 'Stat Card',
    value: '89%',
    subtitle: 'Occupied Beds Warning',
    badge: 'High',
    status: 'danger',
  },
};

export const PopulationDensity: Story = {
  args: {
    title: 'Stat Card',
    value: '12,450',
    subtitle: 'Population Density',
    status: 'neutral',
  },
};

export const ImmunityRate: Story = {
  args: {
    title: 'Stat Card',
    value: '78%',
    subtitle: 'Immunity Rate',
    badge: '+5%',
    status: 'positive',
  },
};

export const EmergencyCapacity: Story = {
  args: {
    title: 'Stat Card',
    value: '12',
    subtitle: 'Emergency Capacity',
    badge: 'Critical',
    status: 'danger',
    showProgress: true,
    progressValue: 85,
    progressColor: '#EF4444',
  },
};
