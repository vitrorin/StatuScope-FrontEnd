import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AdminRecommendations } from '@/components/views/admin/recommendations';
import { mockProfiles } from '../.storybook/mocks/AuthContext';
import { withMockProfile } from './viewDecorators';

const meta = {
  title: 'Vistas/HospitalAdmin/Recommendations',
  component: AdminRecommendations,
  decorators: [withMockProfile(mockProfiles.hospitalAdmin)],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AdminRecommendations>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
