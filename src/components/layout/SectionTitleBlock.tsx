import { type ReactNode } from 'react';

export interface SectionTitleBlockProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  className?: string;
}

export function SectionTitleBlock({ eyebrow, title, subtitle, rightSlot, className = '' }: SectionTitleBlockProps) {
  return (
    <div className={`flex flex-row items-start justify-between py-4 w-full ${className}`}>
      <div className="flex-1">
        {eyebrow && (
          <p className="text-xs font-medium text-blue-700 uppercase tracking-[0.5px] mb-1.5">{eyebrow}</p>
        )}
        <h2 className="text-[28px] font-bold text-gray-900 leading-[34px]">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-2 leading-5">{subtitle}</p>}
      </div>
      {rightSlot && <div className="ml-6 flex items-end">{rightSlot}</div>}
    </div>
  );
}
