import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { AppColors } from '@/constants/theme';
import { TimeFilterTabs } from '@/components/dashboard/TimeFilterTabs';

const timeOptions = [
  { label: '24h', value: '24h' },
  { label: '72h', value: '72h' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
];

const meta = {
  title: 'Componentes únicos/Dashboard/TimeFilterTabs',
  component: TimeFilterTabs,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}>
        <View style={{ maxWidth: 520 }}>
          <Story />
        </View>
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof TimeFilterTabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Last24Hours: Story = {
  args: { options: timeOptions, value: '24h' },
};

export const LastSevenDays: Story = {
  args: { options: timeOptions, value: '7d' },
};
