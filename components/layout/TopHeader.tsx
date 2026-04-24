import React from 'react';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Avatar } from '../foundation/Avatar';
import { SearchInput } from '../inputs/SearchInput';

export interface TopHeaderProps {
  sectionLabel?: string;
  searchPlaceholder?: string;
  userName: string;
  userId?: string;
  showNotificationDot?: boolean;
  avatarText?: string;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  style?: ViewStyle;
}

export function TopHeader({
  sectionLabel,
  searchPlaceholder = 'Search...',
  userName,
  userId,
  showNotificationDot = false,
  avatarText = 'SC',
  onSearchPress,
  onNotificationPress,
  onProfilePress,
  style,
}: TopHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftSection}>
        {sectionLabel ? <Text style={styles.sectionLabel}>{sectionLabel}</Text> : null}
      </View>

      <View style={styles.centerSection}>
        <SearchInput
          placeholder={searchPlaceholder}
          onFocus={onSearchPress}
          style={styles.searchContainer}
        />
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.notificationButton} onPress={onNotificationPress}>
          <Feather name="bell" size={18} color="#64748B" />
          {showNotificationDot ? <View style={styles.notificationDot} /> : null}
        </TouchableOpacity>

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
    backgroundColor: '#FFFFFF',
    minHeight: 68,
    paddingHorizontal: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  leftSection: {
    flex: 1,
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 14,
    lineHeight: 20,
    color: '#94A3B8',
  },
  centerSection: {
    width: 344,
    marginRight: 28,
    alignItems: 'flex-end',
  },
  searchContainer: {
    width: 288,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  notificationButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    right: -1,
    top: 0,
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 1,
    gap: 14,
  },
  profileInfo: {
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  userId: {
    marginTop: 0,
    fontSize: 12,
    lineHeight: 16,
    color: '#94A3B8',
  },
  avatar: {
    backgroundColor: '#5FA8A2',
  },
});
