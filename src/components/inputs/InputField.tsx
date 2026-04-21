import { useState, type ReactNode } from 'react';

export type InputFieldType = 'text' | 'password' | 'email' | 'number';

export interface InputFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  type?: InputFieldType;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  hint?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  onChangeText?: (text: string) => void;
  className?: string;
}

export function InputField({
  label,
  placeholder,
  value,
  type = 'text',
  leftIcon,
  rightIcon,
  hint,
  error,
  disabled = false,
  required = false,
  onChangeText,
  className = '',
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const borderColor = error
    ? 'border-red-500'
    : isFocused
    ? 'border-blue-700 border-2'
    : 'border-gray-200';

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <div className="flex flex-row items-center mb-2">
          <span className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>{label}</span>
          {required && <span className="text-sm text-red-500 ml-1">*</span>}
        </div>
      )}
      <div
        className={`flex flex-row items-center border rounded-xl px-4 h-12 transition-colors
          ${borderColor}
          ${disabled ? 'bg-gray-50 border-gray-200' : 'bg-white'}`}
      >
        {leftIcon && <span className="mr-3">{leftIcon}</span>}
        <input
          className={`flex-1 text-base bg-transparent outline-none placeholder:text-slate-400
            ${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-900'}`}
          placeholder={placeholder}
          value={value}
          type={type === 'password' && !isPasswordVisible ? 'password' : type === 'email' ? 'email' : type === 'number' ? 'number' : 'text'}
          disabled={disabled}
          onChange={(e) => onChangeText?.(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {type === 'password' ? (
          <button className="p-1 ml-3" onClick={() => setIsPasswordVisible(!isPasswordVisible)} type="button">
            <span className="text-base">{isPasswordVisible ? '👁️' : '👁️‍🗨️'}</span>
          </button>
        ) : rightIcon ? (
          <span className="ml-3">{rightIcon}</span>
        ) : null}
      </div>
      {error ? (
        <p className="text-xs text-red-500 mt-1.5">{error}</p>
      ) : hint ? (
        <p className="text-xs text-gray-500 mt-1.5">{hint}</p>
      ) : null}
    </div>
  );
}
