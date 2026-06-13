import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { AppColors } from '@/constants/theme';
import { MapControlButton } from '@/components/dashboard/MapControlButton';

const meta = {
  title: 'Componentes únicos/Dashboard/MapControlButton',
  component: MapControlButton,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Story />
        </View>
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof MapControlButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ZoomIn: Story = {
  args: { icon: 'plus', variant: 'default' },
};

export const ZoomOut: Story = {
  args: { icon: 'minus', variant: 'ghost' },
};

export const SettingsPrimary: Story = {
  args: { icon: 'settings', variant: 'primary' },
};

export const Disabled: Story = {
  args: { icon: 'plus', disabled: true },
};
