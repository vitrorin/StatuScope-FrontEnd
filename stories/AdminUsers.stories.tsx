import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AdminUsers } from '@/components/views/admin/users';
import { mockProfiles } from '../.storybook/mocks/AuthContext';
import { withMockProfile } from './viewDecorators';

const meta = {
  title: 'Vistas/HospitalAdmin/Users',
  component: AdminUsers,
  decorators: [withMockProfile(mockProfiles.hospitalAdmin)],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AdminUsers>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
