import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { AppColors } from '@/constants/theme';
import { SeverityBadge } from '@/components/recommendations/SeverityBadge';

const meta = {
  title: 'Componentes únicos/Recommendations/SeverityBadge',
  component: SeverityBadge,
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
} satisfies Meta<typeof SeverityBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const High: Story = {
  args: { label: 'High', severity: 'high' },
};

export const Medium: Story = {
  args: { label: 'Medium', severity: 'medium' },
};

export const Low: Story = {
  args: { label: 'Low', severity: 'low' },
};
