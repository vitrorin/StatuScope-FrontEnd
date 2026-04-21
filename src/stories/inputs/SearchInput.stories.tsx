import type { Meta, StoryObj } from '@storybook/react';
import { SearchInput } from '../../components/inputs/SearchInput';

const meta = {
  title: 'Inputs/SearchInput',
  component: SearchInput,
  decorators: [(Story) => <div className="p-6 bg-[#F5F7FB] min-h-screen"><div className="max-w-md"><Story /></div></div>],
  tags: ['autodocs'],
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { placeholder: 'Search patients, records...' } };
export const Filled: Story = { args: { placeholder: 'Search patients, records...', value: 'Influenza' } };
export const Disabled: Story = { args: { placeholder: 'Search patients, records...', disabled: true } };
export const DiagnosisCodes: Story = { args: { placeholder: 'Search symptoms, diagnosis codes...' } };
