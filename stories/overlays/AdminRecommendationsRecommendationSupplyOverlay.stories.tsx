import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { RecommendationSupplyOverlay } from '@/components/views/admin/recommendations/Sub-funcionalidades/RecommendationSupplyOverlay';
import { overlayActions, recommendationItem } from './overlayMocks';

const meta = {
  title: 'Overlays/HospitalAdmin/Recommendations/RecommendationSupplyOverlay',
  component: RecommendationSupplyOverlay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof RecommendationSupplyOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    visible: true,
    item: recommendationItem,
    onClose: overlayActions.close,
    onSubmit: overlayActions.submit,
  },
};
