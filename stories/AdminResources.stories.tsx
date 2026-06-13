import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AdminResources } from '@/components/views/admin/resources';
import { mockProfiles } from '../.storybook/mocks/AuthContext';
import { withMockProfile } from './viewDecorators';

const meta = {
  title: 'Vistas/HospitalAdmin/Resources',
  component: AdminResources,
  decorators: [withMockProfile(mockProfiles.hospitalAdmin)],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AdminResources>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
