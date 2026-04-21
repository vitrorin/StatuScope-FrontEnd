import { useState } from 'react';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  options: SelectOption[];
  error?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  className?: string;
}

export function SelectField({
  label,
  placeholder = 'Select an option',
  value,
  options,
  error,
  disabled = false,
  onChange,
  className = '',
}: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  const borderColor = error ? 'border-red-500' : isOpen ? 'border-blue-700' : 'border-gray-200';

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative mb-4 w-full ${className}`}>
      {label && (
        <p className={`text-sm font-medium mb-2 ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>{label}</p>
      )}
      <div
        className={`border rounded-xl overflow-hidden w-full ${borderColor} ${disabled ? 'bg-gray-50' : 'bg-white'}`}
      >
        <button
          type="button"
          className="flex flex-row items-center justify-between w-full px-4 h-12"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <span className={`text-base ${!selectedOption ? 'text-slate-400' : disabled ? 'text-gray-400' : 'text-gray-900'}`}>
            {selectedOption?.label || placeholder}
          </span>
          <span className="text-xs text-gray-500">{isOpen ? '▲' : '▼'}</span>
        </button>
      </div>
      {isOpen && !disabled && (
        <div className="absolute z-10 mt-1 w-full border border-gray-200 rounded-xl bg-white shadow-md max-h-52 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`w-full text-left px-4 py-3 text-base border-b border-gray-100 last:border-b-0 hover:bg-gray-50
                ${option.value === value ? 'bg-indigo-50 text-blue-700 font-medium' : 'text-gray-900'}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}
