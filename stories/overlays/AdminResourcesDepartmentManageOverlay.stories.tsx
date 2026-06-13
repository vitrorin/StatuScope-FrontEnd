import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { DepartmentManageOverlay } from '@/components/views/admin/resources/Sub-funcionalidades/DepartmentManageOverlay';
import { departmentResource, overlayActions } from './overlayMocks';

const meta = {
  title: 'Overlays/HospitalAdmin/Resources/DepartmentManageOverlay',
  component: DepartmentManageOverlay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DepartmentManageOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Edit: Story = {
  args: {
    visible: true,
    department: departmentResource,
    mode: 'edit',
    saving: false,
    deleting: false,
    onClose: overlayActions.close,
    onSave: overlayActions.save,
    onDelete: overlayActions.delete,
  },
};
