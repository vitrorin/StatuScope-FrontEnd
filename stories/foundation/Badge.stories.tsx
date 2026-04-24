import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { Badge } from '../../components/foundation/Badge';

const meta = {
  title: 'Foundation/Badge',
  component: Badge,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <Story />
        </View>
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Critical: Story = { args: { label: 'Critical', tone: 'critical' } };
export const Success: Story = { args: { label: 'Active', tone: 'success' } };
export const Warning: Story = { args: { label: 'Warning', tone: 'warning' } };
export const Info: Story = { args: { label: 'Info', tone: 'info' } };
export const Role: Story = { args: { label: 'Doctor', tone: 'role' } };
export const High: Story = { args: { label: 'High', tone: 'high' } };

