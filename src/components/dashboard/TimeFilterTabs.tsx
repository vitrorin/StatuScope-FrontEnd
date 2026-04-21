
export interface TimeFilterOption {
  label: string;
  value: string;
}

export interface TimeFilterTabsProps {
  options: TimeFilterOption[];
  value: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function TimeFilterTabs({ options, value, onChange, className = '' }: TimeFilterTabsProps) {
  return (
    <div className={`flex flex-row bg-gray-100 rounded-[10px] p-1 ${className}`}>
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            className={`px-4 py-2 rounded-lg text-[13px] transition-all
              ${isSelected ? 'bg-white shadow font-semibold text-gray-900' : 'font-medium text-gray-500'}`}
            onClick={() => onChange?.(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
