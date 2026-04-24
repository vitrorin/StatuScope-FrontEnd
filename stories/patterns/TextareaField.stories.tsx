import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View } from 'react-native';
import { TextareaField } from '../../components/inputs/TextareaField';

const meta = {
  title: 'Patterns/TextareaField',
  component: TextareaField,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
        <View style={{ maxWidth: 400 }}>
          <Story />
        </View>
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof TextareaField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    label: 'Symptoms Description',
    placeholder: 'Describe the patient symptoms in detail...',
  },
};

export const Filled: Story = {
  args: {
    label: 'Symptoms Description',
    placeholder: 'Describe the patient symptoms in detail...',
    value: 'Patient presents with persistent cough for 3 days, accompanied by mild fever and fatigue. No shortness of breath reported. Previous medical history includes seasonal allergies.',
  },
};

export const WithError: Story = {
  args: {
    label: 'Symptoms Description',
    placeholder: 'Describe the patient symptoms in detail...',
    value: 'Short text',
    error: 'Please provide a more detailed description of symptoms',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Symptoms Description',
    placeholder: 'Describe the patient symptoms in detail...',
    value: 'Patient presents with persistent cough for 3 days, accompanied by mild fever and fatigue.',
    disabled: true,
  },
};
