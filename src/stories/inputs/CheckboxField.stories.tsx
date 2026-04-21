import type { Meta, StoryObj } from '@storybook/react';
import { CheckboxField } from '../../components/inputs/CheckboxField';

const meta = {
  title: 'Inputs/CheckboxField',
  component: CheckboxField,
  decorators: [(Story) => <div className="p-6 bg-[#F5F7FB] min-h-screen"><div className="max-w-md"><Story /></div></div>],
  tags: ['autodocs'],
} satisfies Meta<typeof CheckboxField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = { args: { label: 'Remember me on this device' } };
export const Checked: Story = { args: { label: 'Remember me on this device', checked: true } };
export const Disabled: Story = { args: { label: 'Remember me on this device', disabled: true } };
export const WithHelperText: Story = {
  args: { label: 'Accept terms and conditions', helperText: 'You must accept to continue.' },
};
