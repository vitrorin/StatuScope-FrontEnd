import { AppColors } from '@/constants/theme';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { EmptyState } from '@/components/feedback/EmptyState';

const meta = {
  title: 'Componentes reutilizables/Feedback/EmptyState',
  component: EmptyState,
  decorators: [(Story) => <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}><Story /></View>],
  tags: ['autodocs'],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'No records found',
    message: 'Adjust filters or create a new record.',
  },
};
