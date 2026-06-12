import { AppColors } from '@/constants/theme';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Text, View } from 'react-native';
import { ResponsiveTable } from '@/components/tables/ResponsiveTable';

type Row = { id: string; name: string; status: string };

const rows: Row[] = [
  { id: '1', name: 'Hospital General', status: 'Active' },
  { id: '2', name: 'Clinica Norte', status: 'Pending' },
];

const meta = {
  title: 'Componentes reutilizables/Tables/ResponsiveTable',
  component: ResponsiveTable<Row>,
  decorators: [(Story) => <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}><Story /></View>],
  tags: ['autodocs'],
  render: (args) => <ResponsiveTable<Row> {...args} />,
} satisfies Meta<typeof ResponsiveTable<Row>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    rows,
    getRowKey: (row) => row.id,
    columns: [
      { key: 'name', label: 'Name', flex: 2 },
      { key: 'status', label: 'Status', render: (row) => <Text>{row.status}</Text> },
    ],
  },
};

export const Loading: Story = {
  args: {
    rows: [],
    loading: true,
    getRowKey: (row) => row.id,
    columns: [
      { key: 'name', label: 'Name', flex: 2 },
      { key: 'status', label: 'Status' },
    ],
  },
};

export const Empty: Story = {
  args: {
    rows: [],
    emptyTitle: 'No records found',
    emptyMessage: 'Adjust the filters and try again.',
    getRowKey: (row) => row.id,
    columns: [
      { key: 'name', label: 'Name', flex: 2 },
      { key: 'status', label: 'Status' },
    ],
  },
};

export const WithFooter: Story = {
  args: {
    rows,
    getRowKey: (row) => row.id,
    footer: <Text>Showing 1-2 of 2 records</Text>,
    columns: [
      { key: 'name', label: 'Name', flex: 2 },
      { key: 'status', label: 'Status', render: (row) => <Text>{row.status}</Text> },
    ],
  },
};
