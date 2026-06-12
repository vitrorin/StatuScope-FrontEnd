import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AdminAnalytics } from '@/components/views/admin/analytics';
import { mockProfiles } from '../.storybook/mocks/AuthContext';
import { withMockProfile } from './viewDecorators';

const meta = {
  title: 'Vistas/HospitalAdmin/Analytics',
  component: AdminAnalytics,
  decorators: [withMockProfile(mockProfiles.hospitalAdmin)],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AdminAnalytics>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
