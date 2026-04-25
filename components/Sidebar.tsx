import React from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export type SidebarActive = 'dashboard' | 'diagnosis' | 'analytics';

export interface SidebarProps {
  active?: SidebarActive;
  onLogout?: () => void;
  links?: Partial<Record<SidebarActive, string>>;
}

interface NavItem {
  key: SidebarActive;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <MaterialCommunityIcons name="view-grid-outline" size={18} color="#475569" />,
  },
  {
    key: 'diagnosis',
    label: 'Diagnosis',
    icon: <MaterialCommunityIcons name="stethoscope" size={18} color="#475569" />,
  },
  {
    key: 'analytics',
    label: 'Analytics',
    icon: <Feather name="bar-chart-2" size={18} color="#475569" />,
  },
];

export function Sidebar({ active = 'dashboard', onLogout, links }: SidebarProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.brandWrap}>
        <View style={styles.brandBadge}>
          <MaterialCommunityIcons name="radar" size={18} color="#FFFFFF" />
        </View>
        <View>
          <Text style={styles.brandName}>StatuScope</Text>
          <Text style={styles.brandSubtitle}>HEALTHCARE</Text>
          <Text style={styles.brandSubtitle}>ANALYTICS</Text>
        </View>
      </View>

      <View style={styles.nav}>
        {navItems.map((item) => {
          const isActive = active === item.key;

          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.navItem, isActive && styles.navItemActive]}
              activeOpacity={0.75}
              disabled={!links?.[item.key] || isActive}
              onPress={() => {
                const targetHref = links?.[item.key];
                if (!targetHref || isActive) return;
                router.replace(targetHref as never);
              }}
            >
              <View style={styles.navIcon}>{item.icon}</View>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.logoutWrap}>
        <TouchableOpacity style={styles.logout} activeOpacity={0.75} onPress={onLogout}>
          <Feather name="power" size={18} color="#64748B" />
          <Text style={styles.logoutLabel}>Log out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 256,
    backgroundColor: '#FCFDFE',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0, 3, 184, 0.10)',
    paddingRight: 1,
  },
  brandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 23,
    paddingBottom: 24,
  },
  brandBadge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#0003B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '700',
    color: '#0003B8',
  },
  brandSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  nav: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 10,
  },
  navItemActive: {
    backgroundColor: 'rgba(0, 3, 184, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(0, 3, 184, 0.10)',
  },
  navIcon: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#526174',
  },
  navLabelActive: {
    color: '#0003B8',
  },
  logoutWrap: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingTop: 17,
    paddingBottom: 16,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  logoutLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: 'rgba(71, 85, 105, 0.72)',
  },
});
