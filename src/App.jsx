import { useState } from 'react'
import {
  Box,
  Text,
  Pressable,
  Progress,
  ProgressFilledTrack,
  Spinner,
} from '@gluestack-ui/themed'

function App() {
  const [progress, setProgress] = useState(40)
  const [loading, setLoading] = useState(false)

  const handlePress = () => {
    setLoading(true)
    setTimeout(() => {
      setProgress((prev) => Math.min(prev + 20, 100))
      setLoading(false)
    }, 1000)
  }

  return (
    <Box flex={1} alignItems="center" justifyContent="center" p="$6" bg="$backgroundLight0">
      <Text fontSize="$2xl" fontWeight="$bold" mb="$4">
        Status Scope
      </Text>

      <Box w="$full" maxWidth={400} mb="$6">
        <Text mb="$2">Progreso: {progress}%</Text>
        <Progress value={progress} w="$full" h="$3">
          <ProgressFilledTrack bg="$primary500" />
        </Progress>
      </Box>

      {loading ? (
        <Spinner size="large" color="$primary500" mb="$4" />
      ) : null}

      <Pressable
        onPress={handlePress}
        bg="$primary500"
        px="$6"
        py="$3"
        borderRadius="$md"
        disabled={loading || progress >= 100}
        opacity={loading || progress >= 100 ? 0.6 : 1}
      >
        <Text color="$white" fontWeight="$semibold">
          {progress >= 100 ? 'Completado' : 'Avanzar'}
        </Text>
      </Pressable>

      {progress >= 100 && (
        <Box mt="$4" bg="$success100" px="$4" py="$2" borderRadius="$md">
          <Text color="$success700">¡Proceso completado!</Text>
        </Box>
      )}
    </Box>
  )
}

export default App
