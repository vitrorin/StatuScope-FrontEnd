import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Avatar } from '../foundation/Avatar';
import { LanguageSwitcher } from '../inputs/LanguageSwitcher';
import { AppColors, AppSpacing, AppTypography } from '@/constants/theme';

export interface TopHeaderProps {
  sectionLabel?: string;
  userName: string;
  userId?: string;
  showNotificationDot?: boolean;
  avatarText?: string;
  onProfilePress?: () => void;
  style?: ViewStyle;
}

export function TopHeader({
  sectionLabel,
  userName,
  userId,
  showNotificationDot = false,
  avatarText = 'SC',
  onProfilePress,
  style,
}: TopHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftSection}>
        {sectionLabel ? <Text style={styles.sectionLabel}>{sectionLabel}</Text> : null}
      </View>

      <View style={styles.rightSection}>
        <LanguageSwitcher />

        <View style={styles.divider} />

        <TouchableOpacity style={styles.profileSection} onPress={onProfilePress}>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{userName}</Text>
            {userId ? <Text style={styles.userId}>{userId}</Text> : null}
          </View>
          <Avatar initials={avatarText} tone="doctor" size="md" style={styles.avatar} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppColors.surface.card,
    minHeight: 68,
    paddingHorizontal: AppSpacing.section,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border.default,
  },
  leftSection: {
    flex: 1,
    justifyContent: 'center',
  },
  sectionLabel: {
    ...AppTypography.textStyles.body,
    color: AppColors.text.muted,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing[10],
  },
  divider: {
    width: 1,
    height: AppSpacing.section,
    backgroundColor: AppColors.border.default,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 1,
    gap: AppSpacing[7],
  },
  profileInfo: {
    alignItems: 'flex-end',
  },
  userName: {
    ...AppTypography.textStyles.bodyStrong,
    fontWeight: AppTypography.fontWeights.bold,
    color: AppColors.text.primary,
  },
  userId: {
    marginTop: 0,
    ...AppTypography.textStyles.caption,
    color: AppColors.text.muted,
  },
  avatar: {
    backgroundColor: AppColors.brand.teal,
  },
});
