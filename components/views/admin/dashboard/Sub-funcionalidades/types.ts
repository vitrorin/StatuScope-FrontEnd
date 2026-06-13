export interface AdminDashboardAlert {
  id: string;
  title: string;
  description: string;
  variant: 'critical' | 'warning' | 'success' | 'info' | 'neutral';
  department: string;
  area?: string;
  priority: string;
  recommendedAction: string;
  caseCount?: number | null;
  caseLabel?: string | null;
  confirmationStatus?: string | null;
  municipalityName?: string | null;
  stateName?: string | null;
}

export interface AdminDashboardMetric {
  id: string;
  title: string;
  value: string;
  valueUnit?: string;
  badge?: string;
  badgeColor?: string;
  subtitle?: string;
  progressValue?: number;
  progressColor?: string;
  segmented?: boolean;
  tone?: 'default' | 'critical' | 'warning' | 'positive' | 'info';
  detailTitle: string;
  detailSummary: string;
  signalLabel: string;
  recommendedAction: string;
  insightCriteria?: string;
  insightsVariant?: 'list' | 'ranked';
  insights?: AdminDashboardMetricInsight[];
  relatedAlerts?: AdminDashboardMetricInsight[];
}

export interface AdminDashboardMetricInsight {
  title: string;
  location: string;
  cases: string;
  severity: string;
  color: string;
  meta?: string | null;
}

export interface AdminDashboardZone {
  id: string;
  name: string;
  risk: string;
  disease: string;
  cases: string;
  radius: string;
  priority: string;
  note: string;
  recommendedAction: string;
  municipalityName?: string | null;
  stateName?: string | null;
  top: string;
  left: string;
  latitude?: number;
  longitude?: number;
  borderColor: string;
  fillColor?: string;
}
