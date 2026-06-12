import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AlertProtocolOverlay } from '@/components/views/admin/dashboard/Sub-funcionalidades/AlertProtocolOverlay';
import { overlayActions } from './overlayMocks';

const meta = {
  title: 'Overlays/HospitalAdmin/Dashboard/AlertProtocolOverlay',
  component: AlertProtocolOverlay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AlertProtocolOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    visible: true,
    onClose: overlayActions.close,
  },
};
