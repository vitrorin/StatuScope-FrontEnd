import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AdminRecommendations } from '@/components/dashboard/AdminRecommendations';

const meta = {
  title: 'Screens/AdminRecommendations',
  component: AdminRecommendations,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AdminRecommendations>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
