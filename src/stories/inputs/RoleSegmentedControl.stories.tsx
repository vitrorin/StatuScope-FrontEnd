import type { Meta, StoryObj } from '@storybook/react';
import { RoleSegmentedControl } from '../../components/inputs/RoleSegmentedControl';

const meta = {
  title: 'Inputs/RoleSegmentedControl',
  component: RoleSegmentedControl,
  decorators: [(Story) => <div className="p-6 bg-[#F5F7FB] min-h-screen"><div className="max-w-md"><Story /></div></div>],
  tags: ['autodocs'],
} satisfies Meta<typeof RoleSegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

const roleOptions = [
  { label: 'Doctor', value: 'doctor' },
  { label: 'Administrator', value: 'admin' },
];

export const DoctorSelected: Story = { args: { options: roleOptions, value: 'doctor' } };
export const AdministratorSelected: Story = { args: { options: roleOptions, value: 'admin' } };
