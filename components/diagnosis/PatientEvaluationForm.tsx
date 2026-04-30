import React from 'react';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Button } from '../foundation/Button';
import { IconButton } from '../foundation/IconButton';
import { FileUploadDropzone } from '../inputs/FileUploadDropzone';
import { InputField } from '../inputs/InputField';
import { SelectField } from '../inputs/SelectField';
import { TextareaField } from '../inputs/TextareaField';
import { CardBase } from '../patterns/CardBase';

export type FileUploadState = 'empty' | 'dragging' | 'uploaded' | 'error';

export interface PatientEvaluationFormProps {
  title?: string;
  caseMeta?: string;
  patientNameValue?: string;
  birthDateValue?: string;
  sexValue?: string;
  postalCodeValue?: string;
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
  onPostalCodeChange?: (value: string) => void;
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
  caseMeta = 'Case ID: #2847 - Started 12 min ago',
  patientNameValue,
  birthDateValue,
  sexValue,
  postalCodeValue,
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
  onPostalCodeChange,
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
        <Text style={styles.meta}>{caseMeta}</Text>
      </View>

      <View style={styles.fields}>
        <View>
          <Text style={styles.fieldLabel}>Patient Name</Text>
          <InputField
            placeholder="e.g., Sofia Martinez"
            value={patientNameValue}
            onChangeText={onPatientNameChange}
            style={styles.fieldBlock}
            inputContainerStyle={styles.fieldInputContainer}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Birth Date</Text>
            <InputField
              placeholder="YYYY-MM-DD"
              value={birthDateValue}
              onChangeText={onBirthDateChange}
              maxLength={10}
              style={styles.fieldBlock}
              inputContainerStyle={styles.fieldInputContainer}
            />
          </View>

          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Sex</Text>
            <SelectField
              placeholder="Select"
              options={sexOptions}
              value={sexValue}
              onChange={onSexChange}
              style={styles.fieldBlock}
            />
          </View>
        </View>

        <View>
          <Text style={styles.fieldLabel}>Postal Code</Text>
          <InputField
            placeholder="e.g., 10001"
            value={postalCodeValue}
            onChangeText={onPostalCodeChange}
            style={styles.fieldBlock}
            inputContainerStyle={styles.fieldInputContainer}
            leftIcon={<Feather name="map-pin" size={14} color="#0003B8" />}
          />
        </View>

        <View>
          <Text style={styles.fieldLabel}>Symptoms Descriptor</Text>
          <TextareaField
            placeholder="Describe patient symptoms, duration, severity..."
            value={symptomsValue}
            onChangeText={onSymptomsChange}
            numberOfLines={3}
            style={styles.fieldBlock}
          />
        </View>

        <View>
          <Text style={styles.fieldLabel}>Lab Results & Imaging</Text>
          <FileUploadDropzone
            description="Drag and drop files or"
            supportedFormats="PDF, JPG, DICOM"
            maxSizeText="20MB"
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
        />

        {showSecondaryAction ? (
          <IconButton
            icon={<Feather name="clipboard" size={12} color="#64748B" />}
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
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#FAFCFF',
    borderTopWidth: 4,
    borderTopColor: '#0003B8',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 22,
  },
  title: {
    fontSize: 20,
    lineHeight: 30,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
    color: '#64748B',
  },
  fields: {
    gap: 24,
    padding: 24,
    backgroundColor: '#FFFFFF',
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
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  fieldBlock: {
    marginBottom: 0,
  },
  fieldInputContainer: {
    height: 42,
    borderRadius: 10,
    borderColor: '#D9E2F0',
    backgroundColor: '#FCFDFE',
    paddingHorizontal: 13,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingTop: 17,
    paddingBottom: 16,
    backgroundColor: '#FAFCFF',
  },
  primaryButton: {
    flex: 1,
    minHeight: 49,
    borderRadius: 10,
    borderWidth: 0,
    backgroundColor: '#0003B8',
    shadowColor: '#000000',
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
    borderColor: '#D9E2F0',
    backgroundColor: '#FFFFFF',
  },
});
