import React from 'react';
import { Text, View } from 'react-native';
import { cleanup, fireEvent, render } from '@testing-library/react-native';
import { describe, expect, it, vi } from '@/__tests__/helpers/jestCompat';
import { Avatar } from '@/components/foundation/Avatar';
import { Badge } from '@/components/foundation/Badge';
import { IconButton } from '@/components/foundation/IconButton';
import { ProgressBar } from '@/components/foundation/ProgressBar';
import { SegmentedControl } from '@/components/foundation/SegmentedControl';
import { CheckboxField } from '@/components/inputs/CheckboxField';
import { FileUploadDropzone } from '@/components/inputs/FileUploadDropzone';
import { InputField } from '@/components/inputs/InputField';
import { LanguageSwitcher } from '@/components/inputs/LanguageSwitcher';
import { RoleSegmentedControl } from '@/components/inputs/RoleSegmentedControl';
import { SearchInput } from '@/components/inputs/SearchInput';
import { SelectField } from '@/components/inputs/SelectField';
import { TextAreaField } from '@/components/inputs/TextAreaField';
import { ActionButtonGroup } from '@/components/diagnosis/ActionButtonGroup';
import { AssistantInputBar } from '@/components/diagnosis/AssistantInputBar';
import { AssistantSuggestionsList } from '@/components/diagnosis/AssistantSuggestionsList';
import { ConfidenceBar } from '@/components/diagnosis/ConfidenceBar';
import { DiagnosisChatBubble } from '@/components/diagnosis/DiagnosisChatBubble';
import { DiagnosisResponseCard } from '@/components/diagnosis/DiagnosisResponseCard';
import { DiagnosisRiskCard } from '@/components/diagnosis/DiagnosisRiskCard';
import { PatientEvaluationForm } from '@/components/diagnosis/PatientEvaluationForm';
import { RecommendedTestsCard } from '@/components/diagnosis/RecommendedTestsCard';
import { DetectionBanner } from '@/components/feedback/DetectionBanner';
import { InlineWarningBanner } from '@/components/feedback/InlineWarningBanner';
import { SkeletonBlock } from '@/components/feedback/SkeletonBlock';
import { StatusBadge } from '@/components/feedback/StatusBadge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SectionTitleBlock } from '@/components/layout/SectionTitleBlock';
import { TopHeader } from '@/components/layout/TopHeader';
import { OverlayDialog } from '@/components/overlays/OverlayDialog';
import { ActionChipButton } from '@/components/recommendations/ActionChipButton';
import { MetaInfoRow } from '@/components/recommendations/MetaInfoRow';
import { RecommendationCard } from '@/components/recommendations/RecommendationCard';
import { RecommendationTabs } from '@/components/recommendations/RecommendationTabs';
import { SeverityBadge } from '@/components/recommendations/SeverityBadge';
import { BedCapacitySummaryCard } from '@/components/resources/BedCapacitySummaryCard';
import { DataTable } from '@/components/resources/DataTable';
import { InventoryProgressCard } from '@/components/resources/InventoryProgressCard';
import { StaffingStatusCard } from '@/components/resources/StaffingStatusCard';
import { TableRow } from '@/components/resources/TableRow';
import { PaginationControl } from '@/components/users/PaginationControl';
import { SummaryCountCard } from '@/components/users/SummaryCountCard';
import { UserAvatarBadge } from '@/components/users/UserAvatarBadge';
import { UserTableCard } from '@/components/users/UserTableCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
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
    Sidebar: () => <Text>Sidebar navigation</Text>,
  };
});

describe('frontend reusable component coverage', () => {
  afterEach(async () => {
    await cleanup();
  });

  it('renders foundation and input components with callbacks', async () => {
    const onPress = vi.fn();
    const onText = vi.fn();
    const onSegment = vi.fn();
    const onCheck = vi.fn();
    const onSelect = vi.fn();

    const screen = await render(
      <>
        <Avatar initials="AG" tone="doctor" size="lg" />
        <Badge label="Active" tone="success" />
        <IconButton icon={<Text>gear</Text>} onPress={onPress} testID="icon-action" />
        <ProgressBar value={120} />
        <SegmentedControl
          label="Mode"
          value="one"
          onChange={onSegment}
          options={[
            { label: 'One', value: 'one', badgeCount: 2 },
            { label: 'Two', value: 'two' },
          ]}
        />
        <InputField label="Name" value="Ana" hint="Required" onChangeText={onText} />
        <InputField label="Password" type="password" value="secret" />
        <TextAreaField label="Symptoms" value="Fever" hint="Describe case" onChangeText={onText} />
        <CheckboxField label="Accept terms" checked helperText="Required" onChange={onCheck} />
        <SearchInput value="sarampion" onChangeText={onText} />
        <SelectField
          label="Sex"
          value="male"
          onChange={onSelect}
          options={[{ label: 'Male', value: 'male' }]}
        />
        <FileUploadDropzone state="uploaded" fileName="lab.pdf" onBrowsePress={onPress} />
        <LanguageSwitcher />
        <RoleSegmentedControl
          value="doctor"
          onChange={onSegment}
          options={[
            { label: 'Doctor', value: 'doctor' },
            { label: 'Admin', value: 'admin' },
          ]}
        />
      </>
    );

    expect(screen.getByText('AG')).toBeTruthy();
    expect(screen.getByText('Active')).toBeTruthy();
    expect(screen.getByText('Mode')).toBeTruthy();
    expect(screen.getByText('Name')).toBeTruthy();
    expect(screen.getByText('Accept terms')).toBeTruthy();
    expect(screen.getByText('lab.pdf')).toBeTruthy();
    expect(screen.getByText('Doctor')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('icon-action'));
    await fireEvent.press(screen.getByText('Two'));
    await fireEvent.press(screen.getByText('Accept terms'));

    expect(onPress).toHaveBeenCalled();
    expect(onSegment).toHaveBeenCalledWith('two');
    expect(onCheck).toHaveBeenCalledWith(false);
  });

  it('renders diagnosis workspace components', async () => {
    const onPrimary = vi.fn();
    const onSecondary = vi.fn();
    const onSend = vi.fn();
    const onBrowse = vi.fn();

    const suggestions = [{
      id: 's1',
      displayName: 'Sarampion',
      confidence: 0.91,
      rationale: 'Compatible symptoms',
      rankOrder: 1,
      localityRiskLevel: 'HIGH' as const,
      diseaseId: 'd1',
      primary: true,
    }];

    const screen = await render(
      <>
        <ActionButtonGroup
          primaryLabel="Analyze"
          secondaryLabel="Save"
          onPrimaryPress={onPrimary}
          onSecondaryPress={onSecondary}
        />
        <AssistantInputBar value="Next step" onSendPress={onSend} />
        <AssistantSuggestionsList suggestions={suggestions} />
        <ConfidenceBar label="Confidence" value={91} />
        <DiagnosisChatBubble message="Patient notes" sender="user" />
        <DiagnosisChatBubble message="Assistant answer" sender="assistant" compact />
        <DiagnosisResponseCard
          responseText="Possible Sarampion case"
          highlightText="Sarampion"
          showWarning
          warningMessage="Review locality risk"
        />
        <DiagnosisRiskCard title="High risk" subtitle="Local signal" statusText="Alert" />
        <RecommendedTestsCard tests={[{ label: 'PCR', secondaryText: 'Confirm diagnosis' }]} />
        <PatientEvaluationForm
          patientNameValue="Ana Gomez"
          birthDateValue="1990-01-01"
          sexValue="female"
          symptomsValue="Fever and rash"
          uploadedFileName="lab.pdf"
          dropzoneState="uploaded"
          showSecondaryAction
          onBrowsePress={onBrowse}
          onPrimaryActionPress={onPrimary}
          onSecondaryActionPress={onSecondary}
        />
      </>
    );

    expect(screen.getByText('Analyze')).toBeTruthy();
    expect(screen.getByText('Differential suggestions')).toBeTruthy();
    expect(screen.getByText('Sarampion')).toBeTruthy();
    expect(screen.getByText('PCR')).toBeTruthy();
    expect(screen.getByDisplayValue('Ana Gomez')).toBeTruthy();

    await fireEvent.press(screen.getAllByText('Analyze')[0]);
    await fireEvent.press(screen.getByText('Save'));
    await fireEvent.press(screen.getByText('send'));

    expect(onPrimary).toHaveBeenCalled();
    expect(onSecondary).toHaveBeenCalled();
    expect(onSend).toHaveBeenCalled();
  });

  it('renders feedback, layout and overlay components', async () => {
    const onClose = vi.fn();
    const onAction = vi.fn();

    const screen = await render(
      <>
        <DetectionBanner message="Cases increased" variant="warning" />
        <InlineWarningBanner message="Critical warning" variant="critical" />
        <SkeletonBlock rows={2} />
        <StatusBadge label="Stable" variant="success" />
        <SectionTitleBlock eyebrow="Section" title="Operations" subtitle="Daily view" />
        <TopHeader sectionLabel="Header" userName="Ana" userId="Hospital" />
        <DashboardLayout
          active="dashboard"
          sectionLabel="Main"
          userName="Ana"
          links={{ dashboard: '/dashboard/doctor', diagnosis: '/diagnosis', analytics: '/analytics' }}
          onLogout={onAction}
        >
          <Text>Layout content</Text>
        </DashboardLayout>
        <OverlayDialog visible onClose={onClose}>
          <Text>Dialog content</Text>
        </OverlayDialog>
      </>
    );

    expect(screen.getByText('Cases increased')).toBeTruthy();
    expect(screen.getByText('Operations')).toBeTruthy();
    expect(screen.getByText('Layout content')).toBeTruthy();
    expect(screen.getByText('Dialog content')).toBeTruthy();
  });

  it('renders recommendation, resource and user components', async () => {
    const onAction = vi.fn();
    const onPageChange = vi.fn();

    const screen = await render(
      <>
        <ActionChipButton label="Create task" onPress={onAction} />
        <MetaInfoRow items={[{ label: 'Today', icon: <Text>clock</Text> }, { label: 'High' }]} />
        <SeverityBadge label="HIGH" severity="high" />
        <RecommendationTabs
          value="open"
          onChange={onAction}
          options={[{ label: 'Open', value: 'open', badgeCount: 3 }, { label: 'Closed', value: 'closed' }]}
        />
        <RecommendationCard
          severity="high"
          category="Resources"
          title="Increase staffing"
          description="Nearby outbreak pressure"
          metaItems={[{ label: '2 hours' }]}
          actions={[{ label: 'Assign', variant: 'primary' }]}
          imageMode="chart"
        />
        <BedCapacitySummaryCard title="Beds" value="42" unitText="available" showProgress progressValue={80} />
        <InventoryProgressCard
          title="Masks"
          valueText="120"
          progress={65}
          statusText="Stable"
          actionLabel="Request"
          onAction={onAction}
          actionPlacement="below"
        />
        <StaffingStatusCard title="Doctors" subtitle="ER" value="12" variant="doctor" />
        <TableRow
          title="Urgencias"
          subtitle="Main wing"
          total="30"
          occupied="21"
          utilization="70%"
          statusLabel="Stable"
          statusVariant="success"
          actionLabel="Manage"
          onAction={onAction}
        />
        <DataTable
          compact
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'status', label: 'Status', align: 'right' },
          ]}
          rows={[{ name: 'Masks', status: <Text>OK</Text> }]}
        />
        <SummaryCountCard title="Users" value="12" caption="active" valueAccent={<Text>+2</Text>} />
        <UserAvatarBadge initials="AG" variant="admin" />
        <PaginationControl currentPage={2} totalPages={8} onPageChange={onPageChange} />
        <UserTableCard
          title="Users"
          users={[{
            initials: 'AG',
            name: 'Ana Gomez',
            email: 'ana@example.com',
            role: 'Doctor',
            pcId: 'PC-01',
            status: 'Active',
            statusVariant: 'success',
          }]}
          showPagination
          currentPage={1}
          totalPages={2}
          onPageChange={onPageChange}
        />
      </>
    );

    expect(screen.getByText('Increase staffing')).toBeTruthy();
    expect(screen.getByText('Beds')).toBeTruthy();
    expect(screen.getByText('Urgencias')).toBeTruthy();
    expect(screen.getByText('Ana Gomez')).toBeTruthy();

    await fireEvent.press(screen.getByText('Create task'));
    await fireEvent.press(screen.getByText('Closed'));
    await fireEvent.press(screen.getByText('Request'));
    await fireEvent.press(screen.getByText('Manage'));
    await fireEvent.press(screen.getAllByText('>')[0]);

    expect(onAction).toHaveBeenCalled();
    expect(onPageChange).toHaveBeenCalled();
  });

  it('renders themed primitives', async () => {
    const screen = await render(
      <ThemedView>
        <ThemedText type="title" lightColor={AppColors.text.primary}>Themed title</ThemedText>
      </ThemedView>
    );

    expect(screen.getByText('Themed title')).toBeTruthy();
  });
});
