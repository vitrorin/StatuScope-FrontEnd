import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AdminAnalytics } from '@/components/dashboard/AdminAnalytics';

const meta = {
  title: 'Screens/AdminAnalytics',
  component: AdminAnalytics,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AdminAnalytics>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
