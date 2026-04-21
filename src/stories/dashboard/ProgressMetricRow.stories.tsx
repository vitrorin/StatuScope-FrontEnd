import type { Meta, StoryObj } from '@storybook/react';
import { ProgressMetricRow } from '../../components/dashboard/ProgressMetricRow';

const meta = {
  title: 'Dashboard/ProgressMetricRow',
  component: ProgressMetricRow,
  decorators: [(Story) => <div className="p-6 bg-[#F5F7FB] min-h-screen"><div className="max-w-md"><Story /></div></div>],
  tags: ['autodocs'],
} satisfies Meta<typeof ProgressMetricRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ShortBar: Story = { args: { label: 'Measles', valueText: '124 cases', progress: 25 } };
export const MediumBar: Story = { args: { label: 'Dengue', valueText: '89 cases', progress: 50 } };
export const LongBar: Story = { args: { label: 'Influenza', valueText: '312 cases', progress: 75 } };
export const CriticalColor: Story = { args: { label: 'COVID-like illness', valueText: '245 cases', progress: 85, barColor: '#EF4444' } };
export const NeutralColor: Story = { args: { label: 'Pertussis', valueText: '12 cases', progress: 10, barColor: '#9CA3AF' } };
