import type { Meta, StoryObj } from '@storybook/react';
import { MapLegend } from '../../components/dashboard/MapLegend';

const meta = {
  title: 'Dashboard/MapLegend',
  component: MapLegend,
  decorators: [(Story) => <div className="p-6 bg-[#F5F7FB] min-h-screen"><div className="max-w-xs"><Story /></div></div>],
  tags: ['autodocs'],
} satisfies Meta<typeof MapLegend>;

export default meta;
type Story = StoryObj<typeof meta>;

export const VerticalDefault: Story = {
  args: {
    items: [
      { label: 'COVID-19 Clusters', color: '#EF4444' },
      { label: 'Influenza', color: '#F59E0B' },
      { label: 'Hospital Density', color: '#1D4ED8' },
      { label: 'Low Risk', color: '#22C55E' },
    ],
    orientation: 'vertical',
  },
};

export const HorizontalCompact: Story = {
  args: {
    items: [
      { label: 'High Risk', color: '#EF4444' },
      { label: 'Moderate', color: '#F59E0B' },
      { label: 'Low Risk', color: '#22C55E' },
    ],
    orientation: 'horizontal',
  },
};

export const WithValues: Story = {
  args: {
    items: [
      { label: 'Active Cases', color: '#EF4444', value: '124' },
      { label: 'Suspected', color: '#F59E0B', value: '89' },
      { label: 'Recovered', color: '#22C55E', value: '456' },
    ],
    orientation: 'vertical',
  },
};
