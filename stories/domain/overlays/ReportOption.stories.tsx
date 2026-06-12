import { AppColors } from '@/constants/theme';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { ReportOption } from '@/components/overlays/ReportOption';

const meta = {
  title: 'Componentes reutilizables/Overlays/ReportOption',
  component: ReportOption,
  decorators: [(Story) => <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas, maxWidth: 420 }}><Story /></View>],
  tags: ['autodocs'],
} satisfies Meta<typeof ReportOption>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { icon: 'file-text', title: 'Executive summary', description: 'KPIs and priority alerts.', onPress: () => undefined },
};
