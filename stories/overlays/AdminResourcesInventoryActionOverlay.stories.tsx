import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { InventoryActionOverlay } from '@/components/views/admin/resources/Sub-funcionalidades/InventoryActionOverlay';
import { inventoryItem, overlayActions } from './overlayMocks';

const meta = {
  title: 'Overlays/HospitalAdmin/Resources/InventoryActionOverlay',
  component: InventoryActionOverlay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof InventoryActionOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Edit: Story = {
  args: {
    visible: true,
    inventoryItem,
    mode: 'edit',
    saving: false,
    deleting: false,
    onClose: overlayActions.close,
    onSave: overlayActions.save,
    onDelete: overlayActions.delete,
  },
};
