import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { SystemHospitals } from '@/components/views/system/hospitals';
import { mockProfiles } from '../.storybook/mocks/AuthContext';
import { withMockProfile } from './viewDecorators';

const meta = {
  title: 'Vistas/SystemAdmin/Hospitals',
  component: SystemHospitals,
  decorators: [withMockProfile(mockProfiles.systemAdmin)],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SystemHospitals>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
