import { AppColors } from '@/constants/theme';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { RetryState } from '@/components/feedback/RetryState';

const meta = {
  title: 'Componentes reutilizables/Feedback/RetryState',
  component: RetryState,
  decorators: [(Story) => <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}><Story /></View>],
  tags: ['autodocs'],
} satisfies Meta<typeof RetryState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Unable to load data',
    message: 'Try again to refresh this section.',
    actionLabel: 'Retry',
    onRetry: () => undefined,
  },
};
