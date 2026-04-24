import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { InventoryProgressCard } from '../../../components/resources/InventoryProgressCard';

const meta = {
  title: 'Domain/Resources/InventoryProgressCard',
  component: InventoryProgressCard,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
        <Story />
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof InventoryProgressCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NormalStock: Story = {
  args: {
    title: 'Inventory Progress Card',
    valueText: '450/500 units',
    progress: 90,
    statusText: 'Normal stock levels',
    variant: 'normal',
  },
};

export const WarningStock: Story = {
  args: {
    title: 'Inventory Progress Card',
    valueText: '120/200 units',
    progress: 60,
    statusText: 'Reorder soon',
    variant: 'warning',
  },
};

export const CriticalStock: Story = {
  args: {
    title: 'Inventory Progress Card',
    valueText: '25/100 units',
    progress: 25,
    statusText: 'Critical - Order immediately',
    variant: 'critical',
  },
};

export const WithAction: Story = {
  args: {
    title: 'Inventory Progress Card',
    valueText: '80/150 units',
    progress: 53,
    statusText: 'Low stock',
    variant: 'warning',
    actionLabel: 'Reorder',
    onAction: () => console.log('Reorder clicked'),
  },
};
