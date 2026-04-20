import { PanelAlertasProps } from '../../types/alerta'
import { EstadoCargando } from './EstadoCargando'
import { EstadoSinAlertas } from './EstadoSinAlertas'
import { EstadoError } from './EstadoError'
import { ListaAlertas } from './ListaAlertas'

export function PanelAlertas({ estado, alertas, onReintentar }: PanelAlertasProps) {
  if (estado === 'idle') return null

  return (
    <aside className="w-72 flex-shrink-0 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col">
      <div className="bg-teal-700 text-white px-4 py-3 rounded-t-lg flex items-center gap-2">
        <svg className="w-4 h-4 text-teal-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <span className="text-sm font-semibold tracking-wide uppercase">
          Alertas Epidemiológicas
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {estado === 'cargando' && <EstadoCargando />}
        {estado === 'sin_alertas' && <EstadoSinAlertas />}
        {estado === 'error' && <EstadoError onReintentar={onReintentar} />}
        {estado === 'con_alertas' && (
          <>
            <p className="text-xs text-slate-500 mb-3 px-1">
              {alertas.length} alerta{alertas.length !== 1 ? 's' : ''} activa{alertas.length !== 1 ? 's' : ''} en la zona
            </p>
            <ListaAlertas alertas={alertas} />
          </>
        )}
      </div>
    </aside>
  )
}
