import { type ReactNode } from 'react';

export type StatCardStatus = 'positive' | 'danger' | 'warning' | 'neutral';

export interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  badge?: string;
  status?: StatCardStatus;
  trendText?: string;
  showProgress?: boolean;
  progressValue?: number;
  progressColor?: string;
  icon?: ReactNode;
  className?: string;
}

const statusColors: Record<StatCardStatus, { background: string; text: string }> = {
  positive: { background: 'bg-green-100', text: 'text-green-500' },
  danger: { background: 'bg-red-100', text: 'text-red-500' },
  warning: { background: 'bg-amber-100', text: 'text-amber-500' },
  neutral: { background: 'bg-gray-100', text: 'text-gray-500' },
};

export function StatCard({
  title,
  value,
  subtitle,
  badge,
  status = 'neutral',
  trendText,
  showProgress = false,
  progressValue = 0,
  progressColor = '#1D4ED8',
  icon,
  className = '',
}: StatCardProps) {
  const colors = statusColors[status];

  return (
    <div className={`bg-white rounded-[14px] p-3.5 shadow-sm w-[220px] ${className}`}>
      <div className="flex flex-row justify-between items-center mb-2">
        <span className="text-[13px] font-medium text-gray-500 tracking-[0.3px]">{title}</span>
        {badge && (
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${colors.background} ${colors.text}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="flex flex-row items-center">
        {icon && <span className="mr-2">{icon}</span>}
        <span className="text-[28px] font-bold text-gray-900 mb-1">{value}</span>
      </div>
      {subtitle && <p className="text-xs text-gray-500 leading-4">{subtitle}</p>}
      {trendText && <p className={`text-xs font-medium mt-1 ${colors.text}`}>{trendText}</p>}
      {showProgress && (
        <div className="mt-3">
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, Math.max(0, progressValue))}%`,
                backgroundColor: progressColor,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
