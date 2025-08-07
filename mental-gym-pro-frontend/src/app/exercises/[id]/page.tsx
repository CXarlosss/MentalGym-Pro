// src/app/exercises/[id]/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { fetchExerciseById, startExerciseSession, completeExercise } from '@/lib/api'
import ExerciseHeader from '@/components/exercises/detail/ExerciseHeader'
import ExerciseInstructions from '@/components/exercises/detail/ExerciseInstructions'
import ExerciseSession from '@/components/exercises/detail/ExerciseSession'
import ExerciseResults from '@/components/exercises/detail/ExerciseResults'
import LoadingSpinner from '@/components/LoadingSpinner'
import { toast } from 'react-hot-toast'

type ExerciseStage = 'instructions' | 'session' | 'results'

export default function ExerciseDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stage, setStage] = useState<ExerciseStage>('instructions')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [results, setResults] = useState<ExerciseResult | null>(null)

  useEffect(() => {
    const loadExercise = async () => {
      try {
        setLoading(true)
        const data = await fetchExerciseById(id as string)
        setExercise(data)
      } catch (err) {
        setError('Error al cargar el ejercicio')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (user) loadExercise()
  }, [id, user])

  const handleStartExercise = async () => {
    try {
      const session = await startExerciseSession(id as string)
      setSessionId(session._id)
      setStage('session')
    } catch (err) {
      toast.error('Error al iniciar el ejercicio')
      console.error(err)
    }
  }

  const handleCompleteExercise = async (score: number, timeSpent: number) => {
    try {
      if (!sessionId) return
      
      const result = await completeExercise(sessionId, {
        score,
        timeSpent,
        metadata: {} // Datos adicionales específicos del ejercicio
      })
      
      setResults(result)
      setStage('results')
      toast.success('¡Ejercicio completado!')
    } catch (err) {
      toast.error('Error al guardar los resultados')
      console.error(err)
    }
  }

  const handleRetryExercise = () => {
    setStage('instructions')
    setResults(null)
  }

  if (loading) return <LoadingSpinner fullScreen />
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>
  if (!exercise) return <div>Ejercicio no encontrado</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ExerciseHeader 
          title={exercise.title}
          difficulty={exercise.difficulty}
          category={exercise.category}
          onBack={() => router.push('/exercises')}
        />

        <div className="max-w-3xl mx-auto mt-8">
          {stage === 'instructions' && (
            <ExerciseInstructions
              description={exercise.description}
              duration={exercise.duration || 5}
              instructions={exercise.instructions || []}
              onStart={handleStartExercise}
            />
          )}

          {stage === 'session' && (
            <ExerciseSession
              exercise={exercise}
              onComplete={handleCompleteExercise}
              onCancel={() => setStage('instructions')}
            />
          )}

          {stage === 'results' && results && (
            <ExerciseResults
              results={results}
              exercise={exercise}
              onRetry={handleRetryExercise}
              onBack={() => router.push('/exercises')}
            />
          )}
        </div>
      </div>
    </div>
  )
}