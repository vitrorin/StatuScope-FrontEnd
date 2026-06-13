import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { RecommendationTaskOverlay } from '@/components/views/admin/recommendations/Sub-funcionalidades/RecommendationTaskOverlay';
import { contacts, overlayActions, recommendationItem } from './overlayMocks';

const meta = {
  title: 'Overlays/HospitalAdmin/Recommendations/RecommendationTaskOverlay',
  component: RecommendationTaskOverlay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof RecommendationTaskOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    visible: true,
    item: recommendationItem,
    contacts,
    onClose: overlayActions.close,
    onSave: overlayActions.save,
  },
};
