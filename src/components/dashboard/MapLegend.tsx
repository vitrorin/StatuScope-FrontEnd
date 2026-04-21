
export interface MapLegendItem {
  label: string;
  color: string;
  value?: string;
}

export interface MapLegendProps {
  items: MapLegendItem[];
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export function MapLegend({ items, orientation = 'vertical', className = '' }: MapLegendProps) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div className={`${isHorizontal ? 'flex flex-row flex-wrap gap-4' : 'flex flex-col gap-2'} ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="flex flex-row items-center">
          <span
            className="w-2.5 h-2.5 rounded-full mr-2 shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs text-gray-500">{item.label}</span>
          {item.value && <span className="text-xs font-semibold text-gray-900 ml-2">{item.value}</span>}
        </div>
      ))}
    </div>
  );
}
