import { AppColors } from '@/constants/theme';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { SkeletonLine } from '@/components/feedback/SkeletonLine';

const meta = {
  title: 'Componentes reutilizables/Feedback/SkeletonLine',
  component: SkeletonLine,
  decorators: [(Story) => <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}><Story /></View>],
  tags: ['autodocs'],
} satisfies Meta<typeof SkeletonLine>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { width: 180, height: 14 },
};
