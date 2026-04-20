import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View } from 'react-native';
import { MapControlButton } from '../../components/dashboard/MapControlButton';

const meta = {
  title: 'Dashboard/MapControlButton',
  component: MapControlButton,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
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

export const Plus: Story = {
  args: {
    icon: '+',
    variant: 'default',
  },
};

export const Minus: Story = {
  args: {
    icon: '−',
    variant: 'default',
  },
};

export const Target: Story = {
  args: {
    icon: '◎',
    variant: 'default',
  },
};

export const Disabled: Story = {
  args: {
    icon: '+',
    variant: 'default',
    disabled: true,
  },
};