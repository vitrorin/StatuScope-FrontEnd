import { AppColors } from '@/constants/theme';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { PdfPreviewFrame } from '@/components/overlays/PdfPreviewFrame';

const meta = {
  title: 'Componentes reutilizables/Overlays/PdfPreviewFrame',
  component: PdfPreviewFrame,
  decorators: [(Story) => <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}><Story /></View>],
  tags: ['autodocs'],
} satisfies Meta<typeof PdfPreviewFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Fallback: Story = {
  args: { title: 'Report preview', fallbackText: 'A PDF preview appears here when a URL is available.', framed: true },
};
