
export type InlineWarningBannerVariant = 'critical' | 'warning' | 'info';

export interface InlineWarningBannerProps {
  title?: string;
  message: string;
  variant?: InlineWarningBannerVariant;
  className?: string;
}

const variantStyles: Record<
  InlineWarningBannerVariant,
  { background: string; border: string; icon: string; titleColor: string; messageColor: string }
> = {
  critical: {
    background: 'bg-red-50',
    border: 'border-red-200',
    icon: '⚠️',
    titleColor: 'text-red-600',
    messageColor: 'text-red-800',
  },
  warning: {
    background: 'bg-amber-50',
    border: 'border-amber-200',
    icon: '⚡',
    titleColor: 'text-amber-600',
    messageColor: 'text-amber-800',
  },
  info: {
    background: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'ℹ️',
    titleColor: 'text-blue-700',
    messageColor: 'text-blue-800',
  },
};

export function InlineWarningBanner({ title, message, variant = 'warning', className = '' }: InlineWarningBannerProps) {
  const colors = variantStyles[variant];

  return (
    <div
      className={`flex flex-row items-start border rounded-[10px] p-3.5 w-full ${colors.background} ${colors.border} ${className}`}
    >
      <span className="text-base mr-3 mt-0.5">{colors.icon}</span>
      <div className="flex-1">
        {title && <p className={`text-[13px] font-semibold mb-1 ${colors.titleColor}`}>{title}</p>}
        <p className={`text-[13px] leading-[18px] ${colors.messageColor}`}>{message}</p>
      </div>
    </div>
  );
}
