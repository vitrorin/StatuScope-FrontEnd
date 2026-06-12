import { AppColors } from '@/constants/theme';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { SkeletonBlock } from '@/components/feedback/SkeletonBlock';

const meta = {
  title: 'Componentes reutilizables/Feedback/SkeletonBlock',
  component: SkeletonBlock,
  decorators: [(Story) => <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}><Story /></View>],
  tags: ['autodocs'],
} satisfies Meta<typeof SkeletonBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CardLoading: Story = {
  args: { width: 320, height: 120, rows: 3 },
};
