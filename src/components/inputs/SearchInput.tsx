import { useState } from 'react';

export interface SearchInputProps {
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
}

export function SearchInput({
  placeholder = 'Search...',
  value,
  disabled = false,
  onChangeText,
  onFocus,
  onBlur,
  className = '',
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={`flex flex-row items-center rounded-[10px] px-3 h-10 border w-full transition-colors
        ${isFocused ? 'border-blue-700 bg-white' : 'border-transparent bg-gray-100'}
        ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
        ${className}`}
    >
      <span className="text-sm mr-2">🔍</span>
      <input
        className={`flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400
          ${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-900'}`}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(e) => onChangeText?.(e.target.value)}
        onFocus={() => { setIsFocused(true); onFocus?.(); }}
        onBlur={() => { setIsFocused(false); onBlur?.(); }}
      />
    </div>
  );
}
