import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { TableRow } from '../../../components/resources/TableRow';

const meta = {
  title: 'Domain/Resources/TableRow',
  component: TableRow,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' }}>
          <Story />
        </View>
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof TableRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CriticalStatus: Story = {
  args: {
    title: 'Table Row',
    subtitle: 'Critical Status',
    total: '20',
    occupied: '17',
    utilization: '85%',
    statusLabel: 'CRITICAL',
    statusVariant: 'critical',
  },
};

export const WarningStatus: Story = {
  args: {
    title: 'Table Row',
    subtitle: 'Warning Status',
    total: '35',
    occupied: '27',
    utilization: '77%',
    statusLabel: 'WARNING',
    statusVariant: 'warning',
  },
};

export const StableStatus: Story = {
  args: {
    title: 'Table Row',
    subtitle: 'Stable Status',
    total: '65',
    occupied: '47',
    utilization: '72%',
    statusLabel: 'STABLE',
    statusVariant: 'success',
  },
};

export const WithAction: Story = {
  args: {
    title: 'Table Row',
    subtitle: 'With Action',
    total: '25',
    occupied: '15',
    utilization: '60%',
    statusLabel: 'STABLE',
    statusVariant: 'success',
    actionLabel: 'View Details',
    onAction: () => console.log('View details clicked'),
  },
};
