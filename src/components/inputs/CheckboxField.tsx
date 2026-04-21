
export interface CheckboxFieldProps {
  label: string;
  checked?: boolean;
  disabled?: boolean;
  helperText?: string;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function CheckboxField({
  label,
  checked = false,
  disabled = false,
  helperText,
  onChange,
  className = '',
}: CheckboxFieldProps) {
  return (
    <div className={`mb-4 w-full ${className}`}>
      <label className={`flex flex-row items-center gap-3 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        <div
          className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors shrink-0
            ${checked && !disabled ? 'bg-blue-700 border-blue-700' : ''}
            ${!checked && !disabled ? 'bg-white border-gray-300' : ''}
            ${disabled ? 'bg-gray-100 border-gray-200' : ''}`}
          onClick={() => !disabled && onChange?.(!checked)}
        >
          {checked && <span className="text-white text-xs font-bold leading-none">✓</span>}
        </div>
        <span className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>{label}</span>
      </label>
      {helperText && (
        <p className={`text-xs mt-1.5 ml-8 ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>{helperText}</p>
      )}
    </div>
  );
}
