import { AppColors } from '@/constants/theme';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { InfoTile } from '@/components/overlays/InfoTile';

const meta = {
  title: 'Componentes reutilizables/Overlays/InfoTile',
  component: InfoTile,
  decorators: [(Story) => <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas, maxWidth: 360 }}><Story /></View>],
  tags: ['autodocs'],
} satisfies Meta<typeof InfoTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'Current stock', value: '48 units', helper: 'Target 80 units' },
};
