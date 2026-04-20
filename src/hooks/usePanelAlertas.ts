import { useState, useCallback } from 'react'
import type { Alerta, PanelAlertasProps } from '../types/alerta'

const MOCK_ALERTAS: Alerta[] = [
  {
    id: '1',
    enfermedad: 'Dengue hemorrágico',
    severidad: 'alto',
    codigoPostal: '64000',
    casosConfirmados: 47,
    tendenciaSemanal: 12,
    pruebasSugeridas: ['PCR dengue', 'Biometría hemática', 'Plaquetas'],
    perfilUrl: '#',
  },
  {
    id: '2',
    enfermedad: 'Influenza A (H3N2)',
    severidad: 'medio',
    codigoPostal: '64010',
    casosConfirmados: 23,
    tendenciaSemanal: -3,
    pruebasSugeridas: ['Panel viral respiratorio', 'Antígeno influenza'],
    perfilUrl: '#',
  },
  {
    id: '3',
    enfermedad: 'COVID-19',
    severidad: 'bajo',
    codigoPostal: '64020',
    casosConfirmados: 8,
    tendenciaSemanal: -2,
    pruebasSugeridas: ['Prueba rápida antígenos'],
    perfilUrl: '#',
  },
]

type Estado = PanelAlertasProps['estado']

export function usePanelAlertas() {
  const [estado, setEstado] = useState<Estado>('idle')
  const [alertas, setAlertas] = useState<Alerta[]>([])

  const analizar = useCallback(async (codigoPostal: string) => {
    setEstado('cargando')
    setAlertas([])

    try {
      // Simula llamada al backend — será reemplazada por el endpoint real en SS-33
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const relevantes = MOCK_ALERTAS.filter((a) =>
        a.codigoPostal.startsWith(codigoPostal.slice(0, 3))
      )
      if (relevantes.length > 0) {
        setAlertas(relevantes)
        setEstado('con_alertas')
      } else {
        setEstado('sin_alertas')
      }
    } catch {
      setEstado('error')
    }
  }, [])

  const reintentar = useCallback(() => {
    setEstado('idle')
    setAlertas([])
  }, [])

  return { estado, alertas, analizar, reintentar }
}
