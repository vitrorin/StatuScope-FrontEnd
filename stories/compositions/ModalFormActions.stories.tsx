import { AppColors } from '@/constants/theme';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { ModalFormActions } from '@/components/forms/ModalFormActions';

const meta = {
  title: 'Componentes reutilizables/Forms/ModalFormActions',
  component: ModalFormActions,
  decorators: [(Story) => <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}><Story /></View>],
  tags: ['autodocs'],
} satisfies Meta<typeof ModalFormActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    cancelLabel: 'Cancel',
    submitLabel: 'Save',
    onCancel: () => undefined,
    onSubmit: () => undefined,
  },
};
