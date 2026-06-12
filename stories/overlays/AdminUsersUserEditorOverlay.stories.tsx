import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { UserEditorOverlay } from '@/components/views/admin/users/Sub-funcionalidades/UserEditorOverlay';
import { adminUser, overlayActions } from './overlayMocks';

const meta = {
  title: 'Overlays/HospitalAdmin/Users/UserEditorOverlay',
  component: UserEditorOverlay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof UserEditorOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Edit: Story = {
  args: {
    visible: true,
    mode: 'edit',
    user: adminUser,
    saving: false,
    onClose: overlayActions.close,
    onSave: async () => undefined,
  },
};
