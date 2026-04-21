import type { Meta, StoryObj } from '@storybook/react';
import { StatCard } from '../../components/dashboard/StatCard';

const meta = {
  title: 'Dashboard/StatCard',
  component: StatCard,
  decorators: [(Story) => <div className="p-6 bg-[#F5F7FB] min-h-screen"><Story /></div>],
  tags: ['autodocs'],
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ActiveCasesNearby: Story = {
  args: { title: 'Active Cases Nearby', value: '1,284', badge: '+2%', status: 'positive' },
};

export const FastestGrowingDisease: Story = {
  args: {
    title: 'Fastest Growing Disease',
    value: 'Influenza',
    subtitle: 'Projected increase for next 48h',
    badge: '+25%',
    status: 'danger',
  },
};

export const LocalRiskLevel: Story = {
  args: {
    title: 'Local Risk Level',
    value: 'Moderate',
    subtitle: '3 active clusters detected',
    badge: '3 clusters',
    status: 'warning',
  },
};

export const AvailableBeds: Story = {
  args: { title: 'Available Beds', value: '142', subtitle: '24.5% of total capacity', status: 'positive' },
};

export const OccupiedBedsWarning: Story = {
  args: {
    title: 'Occupied Beds',
    value: '89%',
    subtitle: '436 of 490 beds occupied',
    badge: 'High',
    status: 'danger',
  },
};

export const PopulationDensity: Story = {
  args: { title: 'Population Density', value: '12,450', subtitle: 'per sq km', status: 'neutral' },
};

export const ImmunityRate: Story = {
  args: {
    title: 'Immunity Rate',
    value: '78%',
    subtitle: 'Above national average',
    badge: '+5%',
    status: 'positive',
  },
};

export const EmergencyCapacity: Story = {
  args: {
    title: 'Emergency Capacity',
    value: '12',
    subtitle: 'ICU beds available',
    badge: 'Critical',
    status: 'danger',
    showProgress: true,
    progressValue: 85,
    progressColor: '#EF4444',
  },
};
