import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { View, Text } from 'react-native';
import { SectionTitleBlock } from '../../components/layout/SectionTitleBlock';

const meta = {
  title: 'Compositions/SectionTitleBlock',
  component: SectionTitleBlock,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
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
          backgroundColor: '#1D4ED8', 
          paddingHorizontal: 16, 
          paddingVertical: 8, 
          borderRadius: 8 
        }}>
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>Add New</Text>
        </View>
        <View style={{ 
          backgroundColor: '#FFFFFF', 
          paddingHorizontal: 16, 
          paddingVertical: 8, 
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#E5E7EB'
        }}>
          <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500' }}>Export</Text>
        </View>
      </View>
    ),
  },
};
