import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { withMockProfile } from './viewDecorators';

const meta = {
  title: 'Vistas/Auth/Register',
  component: RegisterForm,
  decorators: [withMockProfile(null)],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof RegisterForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
