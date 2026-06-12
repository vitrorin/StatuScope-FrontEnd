import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { RecommendationNotifyOverlay } from '@/components/views/admin/recommendations/Sub-funcionalidades/RecommendationNotifyOverlay';
import { contacts, departments, overlayActions, recommendationItem } from './overlayMocks';

const meta = {
  title: 'Overlays/HospitalAdmin/Recommendations/RecommendationNotifyOverlay',
  component: RecommendationNotifyOverlay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof RecommendationNotifyOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    visible: true,
    item: recommendationItem,
    contacts,
    departments,
    onClose: overlayActions.close,
    onSend: overlayActions.send,
  },
};
