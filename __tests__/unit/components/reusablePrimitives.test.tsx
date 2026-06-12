import React from 'react';
import { Text, View } from 'react-native';
import { cleanup, fireEvent, render } from '@testing-library/react-native';
import { describe, expect, it, vi } from '@/__tests__/helpers/jestCompat';
import { Button } from '@/components/foundation/Button';
import { SelectableChip } from '@/components/foundation/SelectableChip';
import { EmptyState } from '@/components/feedback/EmptyState';
import { RetryState } from '@/components/feedback/RetryState';
import { SkeletonLine } from '@/components/feedback/SkeletonLine';
import { DetailRow } from '@/components/overlays/DetailRow';
import { InfoTile } from '@/components/overlays/InfoTile';
import { OverlayHeader } from '@/components/overlays/OverlayHeader';
import { OverlayStatCard } from '@/components/overlays/OverlayStatCard';
import { ReportOption } from '@/components/overlays/ReportOption';
import { AlertListOverlay } from '@/components/overlays/AlertListOverlay';
import { FormRow, FormSection, ModalFormActions } from '@/components/forms';
import { ResponsiveTable } from '@/components/tables/ResponsiveTable';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    Feather: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

jest.mock('@/components/overlays/OverlayDialog', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    OverlayDialog: ({ visible, children, testID }: { visible: boolean; children: React.ReactNode; testID?: string }) =>
      visible ? <View testID={testID}>{children}</View> : null,
  };
});

describe('reusable UI primitives', () => {
  afterEach(async () => {
    await cleanup();
  });

  it('renders overlay information primitives', async () => {
    const screen = await render(
      <>
        <OverlayHeader title="Alert Details" eyebrow="Outbreak" subtitle="Live context" />
        <OverlayStatCard label="Cases" value="128" detail="Last 24h" />
        <DetailRow label="Hospital" value="General Hospital" boxed />
        <InfoTile label="Priority" value="High" helper="Review required" />
      </>
    );

    expect(screen.getByText('Alert Details')).toBeTruthy();
    expect(screen.getByText('128')).toBeTruthy();
    expect(screen.getByText('General Hospital')).toBeTruthy();
    expect(screen.getByText('Review required')).toBeTruthy();
  });

  it('fires callbacks from interactive primitives', async () => {
    const onChipPress = vi.fn();
    const onRetry = vi.fn();
    const onReportPress = vi.fn();
    const onSubmit = vi.fn();

    const screen = await render(
      <>
        <SelectableChip label="Critical" selected onPress={onChipPress} />
        <RetryState title="Unavailable" message="Try again" actionLabel="Retry" onRetry={onRetry} />
        <ReportOption title="PDF" description="Download file" icon="file-text" onPress={onReportPress} />
        <ModalFormActions cancelLabel="Cancel" submitLabel="Save" onCancel={vi.fn()} onSubmit={onSubmit} />
      </>
    );

    await fireEvent.press(screen.getByText('Critical'));
    await fireEvent.press(screen.getByText('Retry'));
    await fireEvent.press(screen.getByText('PDF'));
    await fireEvent.press(screen.getByText('Save'));

    expect(onChipPress).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onReportPress).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('renders feedback, form and table primitives', async () => {
    const onRowPress = vi.fn();
    const screen = await render(
      <>
        <EmptyState title="No data" message="Nothing to show" />
        <SkeletonLine width={120} />
        <FormSection title="Patient">
          <FormRow>
            <Button label="Field A" />
            <Text>Field B</Text>
          </FormRow>
        </FormSection>
        <ResponsiveTable
          rows={[{ id: '1', name: 'Hospital General', status: 'Active' }]}
          getRowKey={(row) => row.id}
          onRowPress={onRowPress}
          footer={<Text>Showing 1 row</Text>}
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'status', label: 'Status', render: (row) => <Text>{row.status}</Text> },
          ]}
        />
      </>
    );

    expect(screen.getByText('No data')).toBeTruthy();
    expect(screen.getByText('Patient')).toBeTruthy();
    expect(screen.getByText('Field A')).toBeTruthy();
    expect(screen.getByText('Hospital General')).toBeTruthy();
    expect(screen.getByText('Showing 1 row')).toBeTruthy();

    await fireEvent.press(screen.getByText('Hospital General'));

    expect(onRowPress).toHaveBeenCalledWith({ id: '1', name: 'Hospital General', status: 'Active' }, 0);
  });

  it('selects alerts from AlertListOverlay', async () => {
    const onSelectAlert = vi.fn();
    const alert = { id: 'a1', title: 'Cluster', description: '12 cases', variant: 'warning' as const };
    const screen = await render(
      <AlertListOverlay
        visible
        title="More alerts"
        alerts={[alert]}
        onClose={vi.fn()}
        onSelectAlert={onSelectAlert}
        testID="alerts"
      />
    );

    await fireEvent.press(screen.getByTestId('alerts-item-a1'));

    expect(onSelectAlert).toHaveBeenCalledWith(alert);
  });
});
