import type { Meta, StoryObj } from '@storybook/react';
import { MiniMetricCard } from '../../components/dashboard/MiniMetricCard';

const meta = {
  title: 'Dashboard/MiniMetricCard',
  component: MiniMetricCard,
  decorators: [(Story) => <div className="p-6 bg-[#F5F7FB] min-h-screen flex flex-wrap gap-4"><Story /></div>],
  tags: ['autodocs'],
} satisfies Meta<typeof MiniMetricCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PopulationDensity: Story = {
  args: { label: 'Population Density', value: '12,450', supportingText: 'per sq km' },
};

export const FacilityCapacity: Story = {
  args: { label: 'Facility Capacity', value: '87%', supportingText: 'beds occupied', trend: '+3%', trendType: 'warning' },
};

export const ImmunityRatePositive: Story = {
  args: { label: 'Immunity Rate', value: '78%', supportingText: 'above average', trend: '+5%', trendType: 'positive' },
};

export const RiskIndex: Story = {
  args: { label: 'Risk Index', value: '6.8', supportingText: 'moderate level', trend: 'Stable', trendType: 'neutral' },
};

export const Administrators: Story = {
  args: { label: 'Administrators', value: '24', supportingText: 'active accounts' },
};

export const MedicalStaff: Story = {
  args: { label: 'Medical Staff', value: '156', supportingText: 'doctors & nurses', trend: '+12', trendType: 'positive' },
};

export const InactiveSuspended: Story = {
  args: { label: 'Inactive / Suspended', value: '8', supportingText: 'accounts', trend: '-2', trendType: 'positive' },
};
