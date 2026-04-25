import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { DoctorAnalytics } from '@/components/dashboard/DoctorAnalytics';

const meta = {
  title: 'Screens/DoctorAnalytics',
  component: DoctorAnalytics,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof DoctorAnalytics>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
