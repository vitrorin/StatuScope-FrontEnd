import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Text, View } from 'react-native';
import { AppColors } from '@/constants/theme';
import { CardBase } from '@/components/patterns/CardBase';

const meta = {
  title: 'Componentes reutilizables/Patterns/CardBase',
  component: CardBase,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}>
        <View style={{ maxWidth: 440 }}>
          <Story />
        </View>
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof CardBase>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: AppColors.text.primary }}>
          Reusable card surface
        </Text>
        <Text style={{ fontSize: 14, lineHeight: 20, color: AppColors.text.body }}>
          Used as a consistent container for grouped dashboard and domain content.
        </Text>
      </View>
    ),
  },
};
