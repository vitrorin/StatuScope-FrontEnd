import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View } from 'react-native';
import { ActionButtonGroup } from '../../components/diagnosis/ActionButtonGroup';

const meta = {
  title: 'Compositions/ActionButtonGroup',
  component: ActionButtonGroup,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
        <Story />
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof ActionButtonGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    primaryLabel: 'Confirm Diagnosis',
    secondaryLabel: 'Reject Suggestion',
  },
};

export const DisabledPrimary: Story = {
  args: {
    primaryLabel: 'Confirm Diagnosis',
    secondaryLabel: 'Reject Suggestion',
    primaryDisabled: true,
  },
};

export const DisabledSecondary: Story = {
  args: {
    primaryLabel: 'Confirm Diagnosis',
    secondaryLabel: 'Reject Suggestion',
    secondaryDisabled: true,
  },
};
