import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { AppColors } from '@/constants/theme';
import { RecommendationTabs } from '@/components/recommendations/RecommendationTabs';

const options = [
  { label: 'Active', value: 'active', badgeCount: 8 },
  { label: 'Scheduled', value: 'scheduled', badgeCount: 3 },
  { label: 'Completed', value: 'completed', badgeCount: 12 },
];

const meta = {
  title: 'Componentes únicos/Recommendations/RecommendationTabs',
  component: RecommendationTabs,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}>
        <View style={{ maxWidth: 620 }}>
          <Story />
        </View>
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof RecommendationTabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: { options, value: 'active' },
};

export const Completed: Story = {
  args: { options, value: 'completed' },
};
