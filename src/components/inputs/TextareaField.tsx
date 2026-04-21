import { useState } from 'react';

export interface TextareaFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  rows?: number;
  onChangeText?: (text: string) => void;
  className?: string;
}

export function TextareaField({
  label,
  placeholder,
  value,
  hint,
  error,
  disabled = false,
  rows = 4,
  onChangeText,
  className = '',
}: TextareaFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? 'border-red-500'
    : isFocused
    ? 'border-blue-700 border-2'
    : 'border-gray-200';

  return (
    <div className={`mb-4 w-full ${className}`}>
      {label && (
        <p className={`text-sm font-medium mb-2 ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>{label}</p>
      )}
      <textarea
        className={`w-full border rounded-xl p-4 text-base leading-6 outline-none resize-none transition-colors
          placeholder:text-slate-400
          ${borderColor}
          ${disabled ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-900'}`}
        placeholder={placeholder}
        value={value}
        rows={rows}
        disabled={disabled}
        onChange={(e) => onChangeText?.(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {error ? (
        <p className="text-xs text-red-500 mt-1.5">{error}</p>
      ) : hint ? (
        <p className="text-xs text-gray-500 mt-1.5">{hint}</p>
      ) : null}
    </div>
  );
}
