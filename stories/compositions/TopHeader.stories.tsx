import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View } from 'react-native';
import { TopHeader } from '../../components/layout/TopHeader';
import { AppColors } from '../../constants/theme';

const meta = {
  title: 'Componentes reutilizables/Layout/TopHeader',
  component: TopHeader,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, backgroundColor: AppColors.surface.page }}>
        <Story />
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof TopHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultDoctor: Story = {
  args: {
    sectionLabel: 'Dashboard',
    userName: 'Dr. Sarah Chen',
    userId: 'ID: 2847',
    showNotificationDot: false,
    avatarText: 'SC',
  },
};

export const DefaultAdmin: Story = {
  args: {
    sectionLabel: 'User Management',
    userName: 'Admin Martinez',
    userId: 'ID: 001',
    showNotificationDot: false,
    avatarText: 'AM',
  },
};

export const WithNotificationIndicator: Story = {
  args: {
    sectionLabel: 'Analytics',
    userName: 'Dr. James Wilson',
    userId: 'ID: 1923',
    showNotificationDot: true,
    avatarText: 'JW',
  },
};

export const WithCustomSearchPlaceholder: Story = {
  args: {
    sectionLabel: 'Diagnosis',
    userName: 'Dr. Emily Roberts',
    userId: 'ID: 3456',
    showNotificationDot: false,
    avatarText: 'ER',
  },
};
