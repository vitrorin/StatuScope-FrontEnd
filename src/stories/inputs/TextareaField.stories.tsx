import type { Meta, StoryObj } from '@storybook/react';
import { TextareaField } from '../../components/inputs/TextareaField';

const meta = {
  title: 'Inputs/TextareaField',
  component: TextareaField,
  decorators: [(Story) => <div className="p-6 bg-[#F5F7FB] min-h-screen"><div className="max-w-md"><Story /></div></div>],
  tags: ['autodocs'],
} satisfies Meta<typeof TextareaField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { label: 'Symptoms Description', placeholder: 'Describe the patient symptoms in detail...' },
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
