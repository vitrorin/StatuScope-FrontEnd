import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View } from 'react-native';
import { PatientEvaluationForm } from '../../../components/diagnosis/PatientEvaluationForm';

const meta = {
  title: 'Domain/Diagnosis/PatientEvaluationForm',
  component: PatientEvaluationForm,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
        <Story />
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof PatientEvaluationForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    title: 'Patient Evaluation Form',
    caseMeta: 'Case ID: #2847 • Started 12 min ago',
    dropzoneState: 'empty',
  },
};

export const Filled: Story = {
  args: {
    title: 'Patient Evaluation Form',
    caseMeta: 'Case ID: #2847 • Started 12 min ago',
    ageValue: '34',
    sexValue: 'male',
    postalCodeValue: '10001',
    symptomsValue: 'Patient presents with fever, headache, and muscle aches for the past 3 days.',
    dropzoneState: 'empty',
  },
};

export const WithUploadedFile: Story = {
  args: {
    title: 'Patient Evaluation Form',
    caseMeta: 'Case ID: #2847 • Started 12 min ago',
    ageValue: '34',
    sexValue: 'male',
    postalCodeValue: '10001',
    symptomsValue: 'Patient presents with fever, headache, and muscle aches for the past 3 days.',
    dropzoneState: 'uploaded',
  },
};

export const WithValidationError: Story = {
  args: {
    title: 'Patient Evaluation Form',
    caseMeta: 'Case ID: #2847 • Started 12 min ago',
    dropzoneState: 'error',
  },
};
