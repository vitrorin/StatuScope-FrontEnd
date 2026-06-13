import React from 'react';
import { Text } from 'react-native';
import { cleanup, fireEvent, render } from '@testing-library/react-native';
import { describe, expect, it, vi } from '@/__tests__/helpers/jestCompat';
import { Sidebar } from '@/components/Sidebar';
import {
  HIGH_SEVERITY_COLOR,
  HOSPITAL_NODE_COLOR,
  INACTIVE_COLOR,
  LOW_SEVERITY_COLOR,
  MODERATE_SEVERITY_COLOR,
  aggregateOutbreakColor,
  diseaseSeverityColor,
  severityFillColor,
  zoneSeverityColor,
} from '@/lib/dashboardMapColors';
import { AppColors, withAlpha } from '@/constants/theme';

const mockReplace = vi.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    Feather: ({ name }: { name: string }) => <Text>{name}</Text>,
    MaterialCommunityIcons: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

describe('Sidebar', () => {
  afterEach(async () => {
    await cleanup();
    vi.clearAllMocks();
  });

  it('renders localized navigation and routes non-active items', async () => {
    const onLogout = vi.fn();
    const screen = await render(
      <Sidebar
        active="dashboard"
        onLogout={onLogout}
        links={{ dashboard: '/dashboard/doctor', diagnosis: '/diagnosis', analytics: '/analytics' }}
      />
    );

    expect(screen.getByText('StatuScope')).toBeTruthy();

    await fireEvent.press(screen.getByText('Diagnosis'));
    await fireEvent.press(screen.getByText('Log out'));

    expect(mockReplace).toHaveBeenCalledWith('/diagnosis');
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('keeps custom item labels', async () => {
    const screen = await render(
      <Sidebar
        active="users"
        links={{ hospitals: '/system/hospitals' }}
        items={[{
          key: 'hospitals',
          label: 'Hospitals',
          icon: <Text>hospital</Text>,
        }]}
      />
    );

    expect(screen.getByText('Hospitals')).toBeTruthy();
  });
});

describe('dashboard map colors', () => {
  it('maps zone severity from risk, priority and case counts', () => {
    expect(zoneSeverityColor({ id: 'hospital-node' })).toBe(HOSPITAL_NODE_COLOR);
    expect(zoneSeverityColor({ risk: 'critico' })).toBe(HIGH_SEVERITY_COLOR);
    expect(zoneSeverityColor({ risk: 'moderado' })).toBe(MODERATE_SEVERITY_COLOR);
    expect(zoneSeverityColor({ risk: 'rutina' })).toBe(LOW_SEVERITY_COLOR);
    expect(zoneSeverityColor({ priority: 'inmediata' })).toBe(HIGH_SEVERITY_COLOR);
    expect(zoneSeverityColor({ priority: 'elevada' })).toBe(MODERATE_SEVERITY_COLOR);
    expect(zoneSeverityColor({ priority: 'baja' })).toBe(LOW_SEVERITY_COLOR);
    expect(zoneSeverityColor({ cases: '14 casos' })).toBe(MODERATE_SEVERITY_COLOR);
  });

  it('maps aggregate and disease severity colors', () => {
    expect(aggregateOutbreakColor({ outbreakCount: 10 })).toBe(HIGH_SEVERITY_COLOR);
    expect(aggregateOutbreakColor({ caseCount: 30 })).toBe(MODERATE_SEVERITY_COLOR);
    expect(aggregateOutbreakColor({ caseCount: 1 })).toBe(LOW_SEVERITY_COLOR);
    expect(aggregateOutbreakColor({ caseCount: 0, outbreakCount: 0 })).toBe(INACTIVE_COLOR);
    expect(diseaseSeverityColor({ diseaseName: 'Sarampion', caseCount: 25 })).toBe(HIGH_SEVERITY_COLOR);
    expect(diseaseSeverityColor({ diseaseName: 'Varicela', caseCount: 3 })).toBe(LOW_SEVERITY_COLOR);
  });

  it('derives severity fills from semantic colors', () => {
    expect(severityFillColor(HIGH_SEVERITY_COLOR)).toBe(withAlpha(AppColors.status.dangerBright, 0.10));
    expect(severityFillColor(MODERATE_SEVERITY_COLOR)).toBe(withAlpha(AppColors.status.warningBright, 0.10));
    expect(severityFillColor(LOW_SEVERITY_COLOR)).toBe(withAlpha(AppColors.status.successBright, 0.10));
    expect(severityFillColor(HOSPITAL_NODE_COLOR)).toBe(withAlpha(AppColors.brand.primary, 0.10));
    expect(severityFillColor(INACTIVE_COLOR)).toBe(withAlpha(AppColors.text.secondary, 0.04));
  });
});
