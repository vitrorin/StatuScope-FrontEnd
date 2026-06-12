import React from 'react';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { AppColors, AppRadii, AppSpacing, AppTypography } from '@/constants/theme';

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
    ...AppTypography.textStyles.captionStrong,
    color: AppColors.text.secondary,
    marginBottom: AppSpacing.fieldGap,
    textTransform: 'uppercase',
    letterSpacing: AppTypography.letterSpacing.eyebrow,
  },
  container: {
    minHeight: 96,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: AppRadii.xl,
    borderColor: AppColors.border.default,
    backgroundColor: AppColors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: AppSpacing.card,
    paddingVertical: AppSpacing[11],
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
    borderColor: AppColors.status.dangerBorder,
    backgroundColor: AppColors.status.dangerSoft,
  },
  iconWrap: {
    marginBottom: AppSpacing[6],
  },
  browseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: AppSpacing[3],
  },
  description: {
    ...AppTypography.textStyles.body,
    color: AppColors.text.body,
    textAlign: 'center',
  },
  browseLink: {
    ...AppTypography.textStyles.bodyStrong,
    fontWeight: AppTypography.fontWeights.bold,
    color: AppColors.brand.primary,
  },
  formatText: {
    ...AppTypography.textStyles.caption,
    lineHeight: AppTypography.lineHeights.caption,
    color: AppColors.text.muted,
    textAlign: 'center',
  },
  fileName: {
    ...AppTypography.textStyles.bodyStrong,
    color: AppColors.text.primary,
    textAlign: 'center',
  },
  errorText: {
    marginTop: AppSpacing[3],
    ...AppTypography.textStyles.caption,
    color: AppColors.status.danger,
  },
});
