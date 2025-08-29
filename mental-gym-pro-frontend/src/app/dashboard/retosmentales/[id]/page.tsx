// src/app/dashboard/retosmentales/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

// 👇 Mantén fetchExercise aquí
import { fetchExercise } from '@/lib/api/'

// 👇 PERO estas dos venidas del índice (sessionController)
import { startExerciseSession, completeExercise } from '@/lib/api/'

import ExerciseHeader from '@/components/exercises/detail/ExerciseHeader'
import ExerciseInstructions from '@/components/exercises/detail/ExerciseInstruction'
import ExerciseRunner from '@/components/exercises/detail/ExerciseRunner'
import ExerciseResults from '@/components/exercises/detail/ExerciseResults'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'
import type { Exercise, ExerciseResult } from '@/types'

type Stage = 'instructions' | 'session' | 'results'

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 300): Promise<T> {
  try {
    return await fn()
  } catch (e) {
    if (retries <= 0) throw e
    await new Promise(r => setTimeout(r, delayMs))
    return withRetry(fn, retries - 1, delayMs * 2)
  }
}

export default function RetoMentalDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const { user } = useAuth()

  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stage, setStage] = useState<Stage>('instructions')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [results, setResults] = useState<ExerciseResult | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await withRetry(() => fetchExercise(id), 3, 300)
      setExercise(data)
    } catch (e) {
      console.error(e)
      setError('No se pudo cargar el ejercicio. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && id) load()
  }, [user, id])

  const handleStart = async () => {
    try {
      // ✅ Usa el controller correcto y guarda metadatos útiles para el historial
      const session = await startExerciseSession(id, {
        title: exercise?.title,
        category: exercise?.category,
        playedAt: new Date(),
      })
      setSessionId(session._id)
      setStage('session')
    } catch (e) {
      console.error(e)
      toast.error('Error al iniciar el ejercicio')
    }
  }

  const handleComplete = async (score: number, timeSpent: number) => {
    if (!sessionId) return
    try {
      // ✅ Esto persiste endedAt/duration y emite 'mg:sessions-changed'
      const res = await completeExercise(sessionId, { score, timeSpent, metadata: {} })
      setResults(res)
      setStage('results')
      toast.success('¡Ejercicio completado!')
    } catch (e) {
      console.error(e)
      toast.error('Error al guardar los resultados')
    }
  }

  const handleRetry = () => {
    setStage('instructions')
    setResults(null)
  }

  if (loading) return <LoadingSpinner fullScreen />

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={load}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!exercise) return <div>Ejercicio no encontrado</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ExerciseHeader
          title={exercise.title}
          difficulty={exercise.difficulty}
          category={exercise.category}
          onBack={() => router.push('/dashboard/retosmentales')}
        />

        <div className="max-w-3xl mx-auto mt-8">
          {stage === 'instructions' && (
            <ExerciseInstructions
              description={exercise.description}
              duration={exercise.duration || 5}
              instructions={exercise.instructions || []}
              onStart={handleStart}
            />
          )}

          {stage === 'session' && (
            <ExerciseRunner
              exercise={exercise}
              onComplete={handleComplete}
              onCancel={() => setStage('instructions')}
            />
          )}

          {stage === 'results' && results && (
            <ExerciseResults
              results={results}
              exercise={exercise}
              onRetry={handleRetry}
              onBack={() => router.push('/dashboard/retosmentales')}
            />
          )}
        </div>
      </div>
    </div>
  )
}
