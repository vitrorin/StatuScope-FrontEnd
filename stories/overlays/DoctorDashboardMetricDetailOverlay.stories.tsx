import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { MetricDetailOverlay } from '@/components/views/doctor/dashboard/Sub-funcionalidades/MetricDetailOverlay';
import { doctorDashboardMetric, overlayActions } from './overlayMocks';

const meta = {
  title: 'Overlays/Doctor/Dashboard/MetricDetailOverlay',
  component: MetricDetailOverlay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MetricDetailOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    visible: true,
    metric: doctorDashboardMetric,
    onClose: overlayActions.close,
  },
};
