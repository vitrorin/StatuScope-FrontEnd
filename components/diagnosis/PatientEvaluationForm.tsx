import React from 'react';
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
  caseMeta = 'Case ID: #2847 • Started 12 min ago',
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
    <CardBase style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.meta}>{caseMeta}</Text>

      <View style={styles.fields}>
        <View style={styles.row}>
          <View style={styles.halfField}>
            <InputField label="Patient Age" placeholder="e.g., 34" value={ageValue} />
          </View>
          <View style={styles.halfField}>
            <SelectField
              label="Sex"
              placeholder="Select"
              options={sexOptions}
              value={sexValue}
            />
          </View>
        </View>

        <InputField label="Postal Code" placeholder="e.g., 10001" value={postalCodeValue} />

        <TextareaField
          label="Symptoms Descriptor"
          placeholder="Describe patient symptoms, duration, severity..."
          value={symptomsValue}
          numberOfLines={3}
        />

        <FileUploadDropzone
          label="Lab Results & Imaging"
          state={dropzoneState}
          fileName={dropzoneState === 'uploaded' ? 'lab_results.pdf' : undefined}
        />
      </View>

      <View style={styles.actions}>
        <Button
          variant="primary"
          size="lg"
          label={primaryButtonLabel}
          onPress={() => {}}
          style={styles.primaryButton}
        />
        {showSecondaryAction ? (
          <IconButton icon="↻" variant="secondary" style={styles.secondaryButton} />
        ) : null}
      </View>
    </CardBase>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 20,
  },
  fields: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
  },
  secondaryButton: {
    minWidth: 44,
  },
});
