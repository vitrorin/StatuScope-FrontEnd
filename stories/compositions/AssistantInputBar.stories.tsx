import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View } from 'react-native';
import { AssistantInputBar } from '../../components/diagnosis/AssistantInputBar';

const meta = {
  title: 'Compositions/AssistantInputBar',
  component: AssistantInputBar,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
        <Story />
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof AssistantInputBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    placeholder: 'Ask AI for further differential diagnosis...',
  },
};

export const Filled: Story = {
  args: {
    placeholder: 'Ask AI for further differential diagnosis...',
    value: 'What are the warning signs to watch for?',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Ask AI for further differential diagnosis...',
    disabled: true,
  },
};

export const WithSendButton: Story = {
  args: {
    placeholder: 'Ask AI for further differential diagnosis...',
    value: 'Tell me more about treatment options',
    showSendButton: true,
  },
};
