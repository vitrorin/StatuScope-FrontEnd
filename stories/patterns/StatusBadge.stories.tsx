import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { AppColors } from '@/constants/theme';
import { StatusBadge } from '@/components/feedback/StatusBadge';

const meta = {
  title: 'Componentes reutilizables/Feedback/StatusBadge',
  component: StatusBadge,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <Story />
        </View>
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof StatusBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Critical: Story = {
  args: { label: 'Critical', variant: 'critical' },
};

export const Success: Story = {
  args: { label: 'Stable', variant: 'success' },
};

export const Warning: Story = {
  args: { label: 'Warning', variant: 'warning' },
};

export const Info: Story = {
  args: { label: 'In review', variant: 'info' },
};

export const Role: Story = {
  args: { label: 'Admin', variant: 'role' },
};
