import type { Meta, StoryObj } from '@storybook/react';
import { InputField } from '../../components/inputs/InputField';

const meta = {
  title: 'Inputs/InputField',
  component: InputField,
  decorators: [(Story) => <div className="p-6 bg-[#F5F7FB] min-h-screen"><div className="max-w-md"><Story /></div></div>],
  tags: ['autodocs'],
} satisfies Meta<typeof InputField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { label: 'Email Address', placeholder: 'Enter your email' } };
export const Password: Story = { args: { label: 'Password', placeholder: 'Enter password', type: 'password' } };
export const WithError: Story = {
  args: { label: 'Email Address', placeholder: 'Enter your email', value: 'invalid-email', error: 'Please enter a valid email address' },
};
export const Disabled: Story = {
  args: { label: 'Email Address', placeholder: 'Enter your email', value: 'doctor@hospital.com', disabled: true },
};
export const Filled: Story = {
  args: { label: 'Email Address', placeholder: 'Enter your email', value: 'dr.chen@statusscope.com' },
};
export const Required: Story = {
  args: { label: 'Patient Name', placeholder: 'Enter patient name', required: true },
};
