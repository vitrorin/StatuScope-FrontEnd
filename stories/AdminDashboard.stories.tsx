import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AdminDashboard } from '@/components/views/admin/dashboard';

const meta = {
  title: 'Views/Admin/Dashboard',
  component: AdminDashboard,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AdminDashboard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
