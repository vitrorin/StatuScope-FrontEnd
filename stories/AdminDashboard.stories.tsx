import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';

const meta = {
  title: 'Screens/AdminDashboard',
  component: AdminDashboard,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AdminDashboard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
