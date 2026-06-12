import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { FullRosterOverlay } from '@/components/views/admin/resources/Sub-funcionalidades/FullRosterOverlay';
import { overlayActions, roster } from './overlayMocks';

const meta = {
  title: 'Overlays/HospitalAdmin/Resources/FullRosterOverlay',
  component: FullRosterOverlay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof FullRosterOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    visible: true,
    roster,
    onClose: overlayActions.close,
  },
};
