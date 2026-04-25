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
  ageValue?: string;
  sexValue?: string;
  postalCodeValue?: string;
  symptomsValue?: string;
  dropzoneState?: FileUploadState;
  primaryButtonLabel?: string;
  showSecondaryAction?: boolean;
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
  ageValue,
  sexValue,
  postalCodeValue,
  symptomsValue,
  dropzoneState = 'empty',
  primaryButtonLabel = 'Run AI Analysis',
  showSecondaryAction = false,
  style,
}: PatientEvaluationFormProps) {
  return (
    <CardBase style={StyleSheet.flatten([styles.container, style])}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>{caseMeta}</Text>
      </View>

      <View style={styles.fields}>
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Patient Age</Text>
            <InputField
              placeholder="e.g., 34"
              value={ageValue}
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
              style={styles.fieldBlock}
            />
          </View>
        </View>

        <View>
          <Text style={styles.fieldLabel}>Postal Code</Text>
          <InputField
            placeholder="e.g., 10001"
            value={postalCodeValue}
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
            fileName={dropzoneState === 'uploaded' ? 'lab_results.pdf' : undefined}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          variant="primary"
          size="lg"
          label={primaryButtonLabel}
          onPress={() => {}}
          style={styles.primaryButton}
          labelStyle={styles.primaryButtonLabel}
        />

        {showSecondaryAction ? (
          <IconButton
            icon={<Feather name="clipboard" size={12} color="#64748B" />}
            variant="secondary"
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
