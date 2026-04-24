import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View } from 'react-native';
import { DiagnosisChatBubble } from '../../../components/diagnosis/DiagnosisChatBubble';

const meta = {
  title: 'Domain/Diagnosis/DiagnosisChatBubble',
  component: DiagnosisChatBubble,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
        <Story />
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof DiagnosisChatBubble>;

export default meta;

type Story = StoryObj<typeof meta>;

export const UserPrompt: Story = {
  args: {
    message: 'Patient has been experiencing high fever for 3 days',
    sender: 'user',
  },
};

export const AssistantReply: Story = {
  args: {
    message: 'Based on the symptoms described, I recommend running a complete blood count and checking for viral markers.',
    sender: 'assistant',
  },
};

export const LongUserPrompt: Story = {
  args: {
    message: 'A 45-year-old male presented with severe headache, fever of 39°C, and rash starting on the face and spreading to the body. Symptoms began 5 days ago after returning from a tropical region.',
    sender: 'user',
  },
};

export const CompactAssistant: Story = {
  args: {
    message: 'Dengue is a strong possibility.',
    sender: 'assistant',
    compact: true,
  },
};
