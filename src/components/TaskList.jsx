import { Box, Text } from '@gluestack-ui/themed'
import TaskItem from './TaskItem'

function TaskList({ tasks = [], onToggle, onDelete }) {
  if (tasks.length === 0) {
    return (
      <Box
        alignItems="center"
        justifyContent="center"
        py="$10"
        borderRadius="$md"
        borderWidth={1}
        borderColor="$borderLight200"
        borderStyle="dashed"
      >
        <Text fontSize="$3xl" mb="$2">📋</Text>
        <Text color="$textLight400" fontSize="$md">
          No hay tareas pendientes
        </Text>
      </Box>
    )
  }

  const pending = tasks.filter((t) => !t.completed)
  const completed = tasks.filter((t) => t.completed)

  return (
    <Box>
      <Box flexDirection="row" justifyContent="space-between" mb="$3">
        <Text fontSize="$sm" color="$textLight500">
          {tasks.length} tarea{tasks.length !== 1 ? 's' : ''}
        </Text>
        <Text fontSize="$sm" color="$success600">
          {completed.length} completada{completed.length !== 1 ? 's' : ''}
        </Text>
      </Box>

      {pending.map((task) => (
        <TaskItem
          key={task.id}
          title={task.title}
          completed={false}
          onToggle={() => onToggle?.(task.id)}
          onDelete={() => onDelete?.(task.id)}
        />
      ))}

      {completed.map((task) => (
        <TaskItem
          key={task.id}
          title={task.title}
          completed={true}
          onToggle={() => onToggle?.(task.id)}
          onDelete={() => onDelete?.(task.id)}
        />
      ))}
    </Box>
  )
}

export default TaskList
