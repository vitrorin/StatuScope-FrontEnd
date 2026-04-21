import type { Meta, StoryObj } from '@storybook/react';
import { DetectionBanner } from '../../components/feedback/DetectionBanner';

const meta = {
  title: 'Feedback/DetectionBanner',
  component: DetectionBanner,
  decorators: [(Story) => <div className="p-6 bg-[#F5F7FB] min-h-screen"><div className="max-w-2xl"><Story /></div></div>],
  tags: ['autodocs'],
} satisfies Meta<typeof DetectionBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { message: 'Recent Detection: Significant increase in Influenza-like cases in West District.' },
};

export const WithDetailsLink: Story = {
  args: { message: 'Recent Detection: Significant increase in Influenza-like cases in West District.', actionLabel: 'View Details' },
};

export const Warning: Story = {
  args: { message: 'Alert: Dengue fever cluster identified in Eastern Region. 12 new cases today.', actionLabel: 'View Map', variant: 'warning' },
};

export const Critical: Story = {
  args: {
    message: 'URGENT: Multi-drug resistant TB strain detected. Immediate containment protocols recommended.',
    actionLabel: 'View Protocol',
    variant: 'critical',
  },
};
