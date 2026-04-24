import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { SummaryCountCard } from '../../../components/users/SummaryCountCard';

const meta = {
  title: 'Domain/Users/SummaryCountCard',
  component: SummaryCountCard,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB', flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
        <Story />
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof SummaryCountCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Administrators: Story = {
  args: {
    title: 'Summary Count Card',
    value: '12',
    variant: 'info',
    icon: '👤',
  },
};

export const MedicalStaff: Story = {
  args: {
    title: 'Summary Count Card',
    value: '156',
    variant: 'default',
    icon: '👨‍⚕️',
  },
};

export const InactiveSuspended: Story = {
  args: {
    title: 'Summary Count Card',
    value: '8',
    variant: 'warning',
    icon: '⚠️',
  },
};

export const Default: Story = {
  args: {
    title: 'Summary Count Card',
    value: '176',
    variant: 'neutral',
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Summary Count Card',
    value: '48',
    variant: 'info',
    icon: '🏥',
  },
};
