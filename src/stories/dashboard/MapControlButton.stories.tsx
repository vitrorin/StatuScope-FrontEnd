import type { Meta, StoryObj } from '@storybook/react';
import { MapControlButton } from '../../components/dashboard/MapControlButton';

const meta = {
  title: 'Dashboard/MapControlButton',
  component: MapControlButton,
  decorators: [(Story) => <div className="p-6 bg-[#F5F7FB] min-h-screen flex flex-row gap-3"><Story /></div>],
  tags: ['autodocs'],
} satisfies Meta<typeof MapControlButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Plus: Story = { args: { icon: '+', variant: 'default' } };
export const Minus: Story = { args: { icon: '−', variant: 'default' } };
export const Target: Story = { args: { icon: '◎', variant: 'default' } };
export const Primary: Story = { args: { icon: '+', variant: 'primary' } };
export const Ghost: Story = { args: { icon: '+', variant: 'ghost' } };
export const Disabled: Story = { args: { icon: '+', variant: 'default', disabled: true } };
