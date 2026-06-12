import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppColors } from '@/constants/theme';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const sidebarItems = [
  {
    key: 'dashboard' as const,
    label: 'Dashboard',
    icon: <MaterialCommunityIcons name="view-grid-outline" size={18} color={AppColors.text.body} />,
  },
  {
    key: 'analytics' as const,
    label: 'Analytics',
    icon: <Feather name="bar-chart-2" size={18} color={AppColors.text.body} />,
  },
  {
    key: 'resources' as const,
    label: 'Resources',
    icon: <Feather name="package" size={18} color={AppColors.text.body} />,
  },
];

const meta = {
  title: 'Componentes reutilizables/Layout/DashboardLayout',
  component: DashboardLayout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DashboardLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AdminShell: Story = {
  args: {
    active: 'dashboard',
    sectionLabel: 'Admin Dashboard',
    userName: 'Mariana Lopez',
    userId: 'ADM-2048',
    avatarText: 'ML',
    sidebarItems,
    children: (
      <View style={{ flex: 1, padding: 24, gap: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: AppColors.text.primary }}>
          Dashboard content
        </Text>
        <View
          style={{
            borderRadius: 14,
            borderWidth: 1,
            borderColor: AppColors.border.default,
            backgroundColor: AppColors.surface.card,
            padding: 20,
          }}
        >
          <Text style={{ fontSize: 14, lineHeight: 20, color: AppColors.text.body }}>
            The layout combines sidebar navigation, top header identity, and the routed content area.
          </Text>
        </View>
      </View>
    ),
  },
};
