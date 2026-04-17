import TaskList from './TaskList'

export default {
  title: 'TodoList/TaskList',
  component: TaskList,
  args: {
    onToggle: () => {},
    onDelete: () => {},
  },
}

export const Empty = {
  args: {
    tasks: [],
  },
}

export const ConTareas = {
  args: {
    tasks: [
      { id: 1, title: 'Comprar leche', completed: false },
      { id: 2, title: 'Llamar al dentista', completed: false },
      { id: 3, title: 'Hacer ejercicio', completed: false },
    ],
  },
}

export const MixtoConCompletadas = {
  args: {
    tasks: [
      { id: 1, title: 'Comprar leche', completed: true },
      { id: 2, Title: 'Llamar al dentista', title: 'Llamar al dentista', completed: false },
      { id: 3, title: 'Hacer ejercicio', completed: true },
      { id: 4, title: 'Estudiar para el examen', completed: false },
    ],
  },
}

export const TodasCompletadas = {
  args: {
    tasks: [
      { id: 1, title: 'Comprar leche', completed: true },
      { id: 2, title: 'Llamar al dentista', completed: true },
      { id: 3, title: 'Hacer ejercicio', completed: true },
    ],
  },
}
