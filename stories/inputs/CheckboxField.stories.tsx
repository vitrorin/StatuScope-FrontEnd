import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View } from 'react-native';
import { CheckboxField } from '../../components/inputs/CheckboxField';

const meta = {
  title: 'Inputs/CheckboxField',
  component: CheckboxField,
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
} satisfies Meta<typeof CheckboxField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {
  args: {
    label: 'Remember me on this device',
  },
};

export const Checked: Story = {
  args: {
    label: 'Remember me on this device',
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Remember me on this device',
    disabled: true,
  },
};