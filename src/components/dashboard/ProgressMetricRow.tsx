
export interface ProgressMetricRowProps {
  label: string;
  valueText: string;
  progress: number;
  barColor?: string;
  className?: string;
}

export function ProgressMetricRow({
  label,
  valueText,
  progress,
  barColor = '#1D4ED8',
  className = '',
}: ProgressMetricRowProps) {
  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex flex-row justify-between items-center mb-2">
        <span className="text-[13px] font-medium text-gray-700">{label}</span>
        <span className="text-[13px] font-semibold text-gray-900">{valueText}</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}
