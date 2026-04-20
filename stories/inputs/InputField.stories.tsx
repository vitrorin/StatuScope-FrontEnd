import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View } from 'react-native';
import { InputField } from '../../components/inputs/InputField';

const meta = {
  title: 'Inputs/InputField',
  component: InputField,
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
} satisfies Meta<typeof InputField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
  },
};

export const WithLeftIcon: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    leftIcon: <View style={{ width: 20, height: 20, backgroundColor: '#9CA3AF', borderRadius: 10 }} />,
  },
};

export const Password: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter password',
    type: 'password',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    value: 'invalid-email',
    error: 'Please enter a valid email address',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    value: 'doctor@hospital.com',
    disabled: true,
  },
};

export const Filled: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    value: 'dr.chen@statusscope.com',
  },
};