interface EstadoErrorProps {
  onReintentar: () => void
}

export function EstadoError({ onReintentar }: EstadoErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <p className="text-red-700 font-semibold text-sm mb-1">Error de conexión</p>
      <p className="text-slate-500 text-xs leading-relaxed mb-4">
        No fue posible consultar el sistema de vigilancia epidemiológica. Verifique su conexión e intente de nuevo.
      </p>
      <button
        onClick={onReintentar}
        className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors shadow-sm"
      >
        Reintentar
      </button>
    </div>
  )
}
