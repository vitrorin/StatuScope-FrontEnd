
export interface MiniBarChartBar {
  label: string;
  value: number;
  active?: boolean;
}

export interface MiniBarChartListItem {
  label: string;
  value: string;
  valueColor?: string;
}

export interface MiniBarChartCardProps {
  title: string;
  subtitle?: string;
  bars: MiniBarChartBar[];
  listItems?: MiniBarChartListItem[];
  buttonLabel?: string;
  onButtonPress?: () => void;
  className?: string;
}

export function MiniBarChartCard({
  title,
  subtitle,
  bars,
  listItems,
  buttonLabel,
  onButtonPress,
  className = '',
}: MiniBarChartCardProps) {
  const maxValue = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div className={`bg-white rounded-2xl p-5 shadow w-80 ${className}`}>
      <div className="flex flex-row justify-between items-start mb-5">
        <div>
          <p className="text-base font-semibold text-gray-900">{title}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>

      <div className="flex flex-row justify-between items-end h-[100px] mb-5 px-2">
        {bars.map((bar, index) => {
          const heightPercent = (bar.value / maxValue) * 100;
          const isActive = bar.active === true;
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="w-6 h-20 bg-gray-100 rounded-md flex items-end overflow-hidden">
                <div
                  className="w-full rounded-md"
                  style={{
                    height: `${Math.max(heightPercent, 8)}%`,
                    backgroundColor: isActive ? '#1D4ED8' : '#E2E8F0',
                    minHeight: 8,
                  }}
                />
              </div>
              <span className="text-[10px] text-gray-500 mt-2">{bar.label}</span>
            </div>
          );
        })}
      </div>

      {listItems && listItems.length > 0 && (
        <div className="border-t border-gray-200 pt-4 mb-4">
          {listItems.map((item, index) => (
            <div key={index} className="flex flex-row justify-between mb-2">
              <span className="text-[13px] text-gray-500">{item.label}</span>
              <span
                className="text-[13px] font-semibold text-gray-900"
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
          className="w-full bg-gray-100 rounded-[10px] py-3 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          onClick={onButtonPress}
        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
}
