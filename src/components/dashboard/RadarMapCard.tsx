import { MapLegend } from './MapLegend';
import { MapControlButton } from './MapControlButton';

export interface RadarMapCardProps {
  title: string;
  subtitle?: string;
  legendItems?: { label: string; color: string }[];
  showOverlayPanel?: boolean;
  overlayTitle?: string;
  overlayItems?: { label: string; value: string; color?: string }[];
  showControls?: boolean;
  footerTextLeft?: string;
  footerTextRight?: string;
  className?: string;
}

export function RadarMapCard({
  title,
  subtitle,
  legendItems,
  showOverlayPanel = false,
  overlayTitle,
  overlayItems,
  showControls = false,
  footerTextLeft,
  footerTextRight,
  className = '',
}: RadarMapCardProps) {
  return (
    <div className={`bg-white rounded-2xl p-5 shadow w-[560px] ${className}`}>
      <div className="mb-4">
        <div className="mb-3">
          <p className="text-lg font-semibold text-gray-900">{title}</p>
          {subtitle && <p className="text-[13px] text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {legendItems && legendItems.length > 0 && (
          <MapLegend items={legendItems} orientation="horizontal" />
        )}
      </div>

      <div className="relative h-[280px] bg-slate-50 rounded-xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col gap-2">
            {[...Array(5)].map((_, row) => (
              <div key={row} className="flex flex-row gap-2">
                {[...Array(5)].map((_, col) => {
                  const isCenter = row === 2 && col === 2;
                  const isHot = (row === 1 && col === 1) || (row === 1 && col === 3) || (row === 3 && col === 2);
                  return (
                    <div
                      key={col}
                      className={`w-10 h-10 rounded-lg ${isCenter ? 'bg-blue-100' : isHot ? 'bg-red-200' : 'bg-slate-200'}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute w-3 h-3 rounded-full border-2 border-white bg-red-500" style={{ top: '30%', left: '25%' }} />
            <div className="absolute w-3 h-3 rounded-full border-2 border-white bg-amber-500" style={{ top: '45%', left: '60%' }} />
            <div className="absolute w-3 h-3 rounded-full border-2 border-white bg-blue-700" style={{ top: '65%', left: '40%' }} />
          </div>
        </div>

        {showOverlayPanel && (
          <div className="absolute top-3 right-3 bg-white rounded-[10px] p-3 shadow-md min-w-[140px]">
            <p className="text-xs font-semibold text-gray-900 mb-2">{overlayTitle || 'Info'}</p>
            {overlayItems?.map((item, index) => (
              <div key={index} className="flex flex-row items-center mb-1.5">
                <span
                  className="w-2 h-2 rounded-full mr-2 shrink-0"
                  style={{ backgroundColor: item.color || '#1D4ED8' }}
                />
                <span className="text-[11px] text-gray-500 flex-1">{item.label}</span>
                <span className="text-[11px] font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {showControls && (
          <div className="absolute right-3 bottom-3 flex flex-col gap-2">
            <MapControlButton icon="+" variant="default" />
            <MapControlButton icon="−" variant="default" />
            <MapControlButton icon="◎" variant="default" />
          </div>
        )}
      </div>

      {(footerTextLeft || footerTextRight) && (
        <div className="flex flex-row justify-between mt-3 pt-3 border-t border-gray-200">
          <span className="text-[11px] text-slate-400">{footerTextLeft}</span>
          <span className="text-[11px] text-slate-400">{footerTextRight}</span>
        </div>
      )}
    </div>
  );
}
