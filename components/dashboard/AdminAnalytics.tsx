import React from 'react';
import { AnalyticsScreen } from '@/components/dashboard/DoctorAnalytics';
import { adminNavigationLinks, adminSidebarItems } from '@/components/dashboard/adminNavigation';

export function AdminAnalytics() {
  return (
    <AnalyticsScreen
      active="analytics"
      sectionLabel="Analytics"
      searchPlaceholder="Search hospital metrics..."
      links={adminNavigationLinks}
      sidebarItems={adminSidebarItems}
    />
  );
}

export default AdminAnalytics;
