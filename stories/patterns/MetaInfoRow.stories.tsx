import { AppColors } from '@/constants/theme';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View } from 'react-native';
import { MetaInfoRow } from '../../components/recommendations/MetaInfoRow';

const meta = {
  title: 'Componentes únicos/Recommendations/MetaInfoRow',
  component: MetaInfoRow,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}>
        <Story />
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof MetaInfoRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TwoItems: Story = {
  args: {
    items: [
      { label: '14 mins ago' },
      { label: 'Resource Team B' },
    ],
  },
};

export const ThreeItems: Story = {
  args: {
    items: [
      { label: '1 hour ago' },
      { label: 'Nursing Admin' },
      { label: 'Supply Chain' },
    ],
  },
};

export const Compact: Story = {
  args: {
    items: [
      { label: '2 days ago' },
      { label: 'Biomedical' },
    ],
    compact: true,
  },
};
