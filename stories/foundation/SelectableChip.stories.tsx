import { AppColors } from '@/constants/theme';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { SelectableChip } from '@/components/foundation/SelectableChip';

const meta = {
  title: 'Componentes reutilizables/Foundation/SelectableChip',
  component: SelectableChip,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas, flexDirection: 'row', gap: 12 }}>
        <Story />
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof SelectableChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Selected: Story = {
  args: { label: 'Active', selected: true },
};

export const Default: Story = {
  args: { label: 'Pending' },
};
