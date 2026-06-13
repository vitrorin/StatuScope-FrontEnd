import React from 'react';
import { Text } from 'react-native';
import { cleanup, fireEvent, render } from '@testing-library/react-native';
import { describe, expect, it, vi } from '@/__tests__/helpers/jestCompat';
import { Avatar } from '@/components/foundation/Avatar';
import { Badge } from '@/components/foundation/Badge';
import { Button } from '@/components/foundation/Button';
import { SegmentedControl } from '@/components/foundation/SegmentedControl';
import { AlertCard } from '@/components/feedback/AlertCard';
import { DetectionBanner } from '@/components/feedback/DetectionBanner';
import { EmptyState } from '@/components/feedback/EmptyState';
import { InlineWarningBanner } from '@/components/feedback/InlineWarningBanner';
import { RetryState } from '@/components/feedback/RetryState';
import { SkeletonBlock } from '@/components/feedback/SkeletonBlock';
import { StatusBadge } from '@/components/feedback/StatusBadge';
import { CheckboxField } from '@/components/inputs/CheckboxField';
import { FileUploadDropzone } from '@/components/inputs/FileUploadDropzone';
import { InputField } from '@/components/inputs/InputField';
import { SearchInput } from '@/components/inputs/SearchInput';
import { SelectField } from '@/components/inputs/SelectField';
import { TextAreaField } from '@/components/inputs/TextAreaField';
import { DiagnosisResponseCard } from '@/components/diagnosis/DiagnosisResponseCard';
import { DiagnosisRiskCard } from '@/components/diagnosis/DiagnosisRiskCard';
import { AssistantSuggestionsList } from '@/components/diagnosis/AssistantSuggestionsList';
import { RecommendationCard } from '@/components/recommendations/RecommendationCard';
import { BedCapacitySummaryCard } from '@/components/resources/BedCapacitySummaryCard';
import { InventoryProgressCard } from '@/components/resources/InventoryProgressCard';
import { StaffingStatusCard } from '@/components/resources/StaffingStatusCard';
import { PaginationControl } from '@/components/users/PaginationControl';
import { SummaryCountCard } from '@/components/users/SummaryCountCard';
import { UserTableCard } from '@/components/users/UserTableCard';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    Feather: ({ name }: { name: string }) => <Text>{name}</Text>,
    MaterialCommunityIcons: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

describe('frontend component branch variants', () => {
  afterEach(async () => {
    await cleanup();
  });

  it('covers foundation, feedback and input state variants', async () => {
    const onPress = vi.fn();
    const onChange = vi.fn();

    const screen = await render(
      <>
        <Avatar initials="AD" tone="admin" size="sm" />
        <Avatar initials="NE" tone="neutral" />
        <Badge label="Critical" tone="critical" />
        <Badge label="Warning" tone="warning" />
        <Badge label="Info" tone="info" />
        <Badge label="Role" tone="role" />
        <Button label="Disabled" disabled onPress={onPress} />
        <Button label="Ghost" variant="ghost" />
        <SegmentedControl
          value="none"
          options={[{ label: 'No badge', value: 'none', badgeCount: 0 }]}
          onChange={onChange}
          fullWidth
          size="sm"
        />
        <AlertCard title="Alert" description="Description" variant="critical" />
        <AlertCard title="Info alert" description="Info" variant="info" />
        <DetectionBanner message="Info detection" variant="info" actionLabel="Open" onActionPress={onPress} />
        <DetectionBanner message="Critical detection" variant="critical" />
        <InlineWarningBanner message="Warning banner" variant="warning" />
        <RetryState title="No connection" message="Retry later" actionLabel="Retry" onRetry={onPress} />
        <EmptyState title="Empty" />
        <SkeletonBlock />
        <StatusBadge label="Warning" variant="warning" />
        <StatusBadge label="Neutral" variant="neutral" />
        <StatusBadge label="Info" variant="info" />
        <CheckboxField label="Disabled check" disabled helperText="Unavailable" onChange={onChange} />
        <FileUploadDropzone state="empty" onBrowsePress={onPress} />
        <FileUploadDropzone state="dragging" onBrowsePress={onPress} />
        <FileUploadDropzone state="error" error="Upload failed" onBrowsePress={onPress} />
        <InputField label="Disabled input" disabled value="Disabled" error="Required" />
        <InputField label="Email input" type="email" value="a@b.com" rightIcon={<Text>right</Text>} />
        <InputField label="Number input" type="number" value="123" />
        <SearchInput disabled value="locked" />
        <SearchInput value="focus" onFocus={onPress} onBlur={onPress} />
        <SelectField disabled label="Disabled select" options={[]} />
        <SelectField label="Select error" error="Pick one" options={[{ label: 'A', value: 'a' }]} />
        <TextAreaField label="Disabled area" disabled value="Text" error="Too short" />
      </>
    );

    expect(screen.getByText('Critical')).toBeTruthy();
    expect(screen.getByText('Info detection')).toBeTruthy();
    expect(screen.getByText('Upload failed')).toBeTruthy();
    expect(screen.getByText('Pick one')).toBeTruthy();

    await fireEvent.press(screen.getByText('Open'));
    await fireEvent(screen.getByDisplayValue('focus'), 'focus');
    await fireEvent(screen.getByDisplayValue('focus'), 'blur');

    expect(onPress).toHaveBeenCalled();
  });

  it('covers diagnosis and card optional variants', async () => {
    const screen = await render(
      <>
        <AssistantSuggestionsList suggestions={[]} />
        <AssistantSuggestionsList
          suggestions={[{
            id: 's2',
            displayName: 'Influenza',
            confidence: null,
            rationale: null,
            rankOrder: 2,
            localityRiskLevel: null,
            diseaseId: null,
            primary: false,
          }]}
          formatDiseaseName={(value) => value?.toUpperCase() ?? ''}
          formatRiskLevel={(value) => value ?? 'none'}
        />
        <DiagnosisResponseCard title="Clinical note" responseText="No highlighted text" leadingIcon={<Text>icon</Text>} />
        <DiagnosisRiskCard title="Plain risk" variant="warning" statusText="Watch" statusTone="text" />
        <DiagnosisRiskCard title="Info risk" variant="info" />
        <RecommendationCard
          severity="low"
          category="Logistics"
          title="No action recommendation"
          description="Informative card"
          imageMode="supply"
        />
        <BedCapacitySummaryCard title="Critical beds" value="5" variant="critical" statusText="Critical" />
        <BedCapacitySummaryCard title="Warning beds" value="15" variant="warning" />
        <InventoryProgressCard title="Critical inventory" progress={120} variant="critical" statusText="Critical" />
        <InventoryProgressCard title="Warning inventory" progress={-10} variant="warning" statusText="Low" />
        <StaffingStatusCard title="Nurses" value="18" variant="nurse" />
        <StaffingStatusCard title="Specialists" value="4" variant="specialist" />
        <SummaryCountCard title="Neutral summary" value="4" variant="neutral" />
        <SummaryCountCard title="Warning summary" value="1" variant="warning" />
        <UserTableCard users={[]} />
      </>
    );

    expect(screen.getByText('Differential suggestions')).toBeTruthy();
    expect(screen.getByText('INFLUENZA')).toBeTruthy();
    expect(screen.getByText('Clinical note')).toBeTruthy();
    expect(screen.getByText('No action recommendation')).toBeTruthy();
    expect(screen.getByText('Critical inventory')).toBeTruthy();
  });

  it('covers pagination branch layouts', async () => {
    const onPageChange = vi.fn();
    const screen = await render(
      <>
        <PaginationControl currentPage={1} totalPages={3} onPageChange={onPageChange} />
        <PaginationControl currentPage={2} totalPages={8} onPageChange={onPageChange} />
        <PaginationControl currentPage={6} totalPages={8} onPageChange={onPageChange} />
        <PaginationControl currentPage={4} totalPages={9} onPageChange={onPageChange} />
      </>
    );

    await fireEvent.press(screen.getAllByText('>')[1]);
    await fireEvent.press(screen.getAllByText('<')[2]);

    expect(onPageChange).toHaveBeenCalled();
    expect(screen.getAllByText('...').length).toBeGreaterThan(0);
  });
});
