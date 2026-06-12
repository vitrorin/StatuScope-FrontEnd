import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { DoctorDiagnosis } from '@/components/views/doctor/diagnosis';
import { mockProfiles } from '../.storybook/mocks/AuthContext';
import { withMockProfile } from './viewDecorators';

const meta = {
  title: 'Vistas/Doctor/Diagnosis',
  component: DoctorDiagnosis,
  decorators: [withMockProfile(mockProfiles.doctor)],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof DoctorDiagnosis>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
