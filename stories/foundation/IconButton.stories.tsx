import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { IconButton } from '../../components/foundation/IconButton';

const meta = {
  title: 'Foundation/IconButton',
  component: IconButton,
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
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Secondary: Story = {
  args: { icon: '+', variant: 'secondary' },
};

export const Primary: Story = {
  args: { icon: '⌕', variant: 'primary' },
};

export const Ghost: Story = {
  args: { icon: '↻', variant: 'ghost' },
};

