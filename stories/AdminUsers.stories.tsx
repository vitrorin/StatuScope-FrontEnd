import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AdminUsers } from '@/components/dashboard/AdminUsers';

const meta = {
  title: 'Screens/AdminUsers',
  component: AdminUsers,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AdminUsers>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
