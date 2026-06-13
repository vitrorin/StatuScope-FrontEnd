import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { SystemUsers } from '@/components/views/system/users';
import { mockProfiles } from '../.storybook/mocks/AuthContext';
import { withMockProfile } from './viewDecorators';

const meta = {
  title: 'Vistas/SystemAdmin/Users',
  component: SystemUsers,
  decorators: [withMockProfile(mockProfiles.systemAdmin)],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SystemUsers>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
