import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { InventoryMapOverlay } from '@/components/views/admin/resources/Sub-funcionalidades/InventoryMapOverlay';
import { inventoryItem, overlayActions } from './overlayMocks';

const meta = {
  title: 'Overlays/HospitalAdmin/Resources/InventoryMapOverlay',
  component: InventoryMapOverlay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof InventoryMapOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    visible: true,
    inventory: [inventoryItem],
    onClose: overlayActions.close,
  },
};
