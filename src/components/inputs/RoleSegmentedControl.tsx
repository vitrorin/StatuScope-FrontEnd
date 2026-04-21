
export interface SegmentOption {
  label: string;
  value: string;
}

export interface RoleSegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function RoleSegmentedControl({ options, value, onChange, className = '' }: RoleSegmentedControlProps) {
  return (
    <div className={`flex flex-row bg-gray-100 rounded-[10px] p-1 w-full ${className}`}>
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm text-center transition-all
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
