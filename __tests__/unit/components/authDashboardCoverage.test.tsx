import React from 'react';
import { Text } from 'react-native';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';
import { describe, expect, it, vi } from '@/__tests__/helpers/jestCompat';
import { Login } from '@/components/auth/Login';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { RoleGate } from '@/components/auth/RoleGate';
import { DiseaseBreakdownCard } from '@/components/dashboard/DiseaseBreakdownCard';
import { MapControlButton } from '@/components/dashboard/MapControlButton';
import { MapLegend } from '@/components/dashboard/MapLegend';
import { MiniBarChartCard } from '@/components/dashboard/MiniBarChartCard';
import { MiniMetricCard } from '@/components/dashboard/MiniMetricCard';
import { ProgressMetricRow } from '@/components/dashboard/ProgressMetricRow';
import { RadarMapCard } from '@/components/dashboard/RadarMapCard';
import { RangeSelector } from '@/components/dashboard/RangeSelector';
import { StatCard } from '@/components/dashboard/StatCard';
import { TimeFilterTabs } from '@/components/dashboard/TimeFilterTabs';
import { getAdminSidebarItems } from '@/components/dashboard/adminNavigation';
import { getSystemSidebarItems } from '@/components/dashboard/systemNavigation';
import { AppColors } from '@/constants/theme';

const mockReplace = vi.fn();
const mockPush = vi.fn();
const mockLogin = vi.fn();
const mockRegister = vi.fn();
const mockLogout = vi.fn();
let mockProfile: any = {
  id: 'u1',
  email: 'doctor@example.com',
  fullName: 'Doctor User',
  roles: ['DOCTOR'],
  privileges: ['diagnosis.assist'],
};

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
  router: { replace: mockReplace, push: mockPush },
  Stack: Object.assign(({ children }: { children: React.ReactNode }) => children, {
    Screen: () => null,
  }),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    profile: mockProfile,
    login: mockLogin,
    register: mockRegister,
    logout: mockLogout,
    loading: false,
  }),
}));

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    Feather: ({ name }: { name: string }) => <Text>{name}</Text>,
    MaterialCommunityIcons: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

jest.mock('expo-image', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    Image: () => <View testID="mock-map-image" />,
  };
});

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    __esModule: true,
    default: ({ children }: { children?: React.ReactNode }) => <View>{children}</View>,
    Path: () => <View />,
  };
});

describe('auth and dashboard frontend coverage', () => {
  afterEach(async () => {
    await cleanup();
    vi.clearAllMocks();
    mockProfile = {
      id: 'u1',
      email: 'doctor@example.com',
      fullName: 'Doctor User',
      roles: ['DOCTOR'],
      privileges: ['diagnosis.assist'],
    };
  });

  it('renders RoleGate allowed and fallback states', async () => {
    let screen = await render(
      <RoleGate roles={['DOCTOR']} privileges={['diagnosis.assist']} fallback={<Text>Denied</Text>}>
        <Text>Allowed</Text>
      </RoleGate>
    );

    expect(screen.getByText('Allowed')).toBeTruthy();

    await cleanup();
    mockProfile = { ...mockProfile, roles: ['HOSPITAL_ADMIN'], privileges: [] };
    screen = await render(
      <RoleGate roles={['DOCTOR']} privileges={['diagnosis.assist']} fallback={<Text>Denied</Text>}>
        <Text>Allowed</Text>
      </RoleGate>
    );

    expect(screen.getByText('Denied')).toBeTruthy();
  });

  it('submits login and routes to the profile dashboard', async () => {
    mockLogin.mockResolvedValueOnce({ ...mockProfile, roles: ['SYSTEM_ADMIN'] });

    const screen = await render(<Login />);

    await fireEvent.changeText(screen.getByPlaceholderText('name@hospital.com'), 'admin@example.com');
    await fireEvent.changeText(screen.getByPlaceholderText('********'), 'secret123');
    await fireEvent.press(screen.getByText('Remember me on this device'));
    await fireEvent.press(screen.getByText('Login to the system'));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('admin@example.com', 'secret123'));
    expect(mockReplace).toHaveBeenCalledWith('/system/dashboard');

    await fireEvent.press(screen.getByText('Sign up'));
    expect(mockPush).toHaveBeenCalledWith('/register');
  });

  it('shows login validation when credentials are missing', async () => {
    const screen = await render(<Login />);

    await fireEvent.press(screen.getByText('Login to the system'));

    expect(screen.getByText('Please enter your email and password.')).toBeTruthy();
  });

  it('renders register form and validates required fields', async () => {
    const screen = await render(<RegisterForm />);

    expect(screen.getByText('Create your account')).toBeTruthy();

    await fireEvent.press(screen.getByText('Create account'));

    expect(screen.getByText('Please fill in all required fields.')).toBeTruthy();
  });

  it('renders dashboard components and fires callbacks', async () => {
    const onPress = vi.fn();
    const onChange = vi.fn();

    const screen = await render(
      <>
        <MiniMetricCard label="Cases" value="128" supportingText="Active" trend="+8" trendType="positive" />
        <ProgressMetricRow label="Capacity" valueText="80%" progress={80} />
        <MapLegend orientation="horizontal" items={[{ label: 'High', color: AppColors.status.danger, value: '12' }]} />
        <MapControlButton icon="settings" variant="primary" onPress={onPress} />
        <StatCard
          title="Risk"
          value="High"
          subtitle="Live signal"
          badge="Alert"
          status="danger"
          showProgress
          progressValue={74}
        />
        <StatCard title="Loading" value="..." isLoading />
        <MiniBarChartCard
          title="Trend"
          subtitle="Weekly"
          bars={[{ label: 'Mon', value: 4 }, { label: 'Tue', value: 8, active: true }]}
          listTitle="Diseases"
          listItems={[{ label: 'Sarampion', value: '8' }]}
          buttonLabel="View all"
          onButtonPress={onPress}
        />
        <DiseaseBreakdownCard
          title="Breakdown"
          rows={[{ id: 'r1', label: 'Rubeola', valueText: '12', progress: 44, onPress }]}
          summaryItems={[{ label: 'Total', value: '12' }]}
          buttonLabel="Details"
          onButtonPress={onPress}
        />
        <RangeSelector
          label="Range"
          value="7d"
          onChange={onChange}
          options={[{ label: '7d', value: '7d' }, { label: '30d', value: '30d' }]}
        />
        <TimeFilterTabs
          value="today"
          onChange={onChange}
          options={[{ label: 'Today', value: 'today' }, { label: 'Week', value: 'week' }]}
        />
        <RadarMapCard
          title="Outbreak map"
          subtitle="Hospital radius"
          showHeader
          showOverlayPanel
          overlayTitle="Heat map"
          overlayBadgeLabel="Safe"
          overlayItems={[{ label: 'Sarampion', value: '8', color: AppColors.status.danger }]}
          showControls
          footerTextLeft="Updated"
          footerTextRight="Now"
          mapImageUri="https://example.com/map.png"
          bottomRightActionLabel="More"
          onBottomRightActionPress={onPress}
          pins={[{ id: 'p1', top: '50%', left: '50%', borderColor: AppColors.status.success, onPress }]}
          legendItems={[{ label: 'High', color: AppColors.status.danger }]}
        />
      </>
    );

    expect(screen.getByText('Cases')).toBeTruthy();
    expect(screen.getByText('Outbreak map')).toBeTruthy();
    expect(screen.getByText('Heat map')).toBeTruthy();
    expect(screen.getAllByText('Sarampion').length).toBeGreaterThan(0);

    await fireEvent.press(screen.getByText('View all'));
    await fireEvent.press(screen.getByText('Details'));
    await fireEvent.press(screen.getByText('30d'));
    await fireEvent.press(screen.getByText('Week'));
    await fireEvent.press(screen.getByText('More'));

    expect(onPress).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalled();
  });

  it('builds admin and system navigation items in both languages', () => {
    expect(getAdminSidebarItems('es').map((item) => item.label)).toContain('Recursos');
    expect(getAdminSidebarItems('en').map((item) => item.label)).toContain('Resources');
    expect(getSystemSidebarItems('es').map((item) => item.label)).toContain('Hospitales');
    expect(getSystemSidebarItems('en').map((item) => item.label)).toContain('Hospitals');
  });
});
