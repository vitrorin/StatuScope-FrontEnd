import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View } from 'react-native';
import { SearchInput } from '../../components/inputs/SearchInput';

const meta = {
  title: 'Inputs/SearchInput',
  component: SearchInput,
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
} satisfies Meta<typeof SearchInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Search patients, records...',
  },
};

export const Filled: Story = {
  args: {
    placeholder: 'Search patients, records...',
    value: 'Influenza',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Search patients, records...',
    disabled: true,
  },
};

export const FocusedLike: Story = {
  args: {
    placeholder: 'Search symptoms, diagnosis codes...',
    value: '',
  },
};