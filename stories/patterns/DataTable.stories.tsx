import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Text, View } from 'react-native';
import { DataTable } from '../../components/resources/DataTable';

const meta = {
  title: 'Patterns/DataTable',
  component: DataTable,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
        <Story />
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof DataTable>;

export default meta;

type Story = StoryObj<typeof meta>;

const defaultColumns = [
  { key: 'department', label: 'Department' },
  { key: 'total', label: 'Total', align: 'right' as const },
  { key: 'available', label: 'Available', align: 'right' as const },
  { key: 'occupied', label: 'Occupied', align: 'right' as const },
  { key: 'utilization', label: 'Utilization', align: 'right' as const },
];

const defaultRows = [
  { department: 'Intensive Care (ICU)', total: '20', available: '3', occupied: '17', utilization: '85%' },
  { department: 'Emergency Dept (ED)', total: '35', available: '8', occupied: '27', utilization: '77%' },
  { department: 'General Ward', total: '65', available: '18', occupied: '47', utilization: '72%' },
  { department: 'Pediatrics', total: '25', available: '10', occupied: '15', utilization: '60%' },
  { department: 'Maternity', total: '15', available: '5', occupied: '10', utilization: '67%' },
];

export const Default: Story = {
  args: {
    columns: defaultColumns,
    rows: defaultRows,
    compact: false,
  },
};

export const Compact: Story = {
  args: {
    columns: defaultColumns,
    rows: defaultRows,
    compact: true,
  },
};

export const WithStatusBadges: Story = {
  args: {
    columns: [
      { key: 'department', label: 'Department' },
      { key: 'status', label: 'Status' },
      { key: 'beds', label: 'Beds', align: 'right' as const },
    ],
    rows: [
      { 
        department: 'Intensive Care (ICU)', 
        status: <Text style={{ fontSize: 10, fontWeight: '600', color: '#DC2626', backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>CRITICAL</Text>,
        beds: '17/20' 
      },
      { 
        department: 'Emergency Dept (ED)', 
        status: <Text style={{ fontSize: 10, fontWeight: '600', color: '#D97706', backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>WARNING</Text>,
        beds: '27/35' 
      },
      { 
        department: 'General Ward', 
        status: <Text style={{ fontSize: 10, fontWeight: '600', color: '#16A34A', backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>STABLE</Text>,
        beds: '47/65' 
      },
    ],
    compact: false,
  },
};

export const WithActions: Story = {
  args: {
    columns: [
      { key: 'name', label: 'Resource' },
      { key: 'type', label: 'Type' },
      { key: 'actions', label: 'Actions', align: 'center' as const },
    ],
    rows: [
      { 
        name: 'MRI Scanner A', 
        type: 'Equipment',
        actions: <Text style={{ fontSize: 12, color: '#1D4ED8', fontWeight: '500' }}>View</Text>
      },
      { 
        name: 'X-Ray Unit B', 
        type: 'Equipment',
        actions: <Text style={{ fontSize: 12, color: '#1D4ED8', fontWeight: '500' }}>View</Text>
      },
      { 
        name: 'Lab Analyzer', 
        type: 'Equipment',
        actions: <Text style={{ fontSize: 12, color: '#1D4ED8', fontWeight: '500' }}>View</Text>
      },
    ],
    compact: false,
  },
};
