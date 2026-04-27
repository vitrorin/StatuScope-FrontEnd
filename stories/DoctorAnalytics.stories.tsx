import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { DoctorAnalytics } from '@/components/views/doctor/analytics';

const meta = {
  title: 'Views/Doctor/Analytics',
  component: DoctorAnalytics,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof DoctorAnalytics>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
