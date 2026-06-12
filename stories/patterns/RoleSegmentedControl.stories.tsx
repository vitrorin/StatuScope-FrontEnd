import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { AppColors } from '@/constants/theme';
import { RoleSegmentedControl } from '@/components/inputs/RoleSegmentedControl';

const roleOptions = [
  { label: 'Doctor', value: 'doctor' },
  { label: 'Admin', value: 'admin' },
  { label: 'System', value: 'system' },
];

const meta = {
  title: 'Componentes reutilizables/Inputs/RoleSegmentedControl',
  component: RoleSegmentedControl,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}>
        <View style={{ maxWidth: 560 }}>
          <Story />
        </View>
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof RoleSegmentedControl>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DoctorSelected: Story = {
  args: { label: 'Role', options: roleOptions, value: 'doctor' },
};

export const AdminSelected: Story = {
  args: { label: 'Role', options: roleOptions, value: 'admin' },
};
