import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AdminResources } from '@/components/dashboard/AdminResources';

const meta = {
  title: 'Screens/AdminResources',
  component: AdminResources,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AdminResources>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
