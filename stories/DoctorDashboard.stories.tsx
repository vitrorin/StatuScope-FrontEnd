import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { DoctorDashboard } from '@/components/dashboard/DoctorDashboard';

const meta = {
  title: 'Screens/DoctorDashboard',
  component: DoctorDashboard,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof DoctorDashboard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
