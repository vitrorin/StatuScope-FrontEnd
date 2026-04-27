import React from 'react';
import { AnalyticsScreen } from '@/components/views/doctor/analytics';
import { adminNavigationLinks, adminSidebarItems } from '@/components/dashboard/adminNavigation';

export function AdminAnalytics() {
  return (
    <AnalyticsScreen
      active="analytics"
      sectionLabel="Analytics"
      searchPlaceholder="Search hospital metrics..."
      userName="Dr. Sarah Chen"
      userId="ID: 442910"
      avatarText="SC"
      links={adminNavigationLinks}
      sidebarItems={adminSidebarItems}
    />
  );
}

export default AdminAnalytics;
