import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { BedCapacitySummaryCard } from '../../../components/resources/BedCapacitySummaryCard';

const meta = {
  title: 'Domain/Resources/BedCapacitySummaryCard',
  component: BedCapacitySummaryCard,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
        <Story />
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof BedCapacitySummaryCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TotalBeds: Story = {
  args: {
    title: 'Bed Capacity Summary Card',
    value: '156',
    unitText: 'beds',
    trendText: 'Across all departments',
    showProgress: false,
    variant: 'default',
  },
};

export const AvailableBeds: Story = {
  args: {
    title: 'Bed Capacity Summary Card',
    value: '42',
    unitText: 'beds',
    trendText: '+5 from yesterday',
    showProgress: true,
    progressValue: 27,
    variant: 'highlighted',
  },
};

export const OccupiedBeds: Story = {
  args: {
    title: 'Bed Capacity Summary Card',
    value: '114',
    unitText: 'beds',
    trendText: '73% occupancy',
    showProgress: true,
    progressValue: 73,
    variant: 'default',
  },
};

export const CriticalDemand: Story = {
  args: {
    title: 'Bed Capacity Summary Card',
    value: '8',
    unitText: 'available',
    statusText: 'Critical demand',
    showProgress: true,
    progressValue: 92,
    variant: 'critical',
  },
};
