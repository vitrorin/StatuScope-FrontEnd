import { AppColors } from '@/constants/theme';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { AlertListOverlay } from '@/components/overlays/AlertListOverlay';

const alerts = [
  { id: 'a1', title: 'Dengue cluster', description: '12 suspected cases near triage.', variant: 'warning' as const },
  { id: 'a2', title: 'ICU pressure', description: 'Capacity crossed local threshold.', variant: 'critical' as const },
];

const meta = {
  title: 'Componentes reutilizables/Overlays/AlertListOverlay',
  component: AlertListOverlay,
  decorators: [(Story) => <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}><Story /></View>],
  tags: ['autodocs'],
} satisfies Meta<typeof AlertListOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    visible: true,
    title: 'More alerts',
    eyebrow: 'Active outbreaks',
    alerts,
    onClose: () => undefined,
    onSelectAlert: () => undefined,
  },
};
