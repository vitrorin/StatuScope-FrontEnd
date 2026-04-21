
export type AlertCardVariant = 'critical' | 'warning' | 'info' | 'neutral';

export interface AlertCardProps {
  title: string;
  description: string;
  variant?: AlertCardVariant;
  className?: string;
}

const variantStyles: Record<AlertCardVariant, { bar: string; background: string }> = {
  critical: { bar: 'bg-red-500', background: 'bg-red-50' },
  warning: { bar: 'bg-amber-500', background: 'bg-amber-50' },
  info: { bar: 'bg-blue-700', background: 'bg-blue-50' },
  neutral: { bar: 'bg-gray-400', background: 'bg-gray-50' },
};

export function AlertCard({ title, description, variant = 'info', className = '' }: AlertCardProps) {
  const colors = variantStyles[variant];

  return (
    <div
      className={`flex flex-row rounded-[14px] border border-gray-200 p-4 overflow-hidden w-80 ${colors.background} ${className}`}
    >
      <div className={`w-1 rounded-sm mr-3.5 shrink-0 ${colors.bar}`} />
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900 mb-1">{title}</p>
        <p className="text-[13px] text-gray-500 leading-[18px]">{description}</p>
      </div>
    </div>
  );
}
