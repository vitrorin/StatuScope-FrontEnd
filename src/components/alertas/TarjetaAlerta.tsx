import { Alerta } from '../../types/alerta'
import { BadgeSeveridad } from './BadgeSeveridad'

interface TarjetaAlertaProps {
  alerta: Alerta
}

const borderColor: Record<Alerta['severidad'], string> = {
  alto: 'border-l-red-500',
  medio: 'border-l-amber-500',
  bajo: 'border-l-blue-500',
}

const tendenciaColor = (v: number) =>
  v > 0 ? 'text-red-600' : v < 0 ? 'text-green-600' : 'text-slate-500'

export function TarjetaAlerta({ alerta }: TarjetaAlertaProps) {
  const tendenciaTexto =
    alerta.tendenciaSemanal > 0
      ? `↑ +${alerta.tendenciaSemanal} vs semana anterior`
      : alerta.tendenciaSemanal < 0
      ? `↓ ${alerta.tendenciaSemanal} vs semana anterior`
      : '→ Sin cambio vs semana anterior'

  return (
    <div className={`bg-white border border-slate-200 border-l-4 ${borderColor[alerta.severidad]} rounded-md shadow-sm p-3`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-semibold text-slate-800 text-sm leading-tight">
          {alerta.enfermedad}
        </span>
        <BadgeSeveridad severidad={alerta.severidad} />
      </div>

      <div className="text-xs text-slate-500 mb-1">
        📍 CP {alerta.codigoPostal} &nbsp;·&nbsp; {alerta.casosConfirmados} casos confirmados
      </div>
      <div className={`text-xs font-medium mb-3 ${tendenciaColor(alerta.tendenciaSemanal)}`}>
        {tendenciaTexto}
      </div>

      <div className="border-t border-slate-100 pt-2 mb-2">
        <p className="text-slate-400 text-xs uppercase tracking-wide mb-1 font-semibold">
          Pruebas sugeridas
        </p>
        <p className="text-slate-600 text-xs leading-relaxed">
          {alerta.pruebasSugeridas.join(' · ')}
        </p>
      </div>

      <a
        href={alerta.perfilUrl}
        className="text-teal-600 text-xs font-medium hover:text-teal-800 hover:underline transition-colors"
      >
        Ver perfil epidemiológico →
      </a>
    </div>
  )
}
