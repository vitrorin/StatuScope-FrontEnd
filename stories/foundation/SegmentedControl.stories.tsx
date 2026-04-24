import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { SegmentedControl } from '../../components/foundation/SegmentedControl';

const meta = {
  title: 'Foundation/SegmentedControl',
  component: SegmentedControl,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
        <View style={{ maxWidth: 560 }}>
          <Story />
        </View>
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { label: '24h', value: '24h' },
  { label: '72h', value: '72h' },
  { label: 'Week', value: 'week' },
];

const badgeOptions = [
  { label: 'Active', value: 'active', badgeCount: 5 },
  { label: 'Scheduled', value: 'scheduled', badgeCount: 2 },
  { label: 'Archive', value: 'archive', badgeCount: 0 },
];

export const Default: Story = {
  args: { options, value: '24h' },
};

export const FullWidth: Story = {
  args: {
    options: [
      { label: 'Doctor', value: 'doctor' },
      { label: 'Administrator', value: 'admin' },
    ],
    value: 'doctor',
    fullWidth: true,
  },
};

export const WithBadges: Story = {
  args: { options: badgeOptions, value: 'active' },
};

