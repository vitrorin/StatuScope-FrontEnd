import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { ExportReportOverlay } from '@/components/views/admin/dashboard/Sub-funcionalidades/ExportReportOverlay';
import {
  adminDashboardAlert,
  adminDashboardMetric,
  adminDashboardSummary,
  adminDashboardZone,
  overlayActions,
} from './overlayMocks';

const meta = {
  title: 'Overlays/HospitalAdmin/Dashboard/ExportReportOverlay',
  component: ExportReportOverlay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ExportReportOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    visible: true,
    dashboard: adminDashboardSummary,
    metrics: [adminDashboardMetric],
    alerts: [adminDashboardAlert],
    actions: adminDashboardSummary.recommendedActions,
    zones: [adminDashboardZone],
    onClose: overlayActions.close,
  },
};
