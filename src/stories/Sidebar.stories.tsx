import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar } from '../components/Sidebar';

const meta = {
  title: 'Navigation/Sidebar',
  component: Sidebar,
  decorators: [(Story) => <div className="flex flex-row min-h-screen"><Story /></div>],
  tags: ['autodocs'],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DashboardActive: Story = { args: { active: 'dashboard' } };
export const DiagnosisActive: Story = { args: { active: 'diagnosis' } };
export const AnalyticsActive: Story = { args: { active: 'analytics' } };
