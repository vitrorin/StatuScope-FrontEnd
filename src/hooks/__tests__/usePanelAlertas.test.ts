import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { usePanelAlertas } from '../usePanelAlertas'

const ALERTA_MOCK = {
  id: '1',
  enfermedad: 'Dengue hemorrágico',
  severidad: 'alto',
  codigoPostal: '64000',
  casosConfirmados: 47,
  tendenciaSemanal: 12,
  pruebasSugeridas: ['PCR dengue', 'Biometría hemática'],
  perfilUrl: '/epidemiologia/dengue',
}

const respuestaConAlertas = {
  alertas: [ALERTA_MOCK],
  totalEncontradas: 1,
  codigoPostal: '64000',
}

const respuestaSinAlertas = {
  alertas: [],
  totalEncontradas: 0,
  codigoPostal: '99999',
}

function mockFetch(body: unknown, ok = true, status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValueOnce({
      ok,
      status,
      json: async () => body,
    } as Response)
  )
}

describe('usePanelAlertas — integración con API', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('inicia en estado idle con lista vacía', () => {
    const { result } = renderHook(() => usePanelAlertas())
    expect(result.current.estado).toBe('idle')
    expect(result.current.alertas).toHaveLength(0)
  })

  it('pasa a cargando inmediatamente al llamar analizar', async () => {
    mockFetch(respuestaConAlertas)
    const { result } = renderHook(() => usePanelAlertas())

    act(() => { result.current.analizar('64000') })

    expect(result.current.estado).toBe('cargando')
  })

  it('pasa a con_alertas cuando el API devuelve alertas', async () => {
    mockFetch(respuestaConAlertas)
    const { result } = renderHook(() => usePanelAlertas())

    await act(async () => { await result.current.analizar('64000') })

    expect(result.current.estado).toBe('con_alertas')
    expect(result.current.alertas).toHaveLength(1)
    expect(result.current.alertas[0].enfermedad).toBe('Dengue hemorrágico')
    expect(result.current.alertas[0].severidad).toBe('alto')
  })

  it('pasa a sin_alertas cuando el API devuelve lista vacía', async () => {
    mockFetch(respuestaSinAlertas)
    const { result } = renderHook(() => usePanelAlertas())

    await act(async () => { await result.current.analizar('99999') })

    expect(result.current.estado).toBe('sin_alertas')
    expect(result.current.alertas).toHaveLength(0)
  })

  it('pasa a error cuando la red falla', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('Network error')))
    const { result } = renderHook(() => usePanelAlertas())

    await act(async () => { await result.current.analizar('64000') })

    expect(result.current.estado).toBe('error')
  })

  it('pasa a error cuando el servidor devuelve HTTP 500', async () => {
    mockFetch({ error: 'Internal server error' }, false, 500)
    const { result } = renderHook(() => usePanelAlertas())

    await act(async () => { await result.current.analizar('64000') })

    expect(result.current.estado).toBe('error')
  })

  it('llama al endpoint con el codigoPostal correcto', async () => {
    mockFetch(respuestaConAlertas)
    const { result } = renderHook(() => usePanelAlertas())

    await act(async () => { await result.current.analizar('64000') })

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('codigoPostal=64000')
    )
  })

  it('reintentar vuelve al estado idle y limpia alertas', async () => {
    mockFetch(respuestaConAlertas)
    const { result } = renderHook(() => usePanelAlertas())

    await act(async () => { await result.current.analizar('64000') })
    expect(result.current.estado).toBe('con_alertas')

    act(() => { result.current.reintentar() })

    expect(result.current.estado).toBe('idle')
    expect(result.current.alertas).toHaveLength(0)
  })

  it('limpia alertas previas al iniciar nueva consulta', async () => {
    mockFetch(respuestaConAlertas)
    const { result } = renderHook(() => usePanelAlertas())
    await act(async () => { await result.current.analizar('64000') })
    expect(result.current.alertas).toHaveLength(1)

    mockFetch(respuestaSinAlertas)
    act(() => { result.current.analizar('99999') })

    expect(result.current.alertas).toHaveLength(0)
    expect(result.current.estado).toBe('cargando')
  })
})
