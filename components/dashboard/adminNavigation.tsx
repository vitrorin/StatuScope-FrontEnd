import React from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SidebarNavItem } from '@/components/Sidebar';

export const adminSidebarItems: SidebarNavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <MaterialCommunityIcons name="view-grid-outline" size={18} color="#475569" />,
  },
  {
    key: 'analytics',
    label: 'Analytics',
    icon: <Feather name="bar-chart-2" size={18} color="#475569" />,
  },
  {
    key: 'resources',
    label: 'Resources',
    icon: <MaterialCommunityIcons name="clipboard-text-outline" size={18} color="#475569" />,
  },
  {
    key: 'recommendations',
    label: 'Recommendations',
    icon: <Feather name="settings" size={18} color="#475569" />,
  },
  {
    key: 'users',
    label: 'Users',
    icon: <Feather name="users" size={18} color="#475569" />,
  },
];

export function getAdminSidebarItems(language: string = 'en'): SidebarNavItem[] {
  const spanish = language === 'es';
  return [
    {
      key: 'dashboard',
      label: spanish ? 'Panel' : 'Dashboard',
      icon: <MaterialCommunityIcons name="view-grid-outline" size={18} color="#475569" />,
    },
    {
      key: 'analytics',
      label: spanish ? 'Analiticas' : 'Analytics',
      icon: <Feather name="bar-chart-2" size={18} color="#475569" />,
    },
    {
      key: 'resources',
      label: spanish ? 'Recursos' : 'Resources',
      icon: <MaterialCommunityIcons name="clipboard-text-outline" size={18} color="#475569" />,
    },
    {
      key: 'recommendations',
      label: spanish ? 'Recomendaciones' : 'Recommendations',
      icon: <Feather name="settings" size={18} color="#475569" />,
    },
    {
      key: 'users',
      label: spanish ? 'Usuarios' : 'Users',
      icon: <Feather name="users" size={18} color="#475569" />,
    },
  ];
}

export const adminNavigationLinks = {
  dashboard: '/dashboard/administrator',
  analytics: '/admin/analytics',
  resources: '/admin/resources',
  recommendations: '/admin/recommendations',
  users: '/admin/users',
} as const;
