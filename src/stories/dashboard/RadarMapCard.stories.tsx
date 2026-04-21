import type { Meta, StoryObj } from '@storybook/react';
import { RadarMapCard } from '../../components/dashboard/RadarMapCard';

const meta = {
  title: 'Dashboard/RadarMapCard',
  component: RadarMapCard,
  decorators: [(Story) => <div className="p-6 bg-[#F5F7FB] min-h-screen"><div className="max-w-[600px]"><Story /></div></div>],
  tags: ['autodocs'],
} satisfies Meta<typeof RadarMapCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const legendItems = [
  { label: 'High Risk', color: '#EF4444' },
  { label: 'Moderate', color: '#F59E0B' },
  { label: 'Low Risk', color: '#22C55E' },
];

export const DoctorDashboardMap: Story = {
  args: { title: 'Live Heatmap', subtitle: 'Real-time disease spread visualization', legendItems },
};

export const AnalyticsRadar: Story = {
  args: {
    title: 'Geographic Radar',
    subtitle: 'Regional disease distribution',
    legendItems: [
      { label: 'COVID-19 Clusters', color: '#EF4444' },
      { label: 'Influenza', color: '#F59E0B' },
      { label: 'Hospital Density', color: '#1D4ED8' },
    ],
    showControls: true,
  },
};

export const WithOverlayPanel: Story = {
  args: {
    title: 'Live Heatmap',
    subtitle: 'Real-time disease spread visualization',
    legendItems,
    showOverlayPanel: true,
    overlayTitle: 'Active Cases',
    overlayItems: [
      { label: 'Influenza A', value: '124', color: '#EF4444' },
      { label: 'COVID-19', value: '89', color: '#F59E0B' },
      { label: 'Dengue', value: '45', color: '#1D4ED8' },
    ],
  },
};

export const WithControls: Story = {
  args: {
    title: 'Live Heatmap',
    subtitle: 'Real-time disease spread visualization',
    legendItems,
    showControls: true,
    showOverlayPanel: true,
    overlayTitle: 'Quick Stats',
    overlayItems: [{ label: 'Active Clusters', value: '12' }, { label: 'Hospitals', value: '8' }],
  },
};

export const WithFooterLegend: Story = {
  args: {
    title: 'Live Heatmap',
    subtitle: 'Real-time disease spread visualization',
    legendItems,
    footerTextLeft: 'Last updated: 2 min ago',
    footerTextRight: 'Data source: Regional Health API',
  },
};
