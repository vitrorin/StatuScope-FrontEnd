export function EstadoSinAlertas() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="text-green-700 font-semibold text-sm mb-1">Sin alertas activas</p>
      <p className="text-slate-500 text-xs leading-relaxed">
        No se detectaron brotes en la zona del paciente que coincidan con la vigilancia epidemiológica actual.
      </p>
    </div>
  )
}
