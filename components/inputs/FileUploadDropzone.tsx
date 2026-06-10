import React from 'react';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { AppColors } from '@/constants/theme';

export type FileUploadState = 'empty' | 'dragging' | 'uploaded' | 'error';

export interface FileUploadDropzoneProps {
  label?: string;
  description?: string;
  supportedFormats?: string;
  maxSizeText?: string;
  browseLabel?: string;
  upToLabel?: string;
  state?: FileUploadState;
  fileName?: string;
  error?: string;
  onBrowsePress?: () => void;
  style?: ViewStyle;
}

export function FileUploadDropzone({
  label,
  description = 'Drag and drop files or',
  supportedFormats = 'PDF, JPG, PNG',
  maxSizeText = '10MB',
  browseLabel = 'browse',
  upToLabel = 'up to',
  state = 'empty',
  fileName,
  error,
  onBrowsePress,
  style,
}: FileUploadDropzoneProps) {
  const isUploaded = state === 'uploaded' && fileName;

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.container,
          state === 'dragging' && styles.containerDragging,
          state === 'uploaded' && styles.containerUploaded,
          state === 'error' && styles.containerError,
        ]}
      >
        <View style={styles.iconWrap}>
          {state === 'uploaded' ? (
            <Feather name="check-circle" size={24} color={AppColors.status.success} />
          ) : state === 'error' ? (
            <Feather name="alert-circle" size={24} color={AppColors.status.danger} />
          ) : (
            <Feather name="upload-cloud" size={24} color={AppColors.text.muted} />
          )}
        </View>

        {isUploaded ? (
          <Text style={styles.fileName}>{fileName}</Text>
        ) : (
          <>
            <View style={styles.browseRow}>
              <Text style={styles.description}>{description} </Text>
              <TouchableOpacity onPress={onBrowsePress} activeOpacity={0.75}>
                <Text style={styles.browseLink}>{browseLabel}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.formatText}>
              {supportedFormats} {upToLabel} {maxSizeText}
            </Text>
          </>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: AppColors.text.secondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  container: {
    minHeight: 96,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    borderColor: AppColors.border.default,
    backgroundColor: AppColors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 22,
  },
  containerDragging: {
    borderColor: AppColors.brand.primary,
    backgroundColor: AppColors.surface.brandSoft,
  },
  containerUploaded: {
    borderColor: AppColors.status.success,
    backgroundColor: AppColors.status.successWash,
  },
  containerError: {
    borderColor: '#FCA5A5',
    backgroundColor: AppColors.status.dangerSoft,
  },
  iconWrap: {
    marginBottom: 12,
  },
  browseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: AppColors.text.body,
    textAlign: 'center',
  },
  browseLink: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: AppColors.brand.primary,
  },
  formatText: {
    fontSize: 12,
    lineHeight: 18,
    color: AppColors.text.muted,
    textAlign: 'center',
  },
  fileName: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: AppColors.text.primary,
    textAlign: 'center',
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 16,
    color: AppColors.status.danger,
  },
});
