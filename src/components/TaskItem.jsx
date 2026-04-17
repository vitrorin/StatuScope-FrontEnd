import { Box, Text, Pressable } from '@gluestack-ui/themed'

function TaskItem({ title, completed = false, onToggle, onDelete }) {
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      p="$3"
      mb="$2"
      borderRadius="$md"
      borderWidth={1}
      borderColor={completed ? '$success300' : '$borderLight200'}
      bg={completed ? '$success50' : '$backgroundLight0'}
    >
      <Pressable
        flexDirection="row"
        alignItems="center"
        flex={1}
        onPress={onToggle}
      >
        <Box
          w={20}
          h={20}
          borderRadius="$full"
          borderWidth={2}
          borderColor={completed ? '$success500' : '$primary400'}
          bg={completed ? '$success500' : 'transparent'}
          alignItems="center"
          justifyContent="center"
          mr="$3"
        >
          {completed && (
            <Text color="$white" fontSize={12} fontWeight="$bold">
              ✓
            </Text>
          )}
        </Box>
        <Text
          flex={1}
          fontSize="$md"
          color={completed ? '$textLight400' : '$textLight900'}
          textDecorationLine={completed ? 'line-through' : 'none'}
        >
          {title}
        </Text>
      </Pressable>

      <Pressable onPress={onDelete} ml="$3" p="$1">
        <Text color="$error500" fontSize="$sm" fontWeight="$semibold">
          ✕
        </Text>
      </Pressable>
    </Box>
  )
}

export default TaskItem
