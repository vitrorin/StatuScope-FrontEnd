import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { ZoneDetailOverlay } from '@/components/views/doctor/analytics/Sub-funcionalidades/ZoneDetailOverlay';
import { analyticsZone, overlayActions } from './overlayMocks';

const meta = {
  title: 'Overlays/Doctor/Analytics/ZoneDetailOverlay',
  component: ZoneDetailOverlay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ZoneDetailOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    visible: true,
    zone: analyticsZone,
    onClose: overlayActions.close,
  },
};
