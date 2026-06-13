import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { DoctorAnalytics } from '@/components/views/doctor/analytics';
import { mockProfiles } from '../.storybook/mocks/AuthContext';
import { withMockProfile } from './viewDecorators';

const meta = {
  title: 'Vistas/Doctor/Analytics',
  component: DoctorAnalytics,
  decorators: [withMockProfile(mockProfiles.doctor)],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof DoctorAnalytics>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
