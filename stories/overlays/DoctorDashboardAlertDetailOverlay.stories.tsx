import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AlertDetailOverlay } from '@/components/views/doctor/dashboard/Sub-funcionalidades/AlertDetailOverlay';
import { doctorDashboardAlert, overlayActions } from './overlayMocks';

const meta = {
  title: 'Overlays/Doctor/Dashboard/AlertDetailOverlay',
  component: AlertDetailOverlay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AlertDetailOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    visible: true,
    alert: doctorDashboardAlert,
    onClose: overlayActions.close,
  },
};
