import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View } from 'react-native';
import { InlineWarningBanner } from '../../components/feedback/InlineWarningBanner';

const meta = {
  title: 'Feedback/InlineWarningBanner',
  component: InlineWarningBanner,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
        <View style={{ maxWidth: 500 }}>
          <Story />
        </View>
      </View>
    ),
  ],
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
  args: {
    message: 'New CDC guidelines available for seasonal influenza prevention protocols.',
    variant: 'info',
  },
};