import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { AppColors } from '@/constants/theme';
import { RangeSelector } from '@/components/dashboard/RangeSelector';

const rangeOptions = [
  { label: 'Local', value: 'local' },
  { label: 'State', value: 'state' },
  { label: 'National', value: 'national' },
];

const meta = {
  title: 'Componentes únicos/Dashboard/RangeSelector',
  component: RangeSelector,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: AppColors.surface.canvas }}>
        <View style={{ maxWidth: 520 }}>
          <Story />
        </View>
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof RangeSelector>;

export default meta;

type Story = StoryObj<typeof meta>;

export const StateSelected: Story = {
  args: { label: 'Coverage', options: rangeOptions, value: 'state' },
};

export const LocalSelected: Story = {
  args: { label: 'Coverage', options: rangeOptions, value: 'local' },
};
