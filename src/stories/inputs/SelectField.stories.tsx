import type { Meta, StoryObj } from '@storybook/react';
import { SelectField } from '../../components/inputs/SelectField';

const meta = {
  title: 'Inputs/SelectField',
  component: SelectField,
  decorators: [(Story) => <div className="p-6 bg-[#F5F7FB] min-h-screen"><div className="max-w-md"><Story /></div></div>],
  tags: ['autodocs'],
} satisfies Meta<typeof SelectField>;

export default meta;
type Story = StoryObj<typeof meta>;

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'undisclosed' },
];

export const Default: Story = { args: { label: 'Gender', placeholder: 'Select gender', options: genderOptions } };
export const Selected: Story = { args: { label: 'Gender', placeholder: 'Select gender', value: 'female', options: genderOptions } };
export const Disabled: Story = { args: { label: 'Gender', placeholder: 'Select gender', value: 'male', options: genderOptions, disabled: true } };
export const WithError: Story = { args: { label: 'Gender', placeholder: 'Select gender', options: genderOptions, error: 'Please select a gender option' } };
