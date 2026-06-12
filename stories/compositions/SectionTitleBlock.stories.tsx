import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AppColors } from '@/constants/theme';

import { View, Text } from 'react-native';
import { SectionTitleBlock } from '../../components/layout/SectionTitleBlock';

const meta = {
  title: 'Componentes reutilizables/Layout/SectionTitleBlock',
  component: SectionTitleBlock,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.page }}>
        <Story />
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof SectionTitleBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {
    title: 'Section Title Block',
  },
};

export const WithSubtitle: Story = {
  args: {
    title: 'Section Title Block',
    subtitle: 'With Subtitle',
  },
};

export const WithEyebrow: Story = {
  args: {
    eyebrow: 'Analytics',
    title: 'Section Title Block',
    subtitle: 'With Eyebrow',
  },
};

export const WithActions: Story = {
  args: {
    eyebrow: 'Dashboard',
    title: 'Section Title Block',
    subtitle: 'With Actions',
    rightSlot: (
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{
          backgroundColor: AppColors.brand.link,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 8,
        }}>
          <Text style={{ color: AppColors.surface.card, fontSize: 14, fontWeight: '600' }}>Add New</Text>
        </View>
        <View style={{
          backgroundColor: AppColors.surface.card,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: AppColors.border.muted,
        }}>
          <Text style={{ color: AppColors.text.body, fontSize: 14, fontWeight: '500' }}>Export</Text>
        </View>
      </View>
    ),
  },
};
