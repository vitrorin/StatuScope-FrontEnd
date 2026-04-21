
export type DetectionBannerVariant = 'info' | 'warning' | 'critical';

export interface DetectionBannerProps {
  message: string;
  actionLabel?: string;
  variant?: DetectionBannerVariant;
  onActionPress?: () => void;
  className?: string;
}

const variantStyles: Record<DetectionBannerVariant, { background: string; icon: string; messageColor: string }> = {
  info: { background: 'bg-indigo-50', icon: '🔍', messageColor: 'text-indigo-800' },
  warning: { background: 'bg-amber-50', icon: '⚠️', messageColor: 'text-amber-800' },
  critical: { background: 'bg-red-100', icon: '🚨', messageColor: 'text-red-800' },
};

export function DetectionBanner({
  message,
  actionLabel,
  variant = 'info',
  onActionPress,
  className = '',
}: DetectionBannerProps) {
  const colors = variantStyles[variant];

  return (
    <div className={`flex flex-row items-center py-3.5 px-4 rounded-[10px] w-full ${colors.background} ${className}`}>
      <span className="text-sm mr-3">{colors.icon}</span>
      <p className={`flex-1 text-[13px] font-medium leading-[18px] ${colors.messageColor}`}>{message}</p>
      {actionLabel && (
        <button
          onClick={onActionPress}
          className="text-[13px] font-semibold text-blue-700 ml-3 hover:underline"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
