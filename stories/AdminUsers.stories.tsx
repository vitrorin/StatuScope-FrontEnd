import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AdminUsers } from '@/components/views/admin/users';

const meta = {
  title: 'Views/Admin/Users',
  component: AdminUsers,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AdminUsers>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
