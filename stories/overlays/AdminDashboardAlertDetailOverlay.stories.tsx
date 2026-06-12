import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AlertDetailOverlay } from '@/components/views/admin/dashboard/Sub-funcionalidades/AlertDetailOverlay';
import { adminDashboardAlert, overlayActions } from './overlayMocks';

const meta = {
  title: 'Overlays/HospitalAdmin/Dashboard/AlertDetailOverlay',
  component: AlertDetailOverlay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AlertDetailOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    visible: true,
    alert: adminDashboardAlert,
    onClose: overlayActions.close,
  },
};
