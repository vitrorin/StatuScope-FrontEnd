import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View } from 'react-native';
import { SelectField } from '../../components/inputs/SelectField';

const meta = {
  title: 'Inputs/SelectField',
  component: SelectField,
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
} satisfies Meta<typeof SelectField>;

export default meta;

type Story = StoryObj<typeof meta>;

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'undisclosed' },
];

export const Default: Story = {
  args: {
    label: 'Gender',
    placeholder: 'Select gender',
    options: genderOptions,
  },
};

export const Selected: Story = {
  args: {
    label: 'Gender',
    placeholder: 'Select gender',
    value: 'female',
    options: genderOptions,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Gender',
    placeholder: 'Select gender',
    value: 'male',
    options: genderOptions,
    disabled: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'Gender',
    placeholder: 'Select gender',
    options: genderOptions,
    error: 'Please select a gender option',
  },
};