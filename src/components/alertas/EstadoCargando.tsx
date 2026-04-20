export function EstadoCargando() {
  return (
    <div className="flex flex-col gap-3 py-2">
      {[1, 2].map((i) => (
        <div key={i} className="animate-pulse bg-slate-50 border border-slate-200 rounded-md p-3">
          <div className="flex justify-between mb-2">
            <div className="h-3 bg-slate-200 rounded w-2/5" />
            <div className="h-3 bg-slate-200 rounded w-1/5" />
          </div>
          <div className="h-2.5 bg-slate-100 rounded w-3/5 mb-1.5" />
          <div className="h-2.5 bg-slate-100 rounded w-4/5 mb-3" />
          <div className="border-t border-slate-100 pt-2">
            <div className="h-2 bg-slate-100 rounded w-1/3 mb-1" />
            <div className="h-2 bg-slate-100 rounded w-3/4" />
          </div>
        </div>
      ))}
      <p className="text-center text-slate-500 text-xs mt-1 flex items-center justify-center gap-1.5">
        <span className="inline-block w-3 h-3 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        Consultando base de datos epidemiológica...
      </p>
    </div>
  )
}
