import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { AppColors, AppRadii, AppShadows, AppSpacing } from '@/constants/theme';

export type OverlayDialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface OverlayDialogProps {
  visible: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  size?: OverlayDialogSize;
  scrollable?: boolean;
  footer?: React.ReactNode;
  backdropStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

const sizeStyles: Record<OverlayDialogSize, ViewStyle> = {
  sm: { maxWidth: 440 },
  md: { maxWidth: 560 },
  lg: { maxWidth: 720 },
  xl: { maxWidth: 920 },
  full: { maxWidth: 1120, width: '96%' },
};

export function OverlayDialog({
  visible,
  onClose,
  children,
  size = 'md',
  scrollable = false,
  footer,
  backdropStyle,
  style,
  contentStyle,
  testID,
}: OverlayDialogProps) {
  const content = scrollable ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.scrollContent, contentStyle]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, contentStyle]}>{children}</View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} testID={testID}>
      <View style={styles.overlay}>
        <Pressable
          style={[styles.backdrop, backdropStyle]}
          onPress={onClose}
          testID={testID ? `${testID}-backdrop` : undefined}
        />
        <View style={[styles.dialog, sizeStyles[size], style]}>
          {content}
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: AppSpacing.card,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: AppColors.modal.backdrop,
  },
  dialog: {
    width: '94%',
    maxHeight: '90%',
    backgroundColor: AppColors.modal.surface,
    borderRadius: AppRadii['5xl'],
    borderWidth: 1,
    borderColor: AppColors.modal.border,
    overflow: 'hidden',
    ...AppShadows.floating,
  },
  content: {
    padding: AppSpacing.screen,
    gap: AppSpacing.card,
  },
  scroll: {
    maxHeight: '100%',
  },
  scrollContent: {
    padding: AppSpacing.screen,
    gap: AppSpacing.card,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: AppSpacing[6],
    paddingHorizontal: AppSpacing.screen,
    paddingVertical: AppSpacing.card,
    borderTopWidth: 1,
    borderTopColor: AppColors.modal.headerBorder,
    backgroundColor: AppColors.surface.card,
  },
});
