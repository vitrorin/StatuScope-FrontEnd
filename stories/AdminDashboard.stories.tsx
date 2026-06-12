import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AdminDashboard } from '@/components/views/admin/dashboard';
import { mockProfiles } from '../.storybook/mocks/AuthContext';
import { withMockProfile } from './viewDecorators';

const meta = {
  title: 'Vistas/HospitalAdmin/Dashboard',
  component: AdminDashboard,
  decorators: [withMockProfile(mockProfiles.hospitalAdmin)],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AdminDashboard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
