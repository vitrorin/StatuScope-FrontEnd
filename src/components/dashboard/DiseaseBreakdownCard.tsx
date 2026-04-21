import { ProgressMetricRow } from './ProgressMetricRow';

export interface DiseaseBreakdownRow {
  label: string;
  valueText: string;
  progress: number;
  barColor?: string;
}

export interface DiseaseBreakdownSummary {
  label: string;
  value: string;
  valueColor?: string;
}

export interface DiseaseBreakdownCardProps {
  title: string;
  rows: DiseaseBreakdownRow[];
  summaryItems?: DiseaseBreakdownSummary[];
  buttonLabel?: string;
  onButtonPress?: () => void;
  className?: string;
}

export function DiseaseBreakdownCard({
  title,
  rows,
  summaryItems,
  buttonLabel,
  onButtonPress,
  className = '',
}: DiseaseBreakdownCardProps) {
  return (
    <div className={`bg-white rounded-2xl p-5 shadow w-80 ${className}`}>
      <p className="text-base font-semibold text-gray-900 mb-5">{title}</p>

      <div className="mb-5">
        {rows.map((row, index) => (
          <ProgressMetricRow
            key={index}
            label={row.label}
            valueText={row.valueText}
            progress={row.progress}
            barColor={row.barColor}
          />
        ))}
      </div>

      {summaryItems && summaryItems.length > 0 && (
        <div className="flex flex-row justify-between pt-4 border-t border-gray-200 mb-4">
          {summaryItems.map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <span className="text-[11px] text-gray-500 mb-1">{item.label}</span>
              <span
                className="text-base font-bold text-gray-900"
                style={item.valueColor ? { color: item.valueColor } : undefined}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {buttonLabel && (
        <button
          className="w-full bg-blue-700 rounded-[10px] py-3 text-sm font-semibold text-white hover:bg-blue-800 transition-colors"
          onClick={onButtonPress}
        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
}
