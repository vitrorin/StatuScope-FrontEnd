import type { Meta, StoryObj } from '@storybook/react';
import { SectionTitleBlock } from '../../components/layout/SectionTitleBlock';

const meta = {
  title: 'Layout/SectionTitleBlock',
  component: SectionTitleBlock,
  decorators: [(Story) => <div className="p-6 bg-[#F5F7FB] min-h-screen"><Story /></div>],
  tags: ['autodocs'],
} satisfies Meta<typeof SectionTitleBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = { args: { title: 'Hospital Radar Overview' } };

export const WithSubtitle: Story = {
  args: { title: 'User Management', subtitle: 'Manage hospital staff accounts, roles, and access permissions' },
};

export const WithEyebrow: Story = {
  args: {
    eyebrow: 'Analytics',
    title: 'AI Operational Recommendations',
    subtitle: 'AI-driven insights to optimize hospital operations and resource allocation',
  },
};

export const WithActions: Story = {
  args: {
    eyebrow: 'Dashboard',
    title: 'Patient Records',
    subtitle: 'View and manage patient information',
    rightSlot: (
      <div className="flex flex-row gap-2">
        <button className="bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-800">
          Add New
        </button>
        <button className="bg-white text-gray-700 text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">
          Export
        </button>
      </div>
    ),
  },
};
