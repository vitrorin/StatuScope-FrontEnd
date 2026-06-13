import { AppColors } from '@/constants/theme';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { OverlayStatCard } from '@/components/overlays/OverlayStatCard';

const meta = {
  title: 'Componentes reutilizables/Overlays/OverlayStatCard',
  component: OverlayStatCard,
  decorators: [(Story) => <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas, maxWidth: 260 }}><Story /></View>],
  tags: ['autodocs'],
} satisfies Meta<typeof OverlayStatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'Current value', value: '128', detail: 'Last 24h', accentColor: AppColors.status.warning },
};
