import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { SystemDashboard } from '@/components/views/system/dashboard';
import { mockProfiles } from '../.storybook/mocks/AuthContext';
import { withMockProfile } from './viewDecorators';

const meta = {
  title: 'Vistas/SystemAdmin/Dashboard',
  component: SystemDashboard,
  decorators: [withMockProfile(mockProfiles.systemAdmin)],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SystemDashboard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
