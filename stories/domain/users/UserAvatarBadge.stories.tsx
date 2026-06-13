import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { AppColors } from '@/constants/theme';
import { UserAvatarBadge } from '@/components/users/UserAvatarBadge';

const meta = {
  title: 'Componentes únicos/Users/UserAvatarBadge',
  component: UserAvatarBadge,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <Story />
        </View>
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof UserAvatarBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Doctor: Story = {
  args: { initials: 'DR', variant: 'doctor', size: 'md' },
};

export const Admin: Story = {
  args: { initials: 'AD', variant: 'admin', size: 'lg' },
};

export const Neutral: Story = {
  args: { initials: 'US', variant: 'neutral', size: 'sm' },
};
