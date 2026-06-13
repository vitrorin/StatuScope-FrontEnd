import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { MapZoneDetailOverlay } from '@/components/views/admin/dashboard/Sub-funcionalidades/MapZoneDetailOverlay';
import { adminDashboardZone, overlayActions } from './overlayMocks';

const meta = {
  title: 'Overlays/HospitalAdmin/Dashboard/MapZoneDetailOverlay',
  component: MapZoneDetailOverlay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MapZoneDetailOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    visible: true,
    zone: adminDashboardZone,
    showRadius: true,
    onClose: overlayActions.close,
  },
};
