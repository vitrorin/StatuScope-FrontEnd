import { useState, useCallback } from 'react'
import type { Alerta, PanelAlertasProps } from '../types/alerta'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

type Estado = PanelAlertasProps['estado']

export function usePanelAlertas() {
  const [estado, setEstado] = useState<Estado>('idle')
  const [alertas, setAlertas] = useState<Alerta[]>([])

  const analizar = useCallback(async (codigoPostal: string) => {
    setEstado('cargando')
    setAlertas([])

    try {
      const res = await fetch(`${API_URL}/api/alertas?codigoPostal=${encodeURIComponent(codigoPostal)}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.alertas.length > 0) {
        setAlertas(data.alertas)
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
