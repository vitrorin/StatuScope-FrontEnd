import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

export type FileUploadState = 'empty' | 'dragging' | 'uploaded' | 'error';

export interface FileUploadDropzoneProps {
  label?: string;
  description?: string;
  supportedFormats?: string;
  maxSizeText?: string;
  state?: FileUploadState;
  fileName?: string;
  error?: string;
  onBrowsePress?: () => void;
  style?: ViewStyle;
}

export function FileUploadDropzone({
  label,
  description = 'Drag and drop files here or',
  supportedFormats = 'PDF, JPG, PNG',
  maxSizeText = 'Max file size: 10MB',
  state = 'empty',
  fileName,
  error,
  onBrowsePress,
  style,
}: FileUploadDropzoneProps) {
  const getContainerStyle = () => {
    const baseStyle = [styles.container];
    
    switch (state) {
      case 'dragging':
        baseStyle.push(styles.containerDragging);
        break;
      case 'uploaded':
        baseStyle.push(styles.containerUploaded);
        break;
      case 'error':
        baseStyle.push(styles.containerError);
        break;
      default:
        baseStyle.push(styles.containerEmpty);
    }
    
    return baseStyle;
  };

  const getIcon = () => {
    switch (state) {
      case 'uploaded':
        return '✅';
      case 'error':
        return '⚠️';
      default:
        return '📁';
    }
  };

  const getDescriptionText = () => {
    if (state === 'uploaded' && fileName) {
      return fileName;
    }
    return description;
  };

  return (
    <View style={[styles.wrapper, style]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <View style={getContainerStyle()}>
        <Text style={styles.icon}>{getIcon()}</Text>
        {state !== 'uploaded' ? (
          <>
            <Text style={styles.description}>{description}</Text>
            <View style={styles.browseRow}>
              <TouchableOpacity onPress={onBrowsePress}>
                <Text style={styles.browseLink}>browse</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.formatRow}>
              <Text style={styles.formatText}>{supportedFormats}</Text>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.formatText}>{maxSizeText}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.fileName}>{fileName}</Text>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  container: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    minHeight: 160,
  },
  containerEmpty: {
    borderColor: '#D1D5DB',
  },
  containerDragging: {
    borderColor: '#1D4ED8',
    backgroundColor: '#EEF2FF',
  },
  containerUploaded: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  containerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  icon: {
    fontSize: 32,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  browseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  browseLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  formatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formatText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  separator: {
    fontSize: 12,
    color: '#9CA3AF',
    marginHorizontal: 8,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
  },
});