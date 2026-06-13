import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { DiseaseDetailOverlay } from '@/components/views/doctor/analytics/Sub-funcionalidades/DiseaseDetailOverlay';
import { analyticsDisease, overlayActions } from './overlayMocks';

const meta = {
  title: 'Overlays/Doctor/Analytics/DiseaseDetailOverlay',
  component: DiseaseDetailOverlay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DiseaseDetailOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    visible: true,
    disease: analyticsDisease,
    onClose: overlayActions.close,
  },
};
