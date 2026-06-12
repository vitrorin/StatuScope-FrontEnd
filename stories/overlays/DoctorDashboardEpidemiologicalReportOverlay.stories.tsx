import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { EpidemiologicalReportOverlay } from '@/components/views/doctor/dashboard/Sub-funcionalidades/EpidemiologicalReportOverlay';
import { overlayActions, reportSection } from './overlayMocks';

const meta = {
  title: 'Overlays/Doctor/Dashboard/EpidemiologicalReportOverlay',
  component: EpidemiologicalReportOverlay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof EpidemiologicalReportOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    visible: true,
    hospitalName: 'Hospital Metropolitano',
    generatedAt: '2026-06-11T18:00:00Z',
    radiusKm: 8,
    localSection: reportSection,
    stateSection: {
      ...reportSection,
      title: 'Resumen epidemiologico estatal',
    },
    onClose: overlayActions.close,
  },
};
