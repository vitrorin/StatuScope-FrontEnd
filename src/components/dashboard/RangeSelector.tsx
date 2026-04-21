
export interface RangeOption {
  label: string;
  value: string;
}

export interface RangeSelectorProps {
  options: RangeOption[];
  value: string;
  label?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function RangeSelector({ options, value, label, onChange, className = '' }: RangeSelectorProps) {
  return (
    <div className={`inline-flex flex-col items-start ${className}`}>
      {label && (
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.5px] mb-2">{label}</span>
      )}
      <div className="flex flex-row bg-white border border-gray-200 rounded-lg overflow-hidden">
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              className={`py-2 px-3.5 text-[13px] font-medium border-r border-gray-200 last:border-r-0 transition-colors
                ${isSelected ? 'bg-blue-800 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => onChange?.(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
