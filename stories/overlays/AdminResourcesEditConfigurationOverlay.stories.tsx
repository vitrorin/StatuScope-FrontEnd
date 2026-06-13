import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { EditConfigurationOverlay } from '@/components/views/admin/resources/Sub-funcionalidades/EditConfigurationOverlay';
import { departmentResource, overlayActions, resourceConfiguration } from './overlayMocks';

const meta = {
  title: 'Overlays/HospitalAdmin/Resources/EditConfigurationOverlay',
  component: EditConfigurationOverlay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof EditConfigurationOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    visible: true,
    value: resourceConfiguration,
    departments: [departmentResource],
    onClose: overlayActions.close,
    onSave: overlayActions.save,
  },
};
