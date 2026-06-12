import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { RecommendationDetailOverlay } from '@/components/views/admin/recommendations/Sub-funcionalidades/RecommendationDetailOverlay';
import { overlayActions, recommendationItem } from './overlayMocks';

const meta = {
  title: 'Overlays/HospitalAdmin/Recommendations/RecommendationDetailOverlay',
  component: RecommendationDetailOverlay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof RecommendationDetailOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    visible: true,
    item: recommendationItem,
    onClose: overlayActions.close,
  },
};
