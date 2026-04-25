import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Sidebar, SidebarActive, SidebarItemKey, SidebarNavItem } from '@/components/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';

export interface DashboardLayoutProps {
  active?: SidebarActive;
  children: React.ReactNode;
  sectionLabel?: string;
  searchPlaceholder?: string;
  userName: string;
  userId?: string;
  avatarText?: string;
  onLogout?: () => void;
  links?: Partial<Record<SidebarItemKey, string>>;
  sidebarItems?: SidebarNavItem[];
}

export function DashboardLayout({
  active = 'dashboard',
  children,
  sectionLabel = 'Dashboard',
  searchPlaceholder = 'Search medical records...',
  userName,
  userId,
  avatarText,
  onLogout,
  links,
  sidebarItems,
}: DashboardLayoutProps) {
  return (
    <View style={styles.page}>
      <View style={styles.frame}>
        <Sidebar active={active} onLogout={onLogout} links={links} items={sidebarItems} />
        <View style={styles.mainArea}>
          <TopHeader
            sectionLabel={sectionLabel}
            searchPlaceholder={searchPlaceholder}
            userName={userName}
            userId={userId}
            showNotificationDot
            avatarText={avatarText}
          />
          <View style={styles.content}>{children}</View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F5F5F8',
  },
  frame: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F5F8',
  },
  mainArea: {
    flex: 1,
    backgroundColor: '#F5F5F8',
  },
  content: {
    flex: 1,
  },
});
