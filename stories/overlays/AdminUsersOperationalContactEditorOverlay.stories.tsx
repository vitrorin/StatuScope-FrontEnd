import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { OperationalContactEditorOverlay } from '@/components/views/admin/users/Sub-funcionalidades/OperationalContactEditorOverlay';
import { contacts, departments, overlayActions } from './overlayMocks';

const meta = {
  title: 'Overlays/HospitalAdmin/Users/OperationalContactEditorOverlay',
  component: OperationalContactEditorOverlay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof OperationalContactEditorOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Edit: Story = {
  args: {
    visible: true,
    contact: contacts[0],
    departments,
    saving: false,
    onClose: overlayActions.close,
    onSave: overlayActions.save,
  },
};
