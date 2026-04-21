import type { Meta, StoryObj } from '@storybook/react';
import { InlineWarningBanner } from '../../components/feedback/InlineWarningBanner';

const meta = {
  title: 'Feedback/InlineWarningBanner',
  component: InlineWarningBanner,
  decorators: [(Story) => <div className="p-6 bg-[#F5F7FB] min-h-screen"><div className="max-w-lg"><Story /></div></div>],
  tags: ['autodocs'],
} satisfies Meta<typeof InlineWarningBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CriticalMedicalWarning: Story = {
  args: {
    title: 'Clinical Warning',
    message: 'Please check for Koplik spots in oral mucosa. May indicate early measles infection.',
    variant: 'critical',
  },
};

export const ModerateWarning: Story = {
  args: {
    title: 'Risk Alert',
    message: 'Locality risk factor is extremely high. Consider additional precautions for patient visits.',
    variant: 'warning',
  },
};

export const InfoNotice: Story = {
  args: { message: 'New CDC guidelines available for seasonal influenza prevention protocols.', variant: 'info' },
};
