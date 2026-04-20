import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View } from 'react-native';
import { RoleSegmentedControl } from '../../components/inputs/RoleSegmentedControl';

const meta = {
  title: 'Inputs/RoleSegmentedControl',
  component: RoleSegmentedControl,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
        <View style={{ maxWidth: 400 }}>
          <Story />
        </View>
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof RoleSegmentedControl>;

export default meta;

type Story = StoryObj<typeof meta>;

const roleOptions = [
  { label: 'Doctor', value: 'doctor' },
  { label: 'Administrator', value: 'admin' },
];

export const DoctorSelected: Story = {
  args: {
    options: roleOptions,
    value: 'doctor',
  },
};

export const AdministratorSelected: Story = {
  args: {
    options: roleOptions,
    value: 'admin',
  },
};