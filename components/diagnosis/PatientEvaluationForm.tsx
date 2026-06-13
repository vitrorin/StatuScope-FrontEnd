import React from 'react';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Button } from '../foundation/Button';
import { IconButton } from '../foundation/IconButton';
import { FileUploadDropzone } from '../inputs/FileUploadDropzone';
import { InputField } from '../inputs/InputField';
import { SelectField } from '../inputs/SelectField';
import { TextAreaField } from '../inputs/TextAreaField';
import { CardBase } from '../patterns/CardBase';
import { AppColors } from '@/constants/theme';

export type FileUploadState = 'empty' | 'dragging' | 'uploaded' | 'error';

export interface PatientEvaluationFormProps {
  title?: string;
  caseMeta?: string;
  patientNameLabel?: string;
  patientNamePlaceholder?: string;
  birthDateLabel?: string;
  sexLabel?: string;
  sexPlaceholder?: string;
  symptomsLabel?: string;
  symptomsPlaceholder?: string;
  filesLabel?: string;
  fileDescription?: string;
  fileBrowseLabel?: string;
  fileUpToLabel?: string;
  sexOptions?: { label: string; value: string }[];
  patientNameValue?: string;
  birthDateValue?: string;
  sexValue?: string;
  symptomsValue?: string;
  dropzoneState?: FileUploadState;
  uploadedFileName?: string;
  dropzoneError?: string;
  primaryButtonLabel?: string;
  primaryButtonDisabled?: boolean;
  secondaryButtonDisabled?: boolean;
  showSecondaryAction?: boolean;
  onPatientNameChange?: (value: string) => void;
  onBirthDateChange?: (value: string) => void;
  onSexChange?: (value: string) => void;
  onSymptomsChange?: (value: string) => void;
  onBrowsePress?: () => void;
  onPrimaryActionPress?: () => void;
  onSecondaryActionPress?: () => void;
  style?: ViewStyle;
}

const sexOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

export function PatientEvaluationForm({
  title = 'Patient Evaluation',
  caseMeta,
  patientNameLabel = 'Patient Name',
  patientNamePlaceholder = 'Patient full name',
  birthDateLabel = 'Birth Date',
  sexLabel = 'Sex',
  sexPlaceholder = 'Select',
  symptomsLabel = 'Symptoms Descriptor',
  symptomsPlaceholder = 'Describe patient symptoms, duration, severity...',
  filesLabel = 'Lab Results & Imaging',
  fileDescription = 'Drag and drop files or',
  fileBrowseLabel = 'browse',
  fileUpToLabel = 'up to',
  sexOptions: providedSexOptions = sexOptions,
  patientNameValue,
  birthDateValue,
  sexValue,
  symptomsValue,
  dropzoneState = 'empty',
  uploadedFileName,
  dropzoneError,
  primaryButtonLabel = 'Run AI Analysis',
  primaryButtonDisabled = false,
  secondaryButtonDisabled = false,
  showSecondaryAction = false,
  onPatientNameChange,
  onBirthDateChange,
  onSexChange,
  onSymptomsChange,
  onBrowsePress,
  onPrimaryActionPress,
  onSecondaryActionPress,
  style,
}: PatientEvaluationFormProps) {
  return (
    <CardBase style={StyleSheet.flatten([styles.container, style])}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {caseMeta ? <Text style={styles.meta}>{caseMeta}</Text> : null}
      </View>

      <View style={styles.fields}>
        <View>
          <Text style={styles.fieldLabel}>{patientNameLabel}</Text>
          <InputField
            placeholder={patientNamePlaceholder}
            value={patientNameValue}
            onChangeText={onPatientNameChange}
            style={styles.fieldBlock}
            inputContainerStyle={styles.fieldInputContainer}
            testID="diagnosis-patient-name"
          />
        </View>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>{birthDateLabel}</Text>
            <InputField
              placeholder="YYYY-MM-DD"
              value={birthDateValue}
              onChangeText={onBirthDateChange}
              maxLength={10}
              style={styles.fieldBlock}
              inputContainerStyle={styles.fieldInputContainer}
              testID="diagnosis-birth-date"
            />
          </View>

          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>{sexLabel}</Text>
            <SelectField
              placeholder={sexPlaceholder}
              options={providedSexOptions}
              value={sexValue}
              onChange={onSexChange}
              style={[styles.fieldBlock, styles.sexFieldBlock]}
              testID="diagnosis-sex"
            />
          </View>
        </View>

        <View>
          <Text style={styles.fieldLabel}>{symptomsLabel}</Text>
          <TextAreaField
            placeholder={symptomsPlaceholder}
            value={symptomsValue}
            onChangeText={onSymptomsChange}
            numberOfLines={3}
            style={styles.fieldBlock}
            testID="diagnosis-symptoms"
          />
        </View>

        <View>
          <Text style={styles.fieldLabel}>{filesLabel}</Text>
          <FileUploadDropzone
            description={fileDescription}
            supportedFormats="PDF, JPG, DICOM"
            maxSizeText="20MB"
            browseLabel={fileBrowseLabel}
            upToLabel={fileUpToLabel}
            state={dropzoneState}
            fileName={uploadedFileName}
            error={dropzoneError}
            onBrowsePress={onBrowsePress}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          variant="primary"
          size="lg"
          label={primaryButtonLabel}
          disabled={primaryButtonDisabled}
          onPress={onPrimaryActionPress}
          style={styles.primaryButton}
          labelStyle={styles.primaryButtonLabel}
          testID="diagnosis-run-analysis"
        />

        {showSecondaryAction ? (
          <IconButton
            icon={<Feather name="clipboard" size={12} color={AppColors.text.secondary} />}
            variant="secondary"
            disabled={secondaryButtonDisabled}
            onPress={onSecondaryActionPress}
            style={styles.secondaryButton}
          />
        ) : null}
      </View>
    </CardBase>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
    overflow: 'visible',
  },
  header: {
    backgroundColor: AppColors.surface.cardTint,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderTopWidth: 4,
    borderTopColor: AppColors.brand.primary,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.surface.muted,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 22,
  },
  title: {
    fontSize: 20,
    lineHeight: 30,
    fontWeight: '700',
    color: AppColors.text.primary,
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
    color: AppColors.text.secondary,
  },
  fields: {
    gap: 24,
    padding: 24,
    backgroundColor: AppColors.surface.card,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfField: {
    flex: 1,
  },
  fieldLabel: {
    marginBottom: 8,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: AppColors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  fieldBlock: {
    marginBottom: 0,
  },
  sexFieldBlock: {
    marginTop: 18,
  },
  fieldInputContainer: {
    height: 42,
    borderRadius: 10,
    borderColor: AppColors.border.default,
    backgroundColor: AppColors.surface.cardSoft,
    paddingHorizontal: 13,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: AppColors.surface.muted,
    paddingHorizontal: 16,
    paddingTop: 17,
    paddingBottom: 16,
    backgroundColor: AppColors.surface.cardTint,
  },
  primaryButton: {
    flex: 1,
    minHeight: 49,
    borderRadius: 10,
    borderWidth: 0,
    backgroundColor: AppColors.brand.primary,
    shadowColor: AppColors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonLabel: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  secondaryButton: {
    width: 44,
    minWidth: 44,
    minHeight: 44,
    borderRadius: 10,
    borderColor: AppColors.border.default,
    backgroundColor: AppColors.surface.card,
  },
});
