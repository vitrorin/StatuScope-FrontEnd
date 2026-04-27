import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AdminAnalytics } from '@/components/views/admin/analytics';

const meta = {
  title: 'Views/Admin/Analytics',
  component: AdminAnalytics,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AdminAnalytics>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
