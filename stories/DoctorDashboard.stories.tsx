import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { DoctorDashboard } from '@/components/views/doctor/dashboard';
import { mockProfiles } from '../.storybook/mocks/AuthContext';
import { withMockProfile } from './viewDecorators';

const meta = {
  title: 'Vistas/Doctor/Dashboard',
  component: DoctorDashboard,
  decorators: [withMockProfile(mockProfiles.doctor)],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof DoctorDashboard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
