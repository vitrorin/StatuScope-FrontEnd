import { AppColors } from '@/constants/theme';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { OverlayHeader } from '@/components/overlays/OverlayHeader';

const meta = {
  title: 'Componentes reutilizables/Overlays/OverlayHeader',
  component: OverlayHeader,
  decorators: [(Story) => <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}><Story /></View>],
  tags: ['autodocs'],
} satisfies Meta<typeof OverlayHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { eyebrow: 'Outbreak', title: 'Alert details', subtitle: 'Live hospital context', onClose: () => undefined },
};
