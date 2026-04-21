
export type StatusBadgeVariant = 'critical' | 'success' | 'warning' | 'neutral' | 'info' | 'role';

export interface StatusBadgeProps {
  label: string;
  variant?: StatusBadgeVariant;
  className?: string;
}

const variantClasses: Record<StatusBadgeVariant, string> = {
  critical: 'bg-red-100 text-red-600',
  success: 'bg-green-100 text-green-600',
  warning: 'bg-amber-100 text-amber-600',
  neutral: 'bg-gray-100 text-gray-500',
  info: 'bg-blue-100 text-blue-600',
  role: 'bg-indigo-50 text-blue-700',
};

export function StatusBadge({ label, variant = 'neutral', className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.3px] ${variantClasses[variant]} ${className}`}
    >
      {label}
    </span>
  );
}
