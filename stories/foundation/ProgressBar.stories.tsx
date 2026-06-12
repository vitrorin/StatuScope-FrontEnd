import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { AppColors } from '@/constants/theme';
import { ProgressBar } from '@/components/foundation/ProgressBar';

const meta = {
  title: 'Componentes reutilizables/Foundation/ProgressBar',
  component: ProgressBar,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}>
        <View style={{ maxWidth: 420 }}>
          <Story />
        </View>
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof ProgressBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: 64 },
};

export const HighRisk: Story = {
  args: { value: 86, color: AppColors.status.danger, height: 8 },
};

export const LowValue: Story = {
  args: { value: 18, color: AppColors.status.success, height: 4 },
};
