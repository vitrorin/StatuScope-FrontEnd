import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View } from 'react-native';
import { StatusBadge } from '../../components/feedback/StatusBadge';

const meta = {
  title: 'Feedback/StatusBadge',
  component: StatusBadge,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <Story />
        </View>
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof StatusBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Critical: Story = {
  args: {
    label: 'Critical',
    variant: 'critical',
  },
};

export const Stable: Story = {
  args: {
    label: 'Stable',
    variant: 'success',
  },
};

export const HighDemand: Story = {
  args: {
    label: 'High Demand',
    variant: 'warning',
  },
};

export const Active: Story = {
  args: {
    label: 'Active',
    variant: 'success',
  },
};

export const Inactive: Story = {
  args: {
    label: 'Inactive',
    variant: 'neutral',
  },
};

export const Suspended: Story = {
  args: {
    label: 'Suspended',
    variant: 'critical',
  },
};

export const Doctor: Story = {
  args: {
    label: 'Doctor',
    variant: 'role',
  },
};

export const HospitalAdministrator: Story = {
  args: {
    label: 'Hospital Admin',
    variant: 'role',
  },
};

export const Moderate: Story = {
  args: {
    label: 'Moderate',
    variant: 'warning',
  },
};

export const Alert: Story = {
  args: {
    label: 'Alert',
    variant: 'critical',
  },
};

export const Secure: Story = {
  args: {
    label: 'Secure',
    variant: 'success',
  },
};