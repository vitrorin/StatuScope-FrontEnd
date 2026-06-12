import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { MapZoneDetailOverlay } from '@/components/views/doctor/dashboard/Sub-funcionalidades/MapZoneDetailOverlay';
import { doctorDashboardZone, overlayActions } from './overlayMocks';

const meta = {
  title: 'Overlays/Doctor/Dashboard/MapZoneDetailOverlay',
  component: MapZoneDetailOverlay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MapZoneDetailOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    visible: true,
    zone: doctorDashboardZone,
    onClose: overlayActions.close,
  },
};
