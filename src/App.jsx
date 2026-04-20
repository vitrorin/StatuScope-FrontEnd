import { useState } from 'react'
import { PanelAlertas } from './components/alertas/PanelAlertas'
import { usePanelAlertas } from './hooks/usePanelAlertas'

function App() {
  const [sintomas, setSintomas] = useState('')
  const [codigoPostal, setCodigoPostal] = useState('')
  const { estado, alertas, analizar, reintentar } = usePanelAlertas()

  const handleAnalizar = () => {
    if (codigoPostal.trim().length >= 3) {
      analizar(codigoPostal.trim())
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-teal-700 text-white px-6 py-3 flex items-center gap-4 shadow-md">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-teal-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-3-3v6M5.5 20h13a2 2 0 002-2V9.5L14 3H5.5A2 2 0 003.5 5v13a2 2 0 002 2z" />
          </svg>
          <span className="font-bold text-lg tracking-wide">StatuScope</span>
        </div>
        <div className="h-5 w-px bg-teal-500" />
        <span className="text-teal-100 text-sm">Sistema de Vigilancia Epidemiológica</span>
        <div className="ml-auto flex items-center gap-2 text-teal-100 text-xs">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
          Sistema activo
        </div>
      </header>

      <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center gap-2 text-xs text-slate-500">
        <span>Inicio</span>
        <span>/</span>
        <span className="text-teal-700 font-medium">Asistente Diagnóstico</span>
      </div>

      <main className="flex flex-1 gap-5 p-6 overflow-hidden">
        <section className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col">
          <div className="border-b border-slate-200 px-5 py-3">
            <h1 className="text-slate-800 font-semibold text-base">Registro de Consulta</h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Complete los datos del paciente para identificar alertas epidemiológicas en la zona.
            </p>
          </div>

          <div className="flex flex-col gap-5 px-5 py-5 flex-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Síntomas presentados
              </label>
              <textarea
                value={sintomas}
                onChange={(e) => setSintomas(e.target.value)}
                rows={7}
                placeholder="Describa los síntomas del paciente: inicio, duración, características..."
                className="bg-slate-50 border border-slate-300 rounded-md px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Código postal del paciente
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={codigoPostal}
                  onChange={(e) => setCodigoPostal(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  placeholder="Ej. 64000"
                  className="bg-slate-50 border border-slate-300 rounded-md px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all w-36"
                />
                <span className="text-slate-400 text-xs">
                  Usado para cruzar con datos de vigilancia epidemiológica local
                </span>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-3">
              <button
                onClick={handleAnalizar}
                disabled={estado === 'cargando' || codigoPostal.trim().length < 3}
                className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-md transition-colors text-sm shadow-sm"
              >
                {estado === 'cargando' ? 'Analizando...' : 'Analizar'}
              </button>
              {estado !== 'idle' && estado !== 'cargando' && (
                <button
                  onClick={reintentar}
                  className="text-slate-500 hover:text-teal-700 text-sm transition-colors underline underline-offset-2"
                >
                  Nueva consulta
                </button>
              )}
              {codigoPostal.trim().length > 0 && codigoPostal.trim().length < 3 && (
                <span className="text-amber-600 text-xs">Ingrese al menos 3 dígitos del CP</span>
              )}
            </div>
          </div>
        </section>

        <PanelAlertas estado={estado} alertas={alertas} onReintentar={reintentar} />
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 py-2 text-xs text-slate-400 flex justify-between">
        <span>StatuScope · Sistema de Vigilancia Epidemiológica</span>
        <span>Datos solo con fines académicos</span>
      </footer>
    </div>
  )
}

export default App
