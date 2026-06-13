import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { AppColors } from '@/constants/theme';
import { LanguageSwitcher } from '@/components/inputs/LanguageSwitcher';

const meta = {
  title: 'Componentes reutilizables/Inputs/LanguageSwitcher',
  component: LanguageSwitcher,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}>
        <Story />
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof LanguageSwitcher>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
