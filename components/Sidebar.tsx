import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type SidebarActive = 'dashboard' | 'diagnosis' | 'analytics';

export interface SidebarProps {
  active?: SidebarActive;
}

interface NavItem {
  key: SidebarActive;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '◉' },
  { key: 'diagnosis', label: 'Diagnosis', icon: '◎' },
  { key: 'analytics', label: 'Analytics', icon: '◈' },
];

export function Sidebar({ active = 'dashboard' }: SidebarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        <Text style={styles.brandName}>StatuScope</Text>
        <Text style={styles.brandSubtitle}>HEALTHCARE ANALYTICS</Text>
      </View>

      <View style={styles.nav}>
        {navItems.map((item) => {
          const isActive = active === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.navItem, isActive && styles.navItemActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.navIcon, isActive && styles.navIconActive]}>
                {item.icon}
              </Text>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.logout} activeOpacity={0.7}>
        <Text style={styles.logoutIcon}>⏻</Text>
        <Text style={styles.logoutLabel}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 240,
    backgroundColor: '#FAFBFC',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  brand: {
    marginBottom: 32,
    paddingLeft: 4,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D4ED8',
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1.2,
  },
  nav: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 6,
  },
  navItemActive: {
    backgroundColor: '#EEF2FF',
  },
  navIcon: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 12,
    width: 20,
    textAlign: 'center',
  },
  navIconActive: {
    color: '#1D4ED8',
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  navLabelActive: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 16,
  },
  logoutIcon: {
    fontSize: 16,
    color: '#9CA3AF',
    marginRight: 12,
    width: 20,
    textAlign: 'center',
  },
  logoutLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
});