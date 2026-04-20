import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { EstadoCargando } from '../EstadoCargando'

describe('EstadoCargando', () => {
  it('muestra el mensaje de análisis en curso', () => {
    render(<EstadoCargando />)
    expect(screen.getByText('Consultando base de datos epidemiológica...')).toBeInTheDocument()
  })

  it('renderiza elementos skeleton', () => {
    const { container } = render(<EstadoCargando />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThanOrEqual(2)
  })
})
