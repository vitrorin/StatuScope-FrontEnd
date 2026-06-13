import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { StaffingManageOverlay } from '@/components/views/admin/resources/Sub-funcionalidades/StaffingManageOverlay';
import { overlayActions, staffingProfiles } from './overlayMocks';

const meta = {
  title: 'Overlays/HospitalAdmin/Resources/StaffingManageOverlay',
  component: StaffingManageOverlay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof StaffingManageOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    visible: true,
    profiles: staffingProfiles,
    saving: false,
    deleting: false,
    onClose: overlayActions.close,
    onSave: overlayActions.save,
    onDelete: overlayActions.delete,
  },
};
