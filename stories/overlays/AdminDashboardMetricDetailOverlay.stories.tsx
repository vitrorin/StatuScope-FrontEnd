import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { MetricDetailOverlay } from '@/components/views/admin/dashboard/Sub-funcionalidades/MetricDetailOverlay';
import { adminDashboardMetric, overlayActions } from './overlayMocks';

const meta = {
  title: 'Overlays/HospitalAdmin/Dashboard/MetricDetailOverlay',
  component: MetricDetailOverlay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MetricDetailOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    visible: true,
    metric: adminDashboardMetric,
    onClose: overlayActions.close,
  },
};
