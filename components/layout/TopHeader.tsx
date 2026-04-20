import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ViewStyle } from 'react-native';

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
  avatarText,
  onSearchPress,
  onNotificationPress,
  onProfilePress,
  style,
}: TopHeaderProps) {
  const getInitials = (name: string): string => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftSection}>
        {sectionLabel && (
          <Text style={styles.sectionLabel}>{sectionLabel}</Text>
        )}
      </View>

      <View style={styles.centerSection}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={searchPlaceholder}
            placeholderTextColor="#94A3B8"
            editable={false}
            onPressIn={onSearchPress}
          />
        </View>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity 
          style={styles.notificationButton} 
          onPress={onNotificationPress}
        >
          <Text style={styles.notificationIcon}>🔔</Text>
          {showNotificationDot && <View style={styles.notificationDot} />}
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.profileSection} onPress={onProfilePress}>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{userName}</Text>
            {userId && <Text style={styles.userId}>{userId}</Text>}
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {avatarText || getInitials(userName)}
            </Text>
          </View>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 72,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    width: '100%',
    maxWidth: 400,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    padding: 0,
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  userId: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D4ED8',
  },
});