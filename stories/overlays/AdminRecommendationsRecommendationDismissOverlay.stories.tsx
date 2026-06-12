import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { RecommendationDismissOverlay } from '@/components/views/admin/recommendations/Sub-funcionalidades/RecommendationDismissOverlay';
import { overlayActions, recommendationItem } from './overlayMocks';

const meta = {
  title: 'Overlays/HospitalAdmin/Recommendations/RecommendationDismissOverlay',
  component: RecommendationDismissOverlay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof RecommendationDismissOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    visible: true,
    item: recommendationItem,
    onClose: overlayActions.close,
    onConfirm: overlayActions.confirm,
  },
};
