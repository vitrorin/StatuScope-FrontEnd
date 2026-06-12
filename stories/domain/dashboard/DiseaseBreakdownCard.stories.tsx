import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AppColors } from '@/constants/theme';

import { View } from 'react-native';
import { DiseaseBreakdownCard } from '../../../components/dashboard/DiseaseBreakdownCard';

const meta = {
  title: 'Componentes únicos/Dashboard/DiseaseBreakdownCard',
  component: DiseaseBreakdownCard,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}>
        <View style={{ maxWidth: 360 }}>
          <Story />
        </View>
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof DiseaseBreakdownCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Disease Breakdown Card',
    rows: [
      { label: 'Influenza', valueText: '312 cases', progress: 75 },
      { label: 'COVID-like illness', valueText: '245 cases', progress: 60 },
      { label: 'Measles', valueText: '124 cases', progress: 30 },
      { label: 'Dengue', valueText: '89 cases', progress: 22 },
      { label: 'Pertussis', valueText: '12 cases', progress: 5 },
    ],
    summaryItems: [
      { label: 'Total Cases', value: '782' },
      { label: 'Active Outbreaks', value: '3', valueColor: AppColors.status.dangerBright },
    ],
    buttonLabel: 'Export Full Report',
  },
};

export const HighVolume: Story = {
  args: {
    title: 'Disease Breakdown Card',
    rows: [
      { label: 'Influenza A', valueText: '1,245 cases', progress: 85, barColor: AppColors.status.dangerBright },
      { label: 'Influenza B', valueText: '892 cases', progress: 62, barColor: AppColors.status.warning },
      { label: 'RSV', valueText: '456 cases', progress: 35, barColor: AppColors.brand.link },
      { label: 'Common Cold', valueText: '234 cases', progress: 18 },
    ],
    summaryItems: [
      { label: 'Total Cases', value: '2,827', valueColor: AppColors.status.dangerBright },
      { label: 'Peak Region', value: 'West District' },
    ],
    buttonLabel: 'View Detailed Analysis',
  },
};

export const Compact: Story = {
  args: {
    title: 'Disease Breakdown Card',
    rows: [
      { label: 'Influenza', valueText: '312', progress: 80 },
      { label: 'Dengue', valueText: '156', progress: 40 },
      { label: 'Measles', valueText: '89', progress: 25 },
    ],
  },
};
