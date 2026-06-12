import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { AppColors } from '@/constants/theme';
import { ActionChipButton } from '@/components/recommendations/ActionChipButton';

const meta = {
  title: 'Componentes únicos/Recommendations/ActionChipButton',
  component: ActionChipButton,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <Story />
        </View>
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof ActionChipButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { label: 'Assign task', variant: 'primary' },
};

export const Secondary: Story = {
  args: { label: 'Notify staff', variant: 'secondary' },
};

export const Ghost: Story = {
  args: { label: 'Dismiss', variant: 'ghost' },
};

export const DangerDisabled: Story = {
  args: { label: 'Archive', variant: 'danger', disabled: true },
};
