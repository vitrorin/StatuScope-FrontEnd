export interface AdminDashboardAlert {
  id: string;
  title: string;
  description: string;
  variant: 'critical' | 'warning' | 'info' | 'neutral';
  department: string;
  priority: string;
  recommendedAction: string;
}

export interface AdminDashboardMetric {
  title: string;
  value: string;
  badge?: string;
  badgeColor?: string;
  subtitle?: string;
  progressValue?: number;
  progressColor?: string;
  segmented?: boolean;
  tone?: 'default' | 'critical';
  detailTitle: string;
  detailSummary: string;
  signalLabel: string;
  recommendedAction: string;
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
  top: string;
  left: string;
  borderColor: string;
  fillColor?: string;
}
