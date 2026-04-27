import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { DoctorDashboard } from '@/components/views/doctor/dashboard';

const meta = {
  title: 'Views/Doctor/Dashboard',
  component: DoctorDashboard,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof DoctorDashboard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
