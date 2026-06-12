import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AppColors } from '@/constants/theme';

import { View } from 'react-native';
import { MapLegend } from '../../components/dashboard/MapLegend';

const meta = {
  title: 'Componentes únicos/Dashboard/MapLegend',
  component: MapLegend,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}>
        <View style={{ maxWidth: 300 }}>
          <Story />
        </View>
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof MapLegend>;

export default meta;

type Story = StoryObj<typeof meta>;

export const VerticalDefault: Story = {
  args: {
    items: [
      { label: 'COVID-19 Clusters', color: AppColors.status.dangerBright },
      { label: 'Influenza', color: AppColors.status.warning },
      { label: 'Hospital Density', color: AppColors.brand.link },
      { label: 'Low Risk', color: AppColors.status.successBright },
    ],
    orientation: 'vertical',
  },
};

export const HorizontalCompact: Story = {
  args: {
    items: [
      { label: 'High Risk', color: AppColors.status.dangerBright },
      { label: 'Moderate', color: AppColors.status.warning },
      { label: 'Low Risk', color: AppColors.status.successBright },
    ],
    orientation: 'horizontal',
  },
};

export const WithValues: Story = {
  args: {
    items: [
      { label: 'Active Cases', color: AppColors.status.dangerBright, value: '124' },
      { label: 'Suspected', color: AppColors.status.warning, value: '89' },
      { label: 'Recovered', color: AppColors.status.successBright, value: '456' },
    ],
    orientation: 'vertical',
  },
};
