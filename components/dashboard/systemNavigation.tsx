import React from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SidebarNavItem } from '@/components/Sidebar';

export function getSystemSidebarItems(language: string = 'en'): SidebarNavItem[] {
  const es = language === 'es';
  return [
    {
      key: 'dashboard',
      label: es ? 'Panel' : 'Dashboard',
      icon: <MaterialCommunityIcons name="view-grid-outline" size={18} color="#475569" />,
    },
    {
      key: 'users',
      label: es ? 'Usuarios y roles' : 'Users & Roles',
      icon: <Feather name="users" size={18} color="#475569" />,
    },
    {
      key: 'hospitals',
      label: es ? 'Hospitales' : 'Hospitals',
      icon: <Feather name="briefcase" size={18} color="#475569" />,
    },
  ];
}

export const systemNavigationLinks = {
  dashboard: '/system/dashboard',
  users: '/system/users',
  hospitals: '/system/hospitals',
} as const;
