import type { Meta, StoryObj } from '@storybook/react';
import { StatusBadge } from '../../components/feedback/StatusBadge';

const meta = {
  title: 'Feedback/StatusBadge',
  component: StatusBadge,
  decorators: [(Story) => <div className="p-6 bg-[#F5F7FB] min-h-screen flex flex-row flex-wrap gap-3"><Story /></div>],
  tags: ['autodocs'],
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Critical: Story = { args: { label: 'Critical', variant: 'critical' } };
export const Stable: Story = { args: { label: 'Stable', variant: 'success' } };
export const HighDemand: Story = { args: { label: 'High Demand', variant: 'warning' } };
export const Active: Story = { args: { label: 'Active', variant: 'success' } };
export const Inactive: Story = { args: { label: 'Inactive', variant: 'neutral' } };
export const Suspended: Story = { args: { label: 'Suspended', variant: 'critical' } };
export const Doctor: Story = { args: { label: 'Doctor', variant: 'role' } };
export const HospitalAdministrator: Story = { args: { label: 'Hospital Admin', variant: 'role' } };
export const Moderate: Story = { args: { label: 'Moderate', variant: 'warning' } };
export const Alert: Story = { args: { label: 'Alert', variant: 'critical' } };
export const Secure: Story = { args: { label: 'Secure', variant: 'success' } };
