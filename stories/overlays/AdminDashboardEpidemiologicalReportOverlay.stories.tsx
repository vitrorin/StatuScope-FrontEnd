import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { EpidemiologicalReportOverlay } from '@/components/views/admin/dashboard/Sub-funcionalidades/EpidemiologicalReportOverlay';
import { overlayActions } from './overlayMocks';

const meta = {
  title: 'Overlays/HospitalAdmin/Dashboard/EpidemiologicalReportOverlay',
  component: EpidemiologicalReportOverlay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof EpidemiologicalReportOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    visible: true,
    onClose: overlayActions.close,
  },
};
