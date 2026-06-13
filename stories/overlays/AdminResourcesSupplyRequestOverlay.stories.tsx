import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { SupplyRequestOverlay } from '@/components/views/admin/resources/Sub-funcionalidades/SupplyRequestOverlay';
import { inventoryItem, inventoryMovements, overlayActions } from './overlayMocks';

const meta = {
  title: 'Overlays/HospitalAdmin/Resources/SupplyRequestOverlay',
  component: SupplyRequestOverlay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SupplyRequestOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    visible: true,
    inventoryItem,
    movements: inventoryMovements,
    loadingMovements: false,
    saving: false,
    onClose: overlayActions.close,
    onSubmit: overlayActions.submit,
  },
};
