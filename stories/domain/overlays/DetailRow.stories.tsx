import { AppColors } from '@/constants/theme';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { DetailRow } from '@/components/overlays/DetailRow';

const meta = {
  title: 'Componentes reutilizables/Overlays/DetailRow',
  component: DetailRow,
  decorators: [(Story) => <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas, maxWidth: 320 }}><Story /></View>],
  tags: ['autodocs'],
} satisfies Meta<typeof DetailRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Boxed: Story = {
  args: { label: 'Hospital', value: 'Hospital General', boxed: true },
};
