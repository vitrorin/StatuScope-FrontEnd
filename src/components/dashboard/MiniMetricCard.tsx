import { type ReactNode } from 'react';

export interface MiniMetricCardProps {
  label: string;
  value: string;
  supportingText?: string;
  icon?: ReactNode;
  trend?: string;
  trendType?: 'positive' | 'danger' | 'warning' | 'neutral';
  className?: string;
}

const trendColors: Record<string, string> = {
  positive: 'text-green-500',
  danger: 'text-red-500',
  warning: 'text-amber-500',
  neutral: 'text-gray-500',
};

export function MiniMetricCard({
  label,
  value,
  supportingText,
  icon,
  trend,
  trendType = 'neutral',
  className = '',
}: MiniMetricCardProps) {
  return (
    <div className={`bg-white rounded-[14px] p-3.5 shadow-sm w-[140px] ${className}`}>
      {icon && <div className="mb-2">{icon}</div>}
      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.5px] mb-1">{label}</p>
      <p className="text-[22px] font-bold text-gray-900">{value}</p>
      {supportingText && <p className="text-[11px] text-gray-500 mt-1">{supportingText}</p>}
      {trend && <p className={`text-[11px] font-medium mt-1 ${trendColors[trendType]}`}>{trend}</p>}
    </div>
  );
}
