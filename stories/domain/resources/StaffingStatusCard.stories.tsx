import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { StaffingStatusCard } from '../../../components/resources/StaffingStatusCard';

const meta = {
  title: 'Domain/Resources/StaffingStatusCard',
  component: StaffingStatusCard,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#F5F7FB' }}>
        <Story />
      </View>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof StaffingStatusCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DoctorsOnShift: Story = {
  args: {
    title: 'Staffing Status Card',
    subtitle: 'Doctors On Shift',
    value: '24',
    variant: 'doctor',
  },
};

export const NursesOnShift: Story = {
  args: {
    title: 'Staffing Status Card',
    subtitle: 'Nurses On Shift',
    value: '48',
    variant: 'nurse',
  },
};

export const AvailableSpecialists: Story = {
  args: {
    title: 'Staffing Status Card',
    subtitle: 'Available Specialists',
    value: '12',
    variant: 'specialist',
  },
};

export const Default: Story = {
  args: {
    title: 'Staffing Status Card',
    subtitle: 'Default',
    value: '8',
    variant: 'default',
  },
};
