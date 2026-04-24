import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { Avatar } from '../../components/foundation/Avatar';

const meta = {
  title: 'Foundation/Avatar',
  component: Avatar,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
          <Story />
        </View>
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { initials: 'JD', tone: 'default', size: 'md' } };
export const Doctor: Story = { args: { initials: 'DR', tone: 'doctor', size: 'md' } };
export const AdminLarge: Story = { args: { initials: 'AD', tone: 'admin', size: 'lg' } };

