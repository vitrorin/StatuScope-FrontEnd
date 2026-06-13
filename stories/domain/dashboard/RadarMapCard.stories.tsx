import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AppColors } from '@/constants/theme';

import { View } from 'react-native';
import { RadarMapCard } from '../../../components/dashboard/RadarMapCard';

const meta = {
  title: 'Componentes únicos/Dashboard/RadarMapCard',
  component: RadarMapCard,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}>
        <View style={{ maxWidth: 600 }}>
          <Story />
        </View>
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof RadarMapCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DoctorDashboardMap: Story = {
  args: {
    title: 'Radar Map Card',
    subtitle: 'Doctor Dashboard Map',
    legendItems: [
      { label: 'High Risk', color: AppColors.status.dangerBright },
      { label: 'Moderate', color: AppColors.status.warning },
      { label: 'Low Risk', color: AppColors.status.successBright },
    ],
  },
};

export const AnalyticsRadar: Story = {
  args: {
    title: 'Radar Map Card',
    subtitle: 'Analytics Radar',
    legendItems: [
      { label: 'COVID-19 Clusters', color: AppColors.status.dangerBright },
      { label: 'Influenza', color: AppColors.status.warning },
      { label: 'Hospital Density', color: AppColors.brand.link },
    ],
    showControls: true,
  },
};

export const WithOverlayPanel: Story = {
  args: {
    title: 'Radar Map Card',
    subtitle: 'With Overlay Panel',
    legendItems: [
      { label: 'High Risk', color: AppColors.status.dangerBright },
      { label: 'Moderate', color: AppColors.status.warning },
      { label: 'Low Risk', color: AppColors.status.successBright },
    ],
    showOverlayPanel: true,
    overlayTitle: 'Domain/Dashboard/RadarMapCard',
    overlayItems: [
      { label: 'Influenza A', value: '124', color: AppColors.status.dangerBright },
      { label: 'COVID-19', value: '89', color: AppColors.status.warning },
      { label: 'Dengue', value: '45', color: AppColors.brand.link },
    ],
  },
};

export const WithControls: Story = {
  args: {
    title: 'Radar Map Card',
    subtitle: 'With Controls',
    legendItems: [
      { label: 'High Risk', color: AppColors.status.dangerBright },
      { label: 'Moderate', color: AppColors.status.warning },
      { label: 'Low Risk', color: AppColors.status.successBright },
    ],
    showControls: true,
    showOverlayPanel: true,
    overlayTitle: 'Domain/Dashboard/RadarMapCard',
    overlayItems: [
      { label: 'Active Clusters', value: '12' },
      { label: 'Hospitals', value: '8' },
    ],
  },
};

export const WithFooterLegend: Story = {
  args: {
    title: 'Radar Map Card',
    subtitle: 'With Footer Legend',
    legendItems: [
      { label: 'High Risk', color: AppColors.status.dangerBright },
      { label: 'Moderate', color: AppColors.status.warning },
      { label: 'Low Risk', color: AppColors.status.successBright },
    ],
    footerTextLeft: 'Last updated: 2 min ago',
    footerTextRight: 'Data source: Regional Health API',
  },
};
