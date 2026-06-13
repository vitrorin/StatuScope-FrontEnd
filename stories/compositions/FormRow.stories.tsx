import { AppColors } from '@/constants/theme';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Text, View } from 'react-native';
import { FormRow } from '@/components/forms/FormRow';

const meta = {
  title: 'Componentes reutilizables/Forms/FormRow',
  component: FormRow,
  decorators: [(Story) => <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}><Story /></View>],
  tags: ['autodocs'],
  render: (args) => (
    <FormRow {...args}>
      <Text>First field</Text>
      <Text>Second field</Text>
    </FormRow>
  ),
} satisfies Meta<typeof FormRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwoColumns: Story = {
  args: { columns: 2 },
};
