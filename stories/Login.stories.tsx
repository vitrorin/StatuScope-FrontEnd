import type { Meta, StoryObj } from '@storybook/react';
import { Login } from '@/components/auth/Login';
import { withMockProfile } from './viewDecorators';

const meta = {
  title: 'Vistas/Auth/Login',
  component: Login,
  decorators: [withMockProfile(null)],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Login>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
