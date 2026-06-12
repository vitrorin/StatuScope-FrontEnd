import { AppColors } from '@/constants/theme';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Text, View } from 'react-native';
import { OverlayDialog } from '@/components/overlays/OverlayDialog';
import { OverlayHeader } from '@/components/overlays/OverlayHeader';

const meta = {
  title: 'Componentes reutilizables/Overlays/OverlayDialog',
  component: OverlayDialog,
  decorators: [(Story) => <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}><Story /></View>],
  tags: ['autodocs'],
  render: (args) => (
    <OverlayDialog {...args}>
      <OverlayHeader title="Dialog title" eyebrow="StatusScope" onClose={() => undefined} />
      <Text>Mock overlay content.</Text>
    </OverlayDialog>
  ),
} satisfies Meta<typeof OverlayDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: { visible: true, onClose: () => undefined, size: 'md' },
};
