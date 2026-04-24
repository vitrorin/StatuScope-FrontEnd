import { useState, useCallback } from 'react'
import type { Alerta, PanelAlertasProps } from '../types/alerta'
import api from '../api/client'

type Estado = PanelAlertasProps['estado']

export function usePanelAlertas() {
  const [estado, setEstado] = useState<Estado>('idle')
  const [alertas, setAlertas] = useState<Alerta[]>([])

  const analizar = useCallback(async (codigoPostal: string) => {
    setEstado('cargando')
    setAlertas([])

    try {
      const { data } = await api.get<{ alertas: Alerta[] }>(`/api/alertas?codigoPostal=${encodeURIComponent(codigoPostal)}`)
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
