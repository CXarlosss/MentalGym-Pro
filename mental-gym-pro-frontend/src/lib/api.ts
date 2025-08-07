// src/lib/api.ts
export const fetchExerciseById = async (id: string): Promise<Exercise> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Datos de ejemplo
  const exercises: Exercise[] = [
    {
      _id: '1',
      title: 'Memoria de Números',
      description: 'Recuerda y repite secuencias numéricas de longitud creciente',
      category: 'memoria',
      difficulty: 'easy',
      createdAt: '2023-05-15T10:00:00Z',
      duration: 5,
      instructions: [
        'Memoriza el número que aparecerá en pantalla',
        'Espera a que desaparezca',
        'Ingresa el número exacto que viste',
        'Cada ronda aumenta la dificultad',
        'Completa 5 rondas para finalizar'
      ]
    },
    // ... otros ejercicios
  ]
  
  const exercise = exercises.find(ex => ex._id === id)
  if (!exercise) throw new Error('Exercise not found')
  return exercise
}

export const startExerciseSession = async (exerciseId: string): Promise<{ _id: string }> => {
  await new Promise(resolve => setTimeout(resolve, 300))
  return { _id: `sess_${Math.random().toString(36).substr(2, 9)}` }
}

export const completeExercise = async (
  sessionId: string,
  data: {
    score: number
    timeSpent: number
    metadata: Record<string, unknown>
  }
): Promise<ExerciseResult> => {
  await new Promise(resolve => setTimeout(resolve, 400))
  
  return {
    _id: `res_${Math.random().toString(36).substr(2, 9)}`,
    sessionId,
    score: data.score,
    timeSpent: data.timeSpent,
    createdAt: new Date().toISOString(),
    metadata: data.metadata
  }
}