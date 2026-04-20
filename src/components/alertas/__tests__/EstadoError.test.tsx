import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { EstadoError } from '../EstadoError'

describe('EstadoError', () => {
  it('muestra el título de error', () => {
    render(<EstadoError onReintentar={() => {}} />)
    expect(screen.getByText('Error de conexión')).toBeInTheDocument()
  })

  it('muestra descripción del error', () => {
    render(<EstadoError onReintentar={() => {}} />)
    expect(
      screen.getByText(/No fue posible consultar el sistema de vigilancia epidemiológica/i)
    ).toBeInTheDocument()
  })

  it('muestra el botón Reintentar', () => {
    render(<EstadoError onReintentar={() => {}} />)
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument()
  })

  it('llama onReintentar al hacer clic en el botón', () => {
    const onReintentar = vi.fn()
    render(<EstadoError onReintentar={onReintentar} />)
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    expect(onReintentar).toHaveBeenCalledTimes(1)
  })
})
