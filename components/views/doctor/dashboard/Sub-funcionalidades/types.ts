export interface DoctorDashboardAlert {
  id: string;
  title: string;
  description: string;
  variant: 'critical' | 'warning' | 'info' | 'neutral';
  area: string;
  priority: string;
  recommendedAction: string;
}

export interface DoctorDashboardMetric {
  title: string;
  value: string;
  badge?: string;
  status?: 'positive' | 'danger' | 'warning' | 'neutral';
  subtitle?: string;
  detailTitle: string;
  detailSummary: string;
  signalLabel: string;
  recommendedAction: string;
  iconKey?: 'trend';
}

export interface DoctorDashboardZone {
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
}
