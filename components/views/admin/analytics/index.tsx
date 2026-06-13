import React from 'react';
import { AnalyticsScreen } from '@/components/views/doctor/analytics';
import { adminNavigationLinks, getAdminSidebarItems } from '@/components/dashboard/adminNavigation';
import { useTranslation } from '@/i18n';
import { isSpanish } from '@/components/views/admin/localization';

export function AdminAnalytics() {
  const { language } = useTranslation();
  return (
    <AnalyticsScreen
      active="analytics"
      sectionLabel={isSpanish(language) ? 'Analiticas' : 'Analytics'}
      persona="admin"
      links={adminNavigationLinks}
      sidebarItems={getAdminSidebarItems(language)}
    />
  );
}

export default AdminAnalytics;
