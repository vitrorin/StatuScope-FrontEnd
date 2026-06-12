import { AppColors } from '@/constants/theme';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Text, View } from 'react-native';
import { FormSection } from '@/components/forms/FormSection';

const meta = {
  title: 'Componentes reutilizables/Forms/FormSection',
  component: FormSection,
  decorators: [(Story) => <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}><Story /></View>],
  tags: ['autodocs'],
  render: (args) => (
    <FormSection {...args}>
      <Text>Mock form content</Text>
    </FormSection>
  ),
} satisfies Meta<typeof FormSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { title: 'Patient details', description: 'Grouped editable fields.' },
};
