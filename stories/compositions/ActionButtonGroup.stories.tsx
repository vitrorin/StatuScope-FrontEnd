import { AppColors } from '@/constants/theme';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View } from 'react-native';
import { ActionButtonGroup } from '../../components/diagnosis/ActionButtonGroup';

const meta = {
  title: 'Componentes únicos/Diagnosis/ActionButtonGroup',
  component: ActionButtonGroup,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}>
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
