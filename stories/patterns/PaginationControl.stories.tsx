import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { PaginationControl } from '../../components/users/PaginationControl';

const meta = {
  title: 'Patterns/PaginationControl',
  component: PaginationControl,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
        <Story />
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof PaginationControl>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Page1: Story = {
  args: {
    currentPage: 1,
    totalPages: 12,
    onPageChange: (page: number) => console.log(`Page changed to ${page}`),
  },
};

export const MiddlePages: Story = {
  args: {
    currentPage: 5,
    totalPages: 12,
    onPageChange: (page: number) => console.log(`Page changed to ${page}`),
  },
};

export const LastPage: Story = {
  args: {
    currentPage: 12,
    totalPages: 12,
    onPageChange: (page: number) => console.log(`Page changed to ${page}`),
  },
};

export const FewPages: Story = {
  args: {
    currentPage: 2,
    totalPages: 4,
    onPageChange: (page: number) => console.log(`Page changed to ${page}`),
  },
};
