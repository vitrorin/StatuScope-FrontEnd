import React from 'react';
import { Text } from 'react-native';
import { cleanup, fireEvent, render } from '@testing-library/react-native';
import { describe, expect, it, vi } from '@/__tests__/helpers/jestCompat';
import { ThemedText } from '@/components/themed-text';
import { Avatar } from '@/components/foundation/Avatar';
import { Badge } from '@/components/foundation/Badge';
import { SegmentedControl } from '@/components/foundation/SegmentedControl';
import { SelectableChip } from '@/components/foundation/SelectableChip';
import { AlertCard } from '@/components/feedback/AlertCard';
import { DetectionBanner } from '@/components/feedback/DetectionBanner';
import { EmptyState } from '@/components/feedback/EmptyState';
import { InlineWarningBanner } from '@/components/feedback/InlineWarningBanner';
import { RetryState } from '@/components/feedback/RetryState';
import { SkeletonBlock } from '@/components/feedback/SkeletonBlock';
import { StatusBadge } from '@/components/feedback/StatusBadge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SectionTitleBlock } from '@/components/layout/SectionTitleBlock';
import { FormRow, FormSection } from '@/components/forms';
import { DetailRow } from '@/components/overlays/DetailRow';
import { InfoTile } from '@/components/overlays/InfoTile';
import { OverlayDialog } from '@/components/overlays/OverlayDialog';
import { OverlayHeader } from '@/components/overlays/OverlayHeader';
import { OverlayStatCard } from '@/components/overlays/OverlayStatCard';
import { ReportOption } from '@/components/overlays/ReportOption';
import { AlertListOverlay } from '@/components/overlays/AlertListOverlay';
import { AssistantInputBar } from '@/components/diagnosis/AssistantInputBar';
import { AssistantSuggestionsList } from '@/components/diagnosis/AssistantSuggestionsList';
import { RecommendedTestsCard } from '@/components/diagnosis/RecommendedTestsCard';
import { InputField } from '@/components/inputs/InputField';
import { LanguageSwitcher } from '@/components/inputs/LanguageSwitcher';
import { SelectField } from '@/components/inputs/SelectField';
import { TextAreaField } from '@/components/inputs/TextAreaField';
import { DiseaseBreakdownCard } from '@/components/dashboard/DiseaseBreakdownCard';
import { MiniMetricCard } from '@/components/dashboard/MiniMetricCard';
import { StatCard } from '@/components/dashboard/StatCard';
import { MetaInfoRow } from '@/components/recommendations/MetaInfoRow';
import { RecommendationCard } from '@/components/recommendations/RecommendationCard';
import { StaffingStatusCard } from '@/components/resources/StaffingStatusCard';
import { ResponsiveTable } from '@/components/tables/ResponsiveTable';
import { SummaryCountCard } from '@/components/users/SummaryCountCard';
import { UserAvatarBadge } from '@/components/users/UserAvatarBadge';
import { AppColors } from '@/constants/theme';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    Feather: ({ name }: { name: string }) => <Text>{name}</Text>,
    MaterialCommunityIcons: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

jest.mock('@/components/Sidebar', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    Sidebar: ({ onLogout }: { onLogout?: () => void }) => (
      <Text onPress={onLogout}>Sidebar mock</Text>
    ),
  };
});

describe('component coverage gaps', () => {
  afterEach(async () => {
    await cleanup();
  });

  it('covers default visual variants and conditional text branches', async () => {
    const screen = await render(
      <>
        <ThemedText>Default text</ThemedText>
        <ThemedText type="defaultSemiBold">Semi text</ThemedText>
        <ThemedText type="subtitle">Subtitle text</ThemedText>
        <ThemedText type="link">Link text</ThemedText>
        <Avatar initials="DF" />
        <Badge label="Default badge" />
        <Badge label="High badge" tone="high" />
        <Badge label="Medium badge" tone="medium" />
        <Badge label="Low badge" tone="low" />
        <StatusBadge label="Default status" />
        <EmptyState
          title="Plain empty"
          message="There is nothing here"
          icon={<Text>empty-icon</Text>}
          action={<Text>empty-action</Text>}
        />
        <SkeletonBlock rows={3} testID="skeleton-with-rows" />
        <SectionTitleBlock title="Only title" />
        <SectionTitleBlock
          eyebrow="Eyebrow"
          title="Full section"
          subtitle="Subtitle text"
          rightSlot={<Text>Section action</Text>}
        />
        <FormSection>
          <FormRow columns={1}>
            <Text>Single column child</Text>
          </FormRow>
        </FormSection>
        <FormSection description="Only description">
          <Text>Description child</Text>
        </FormSection>
      </>
    );

    expect(screen.getByText('Default text')).toBeTruthy();
    expect(screen.getByText('High badge')).toBeTruthy();
    expect(screen.getByText('Default status')).toBeTruthy();
    expect(screen.getByText('Single column child')).toBeTruthy();
    expect(screen.getByTestId('skeleton-with-rows')).toBeTruthy();
  });

  it('covers feedback and overlay optional branches', async () => {
    const onClose = vi.fn();
    const onPress = vi.fn();
    const alert = { id: 'a2', title: 'No severity alert', description: 'Uses fallback variant' };

    const screen = await render(
      <>
        <AlertCard title="Default alert" description="No variant" />
        <AlertCard title="Success alert" description="Ok" variant="success" metadata="Synced" />
        <DetectionBanner message="Plain detection" />
        <DetectionBanner message="No action detection" variant="critical" />
        <InlineWarningBanner title="Warning title" message="Warning message" />
        <InlineWarningBanner title="Info title" message="Info message" variant="info" />
        <InlineWarningBanner message="No title critical" variant="critical" />
        <RetryState title="Retry without action" message="Passive state" actionLabel="Retry" onRetry={onPress} />
        <RetryState actionLabel="Compact retry" onRetry={onPress} compact />
        <RetryState title="Retry with action" message="Active state" actionLabel="Try again" onRetry={onPress} />
        <DetailRow label="Plain row" value="Value" />
        <DetailRow label="Custom row" value={<Text>Custom value</Text>} boxed />
        <DetailRow label="Muted row" value="Muted" tone="muted" />
        <DetailRow label="Strong row" value="Strong" tone="strong" />
        <InfoTile label="Info no helper" value="42" />
        <OverlayHeader title="Header no close" />
        <OverlayHeader
          title="Header with controls"
          eyebrow="Context"
          subtitle="Subtitle"
          icon={<Text>header-icon</Text>}
          onClose={onClose}
          onBack={onPress}
          testID="overlay-header"
        />
        <OverlayStatCard label="Default stat" value="100" />
        <OverlayStatCard
          label="Value first stat"
          value="300"
          valueFirst
          showAccentBar={false}
          valueNumberOfLines={1}
        />
        <OverlayStatCard label="Critical stat" value="200" accentColor={AppColors.status.danger} detail="Detail" />
        <ReportOption title="Disabled report" description="Locked" icon="file" disabled onPress={onPress} />
        <OverlayDialog
          visible
          onClose={onClose}
          size="sm"
          footer={<Text>Footer actions</Text>}
          testID="overlay-actual"
        >
          <Text>Overlay body</Text>
        </OverlayDialog>
        <AlertListOverlay
          visible
          title="Fallback alerts"
          alerts={[alert]}
          onClose={onClose}
          onSelectAlert={onPress}
          testID="fallback-alerts"
        />
      </>
    );

    expect(screen.getByText('Default alert')).toBeTruthy();
    expect(screen.getByText('Info title')).toBeTruthy();
    expect(screen.getByText('Footer actions')).toBeTruthy();

    await fireEvent.press(screen.getByText('Retry with action'));
    await fireEvent.press(screen.getByTestId('overlay-header-back'));
    await fireEvent.press(screen.getByTestId('overlay-header-close'));
    await fireEvent.press(screen.getByTestId('overlay-actual-backdrop'));
    await fireEvent.press(screen.getByTestId('fallback-alerts-item-a2'));

    expect(onClose).toHaveBeenCalled();
    expect(onPress).toHaveBeenCalled();
  });

  it('covers input and diagnosis interaction branches', async () => {
    const onChange = vi.fn();
    const onSend = vi.fn();

    const screen = await render(
      <>
        <InputField
          label="Required input"
          required
          value=""
          leftIcon={<Text>left</Text>}
          labelAccessory={<Text>accessory</Text>}
          onFocus={onChange}
          onBlur={onChange}
          onChangeText={onChange}
          maxLength={20}
        />
        <InputField label="Toggle password" type="password" value="secret" />
        <TextAreaField label="Plain area" placeholder="Describe more" hint="Helpful hint" onChangeText={onChange} />
        <TextAreaField label="Error area" value="bad" error="Too short" />
        <LanguageSwitcher />
        <SelectField
          label="Open select"
          testID="open-select"
          placeholder="Choose status"
          options={[
            { label: 'Open', value: 'open' },
            { label: 'Closed', value: 'closed' },
          ]}
          onChange={onChange}
        />
        <SelectField
          testID="selected-select"
          value="open"
          options={[
            { label: 'Open', value: 'open' },
            { label: 'Closed', value: 'closed' },
          ]}
          onChange={onChange}
        />
        <AssistantInputBar value="" onSendPress={onSend} />
        <AssistantInputBar value="Disabled prompt" disabled onSendPress={onSend} />
        <AssistantInputBar value="No button" showSendButton={false} />
        <AssistantSuggestionsList
          suggestions={[
            {
              id: 's3',
              displayName: 'Unknown disease',
              confidence: Number.NaN,
              rationale: 'Needs review',
              rankOrder: 3,
              localityRiskLevel: undefined,
              diseaseId: null,
              primary: false,
            },
            {
              id: undefined,
              displayName: 'Ordered disease',
              confidence: null,
              rationale: null,
              rankOrder: 1,
              localityRiskLevel: null,
              diseaseId: null,
              primary: true,
            },
          ]}
        />
        <RecommendedTestsCard title="Custom tests" tests={[{ label: 'CBC' }]} />
      </>
    );

    await fireEvent(screen.getAllByDisplayValue('')[0], 'focus');
    await fireEvent(screen.getAllByDisplayValue('')[0], 'blur');
    await fireEvent(screen.getByPlaceholderText('Describe more'), 'focus');
    await fireEvent(screen.getByPlaceholderText('Describe more'), 'blur');
    await fireEvent.press(screen.getByText('eye-off'));
    await fireEvent.press(screen.getByTestId('open-select-button'));
    await fireEvent.press(screen.getByTestId('open-select-button'));
    await fireEvent.press(screen.getByTestId('open-select-button'));
    await fireEvent.press(screen.getByTestId('open-select-backdrop'));
    await fireEvent.press(screen.getByTestId('open-select-button'));
    await fireEvent.press(screen.getByTestId('open-select-option-closed'));
    await fireEvent.press(screen.getByTestId('selected-select-button'));
    await fireEvent.press(screen.getByTestId('selected-select-option-open'));
    await fireEvent.press(screen.getAllByText('send')[0]);

    expect(onChange).toHaveBeenCalled();
    expect(onSend).not.toHaveBeenCalled();
    expect(screen.getByText('Custom tests')).toBeTruthy();
  });

  it('covers dashboard, table, recommendation and user branches', async () => {
    const onPress = vi.fn();
    const onRowPress = vi.fn();
    const onLogout = vi.fn();

    const screen = await render(
      <>
        <DashboardLayout userName="Default User" onLogout={onLogout}>
          <Text>Default layout child</Text>
        </DashboardLayout>
        <DiseaseBreakdownCard
          title="Disease rows"
          rows={[
            { label: 'A', valueText: '10', progress: 40, onPress },
            { label: 'B', valueText: '5', progress: 20 },
          ]}
          summaryItems={[{ label: 'Total', value: '15', valueColor: AppColors.status.danger }]}
          buttonLabel="More"
          onButtonPress={onPress}
        />
        <MiniMetricCard label="Neutral mini" value="8" />
        <MiniMetricCard label="Danger mini" value="2" trendType="danger" trend="Down" />
        <StatCard title="Loading stat" value="-" isLoading badge="Soon" status="positive" />
        <StatCard title="Danger stat" value="12" status="danger" badge="High" icon={<Text>icon</Text>} />
        <StatCard title="Warning stat" value="6" status="warning" trendText="Up" showProgress progressValue={45} />
        <MetaInfoRow compact items={[{ label: 'Clock', icon: <Text>clock</Text> }, { label: 'No icon' }]} />
        <RecommendationCard
          severity="medium"
          category="Medical"
          title="No meta recommendation"
          description="Description"
          actions={[]}
        />
        <StaffingStatusCard
          title="Default staff"
          value="7"
          icon={<Text>staff-icon</Text>}
          highlightColor={AppColors.status.info}
          valueColor={AppColors.status.infoDark}
          iconBackgroundColor={AppColors.status.infoSoft}
        />
        <ResponsiveTable
          loading
          rows={[]}
          getRowKey={(row: { id: string }) => row.id}
          columns={[
            { key: 'name', label: 'Name', align: 'center', minWidth: 120 },
            { key: 'status', label: 'Status', align: 'right', width: 100 },
          ]}
        />
        <ResponsiveTable
          rows={[]}
          emptyTitle="Nothing"
          emptyMessage="No rows"
          getRowKey={(row: { id: string }) => row.id}
          columns={[{ key: 'name', label: 'Name' }]}
        />
        <ResponsiveTable
          rows={[{ id: '1', name: 'Row A' }, { id: '2', name: 'Row B' }]}
          getRowKey={(row) => row.id}
          onRowPress={onRowPress}
          rowStyle={(_, index) => index === 1 ? { opacity: 0.5 } : undefined}
          columns={[{ key: 'name', label: 'Name' }]}
        />
        <SummaryCountCard title="Info summary" value="9" variant="info" icon={<Text>i</Text>} />
        <UserAvatarBadge initials="US" />
      </>
    );

    expect(screen.getByText('Default layout child')).toBeTruthy();
    expect(screen.getByText('Disease rows')).toBeTruthy();
    expect(screen.getByText('Loading stat')).toBeTruthy();
    expect(screen.getByText('Nothing')).toBeTruthy();

    await fireEvent.press(screen.getByText('Sidebar mock'));
    await fireEvent.press(screen.getByText('A'));
    await fireEvent.press(screen.getByText('More'));
    await fireEvent.press(screen.getByText('Row B'));

    expect(onLogout).toHaveBeenCalled();
    expect(onPress).toHaveBeenCalled();
    expect(onRowPress).toHaveBeenCalledWith({ id: '2', name: 'Row B' }, 1);
  });

  it('covers control branches for segmented and selectable chip', async () => {
    const onChange = vi.fn();
    const onPress = vi.fn();

    const screen = await render(
      <>
        <SegmentedControl
          value="two"
          onChange={onChange}
          options={[
            { label: 'One', value: 'one' },
            { label: 'Two', value: 'two', badgeCount: 5 },
          ]}
        />
        <SelectableChip label="Plain chip" onPress={onPress} />
        <SelectableChip label="Disabled chip" disabled onPress={onPress} />
      </>
    );

    await fireEvent.press(screen.getByText('One'));
    await fireEvent.press(screen.getByText('Plain chip'));
    await fireEvent.press(screen.getByText('Disabled chip'));

    expect(onChange).toHaveBeenCalledWith('one');
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
