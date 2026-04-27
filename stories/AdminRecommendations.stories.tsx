import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AdminRecommendations } from '@/components/views/admin/recommendations';

const meta = {
  title: 'Views/Admin/Recommendations',
  component: AdminRecommendations,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AdminRecommendations>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
