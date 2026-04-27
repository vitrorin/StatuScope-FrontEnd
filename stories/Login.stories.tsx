import type { Meta, StoryObj } from '@storybook/react';
import { Login } from '@/components/auth/Login';

const meta = {
  title: 'Views/Auth/Login',
  component: Login,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Login>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
