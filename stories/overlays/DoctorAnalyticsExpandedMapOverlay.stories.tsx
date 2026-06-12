import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { ExpandedMapOverlay } from '@/components/views/doctor/analytics/Sub-funcionalidades/ExpandedMapOverlay';
import { mapImageUri, mapLegendItems, mapPins, overlayActions } from './overlayMocks';

const meta = {
  title: 'Overlays/Doctor/Analytics/ExpandedMapOverlay',
  component: ExpandedMapOverlay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ExpandedMapOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    visible: true,
    title: 'Mapa epidemiologico regional',
    mapImageUri,
    legendItems: mapLegendItems,
    pins: mapPins,
    onClose: overlayActions.close,
  },
};
