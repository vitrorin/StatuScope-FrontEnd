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
    <div className="min-h-screen bg-slate-950 text-slate-300 flex flex-col">
      <header className="border-b border-slate-800 px-6 py-3 flex items-center gap-3">
        <span className="text-purple-400 font-bold text-lg tracking-wide">StatuScope</span>
        <span className="text-slate-600 text-sm">Asistente Diagnóstico</span>
      </header>

      <main className="flex flex-1 gap-4 p-6 overflow-hidden">
        <section className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-5">
          <div>
            <h2 className="text-white font-semibold text-base mb-1">Datos del paciente</h2>
            <p className="text-slate-500 text-xs">
              Ingresa los síntomas y el código postal para detectar alertas epidemiológicas activas en la zona.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Síntomas</label>
            <textarea
              value={sintomas}
              onChange={(e) => setSintomas(e.target.value)}
              rows={6}
              placeholder="Ej. Fiebre alta, dolor de cabeza, erupción cutánea en extremidades..."
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 resize-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500 uppercase tracking-wide">
              Código postal del paciente
            </label>
            <input
              type="text"
              value={codigoPostal}
              onChange={(e) => setCodigoPostal(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="Ej. 64000"
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors w-40"
            />
          </div>

          <div className="flex items-center gap-3 mt-auto">
            <button
              onClick={handleAnalizar}
              disabled={estado === 'cargando' || codigoPostal.trim().length < 3}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-lg transition-colors text-sm"
            >
              {estado === 'cargando' ? 'Analizando...' : 'Analizar'}
            </button>
            {estado !== 'idle' && estado !== 'cargando' && (
              <button
                onClick={reintentar}
                className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
              >
                Nueva consulta
              </button>
            )}
          </div>
        </section>

        <PanelAlertas estado={estado} alertas={alertas} onReintentar={reintentar} />
      </main>
    </div>
  )
}

export default App
