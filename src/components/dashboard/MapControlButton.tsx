
export type MapControlButtonVariant = 'default' | 'primary' | 'ghost';

export interface MapControlButtonProps {
  label?: string;
  icon?: string;
  variant?: MapControlButtonVariant;
  disabled?: boolean;
  onPress?: () => void;
  className?: string;
}

const variantClasses: Record<MapControlButtonVariant, string> = {
  default: 'bg-white border border-gray-200 shadow-sm text-gray-700',
  primary: 'bg-blue-700 text-white border-transparent',
  ghost: 'bg-transparent text-gray-500 border-transparent',
};

export function MapControlButton({
  label,
  icon,
  variant = 'default',
  disabled = false,
  onPress,
  className = '',
}: MapControlButtonProps) {
  return (
    <button
      className={`w-9 h-9 rounded-lg flex items-center justify-center text-base font-medium border transition-opacity
        ${variantClasses[variant]}
        ${disabled ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60' : 'cursor-pointer'}
        ${className}`}
      onClick={onPress}
      disabled={disabled}
    >
      {icon || label}
    </button>
  );
}
