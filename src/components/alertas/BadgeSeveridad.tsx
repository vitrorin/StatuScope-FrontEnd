interface BadgeSeveridadProps {
  severidad: 'alto' | 'medio' | 'bajo'
}

const estilos: Record<BadgeSeveridadProps['severidad'], string> = {
  alto: 'bg-red-100 text-red-700 ring-1 ring-red-300',
  medio: 'bg-amber-100 text-amber-700 ring-1 ring-amber-300',
  bajo: 'bg-blue-100 text-blue-700 ring-1 ring-blue-300',
}

const etiquetas: Record<BadgeSeveridadProps['severidad'], string> = {
  alto: 'ALTO',
  medio: 'MEDIO',
  bajo: 'BAJO',
}

export function BadgeSeveridad({ severidad }: BadgeSeveridadProps) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-semibold whitespace-nowrap ${estilos[severidad]}`}>
      {etiquetas[severidad]}
    </span>
  )
}
