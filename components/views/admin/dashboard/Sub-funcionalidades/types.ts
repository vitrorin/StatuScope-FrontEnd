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
  id: string;
  title: string;
  value: string;
  badge?: string;
  status?: 'positive' | 'danger' | 'warning' | 'neutral';
  subtitle?: string;
  progressValue?: number;
  progressColor?: string;
  detailTitle: string;
  detailSummary: string;
  signalLabel: string;
  recommendedAction: string;
  iconKey?: 'bed' | 'activity' | 'users' | 'shield';
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
  latitude?: number;
  longitude?: number;
  borderColor: string;
  fillColor?: string;
}
