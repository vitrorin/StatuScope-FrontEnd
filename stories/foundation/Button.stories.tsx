import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { Button } from '../../components/foundation/Button';

const meta = {
  title: 'Foundation/Button',
  component: Button,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB', gap: 12 }}>
        <Story />
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { label: 'Run analysis', variant: 'primary', size: 'lg' },
};

export const Secondary: Story = {
  args: { label: 'Review details', variant: 'secondary' },
};

export const Ghost: Story = {
  args: { label: 'Dismiss', variant: 'ghost', size: 'chip' },
};

export const Danger: Story = {
  args: { label: 'Deactivate', variant: 'danger', size: 'chip' },
};

