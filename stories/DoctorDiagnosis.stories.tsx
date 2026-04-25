import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { DoctorDiagnosis } from '@/components/diagnosis/DoctorDiagnosis';

const meta = {
  title: 'Screens/DoctorDiagnosis',
  component: DoctorDiagnosis,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof DoctorDiagnosis>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
