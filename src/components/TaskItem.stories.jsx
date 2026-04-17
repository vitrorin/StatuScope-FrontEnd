import TaskItem from './TaskItem'

export default {
  title: 'TodoList/TaskItem',
  component: TaskItem,
  args: {
    onToggle: () => {},
    onDelete: () => {},
  },
}

export const Default = {
  args: {
    title: 'Comprar leche',
    completed: false,
  },
}

export const Completed = {
  args: {
    title: 'Lavar los platos',
    completed: true,
  },
}

export const LongTitle = {
  args: {
    title: 'Revisar y responder todos los correos electrónicos pendientes del equipo de desarrollo',
    completed: false,
  },
}

export const CompletedLongTitle = {
  args: {
    title: 'Preparar presentación del proyecto final para el cliente de la empresa',
    completed: true,
  },
}
