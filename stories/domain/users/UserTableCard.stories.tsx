import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { UserTableCard } from '../../../components/users/UserTableCard';

const meta = {
  title: 'Domain/Users/UserTableCard',
  component: UserTableCard,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
        <Story />
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof UserTableCard>;

export default meta;

type Story = StoryObj<typeof meta>;

const defaultUsers = [
  {
    initials: 'JD',
    name: 'John Doe',
    email: 'john.doe@hospital.org',
    role: 'Doctor',
    pcId: 'PC-001',
    status: 'Active',
    statusVariant: 'success' as const,
  },
  {
    initials: 'SS',
    name: 'Sarah Smith',
    email: 'sarah.smith@hospital.org',
    role: 'Nurse',
    pcId: 'PC-002',
    status: 'Active',
    statusVariant: 'success' as const,
  },
  {
    initials: 'MR',
    name: 'Mike Rodriguez',
    email: 'mike.r@hospital.org',
    role: 'Admin',
    pcId: 'PC-003',
    status: 'Active',
    statusVariant: 'success' as const,
  },
  {
    initials: 'EG',
    name: 'Emily Garcia',
    email: 'emily.g@hospital.org',
    role: 'Specialist',
    pcId: 'PC-004',
    status: 'On Leave',
    statusVariant: 'warning' as const,
  },
];

export const Default: Story = {
  args: {
    title: 'User Table Card',
    users: defaultUsers,
    showPagination: false,
  },
};

export const WithPagination: Story = {
  args: {
    title: 'User Table Card',
    users: defaultUsers,
    showPagination: true,
    currentPage: 1,
    totalPages: 3,
    onPageChange: (page: number) => console.log(`Page changed to ${page}`),
  },
};

export const MixedStatuses: Story = {
  args: {
    title: 'User Table Card',
    users: [
      {
        initials: 'JD',
        name: 'John Doe',
        email: 'john.doe@hospital.org',
        role: 'Doctor',
        pcId: 'PC-001',
        status: 'Active',
        statusVariant: 'success' as const,
      },
      {
        initials: 'AL',
        name: 'Anna Lee',
        email: 'anna.lee@hospital.org',
        role: 'Nurse',
        pcId: 'PC-005',
        status: 'Inactive',
        statusVariant: 'neutral' as const,
      },
      {
        initials: 'BK',
        name: 'Bob Kim',
        email: 'bob.kim@hospital.org',
        role: 'Admin',
        pcId: 'PC-006',
        status: 'Suspended',
        statusVariant: 'warning' as const,
      },
      {
        initials: 'CT',
        name: 'Carol Taylor',
        email: 'carol.t@hospital.org',
        role: 'Specialist',
        pcId: 'PC-007',
        status: 'Active',
        statusVariant: 'info' as const,
      },
    ],
    showPagination: true,
    currentPage: 2,
    totalPages: 5,
  },
};
