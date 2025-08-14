'use client'
import { useEffect, useRef, useState } from 'react'
import type { Exercise } from '@/types'

type Props = {
  exercise: Exercise
  durationMin: number
  onComplete: (score: number, timeSpent: number) => void
  onCancel: () => void
}

export default function ReactionSpeedDemo({ exercise, durationMin, onComplete, onCancel }: Props) {
  const [attempt, setAttempt] = useState(1)
  const [isReady, setIsReady] = useState(false)
  const [message, setMessage] = useState('Cuando veas el panel en verde, haz clic lo más rápido posible.')
  const [latencies, setLatencies] = useState<number[]>([])
  const [running, setRunning] = useState(true)

  const startTsRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sessionStartRef = useRef<number>(Date.now())

  useEffect(() => {
    scheduleNext()
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt])

  const scheduleNext = () => {
    setIsReady(false)
    const delay = 800 + Math.floor(Math.random() * 1700) // 800–2500ms
    timerRef.current && clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setIsReady(true)
      startTsRef.current = performance.now()
      setMessage('¡Ahora! Haz clic.')
    }, delay)
  }

  const handleClick = () => {
    if (!running) return

    if (!isReady) {
      setMessage('Te adelantaste 😅 espera al verde. Repite intento.')
      scheduleNext()
      return
    }

    const end = performance.now()
    const start = startTsRef.current ?? end
    const latency = Math.max(0, Math.round(end - start))

    const nextLatencies = [...latencies, latency]
    setLatencies(nextLatencies)
    setMessage(`Reacción: ${latency} ms`)

    if (attempt < 5) {
      setAttempt(a => a + 1)
    } else {
      finish(nextLatencies)
    }
  }

  const finish = (latenciesArg?: number[]) => {
    const used = latenciesArg ?? latencies
    setRunning(false)

    const timeSpent = Math.round((Date.now() - sessionStartRef.current) / 1000)
    const avg = used.length ? used.reduce((a, b) => a + b, 0) / used.length : 999
    const raw = Math.round((600 - avg) / 4)
    let score = Math.max(0, Math.min(100, raw))
    if (used.length > 0 && score === 0) score = 1

    onComplete(score, timeSpent)
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      {/* Aquí usamos datos reales del ejercicio */}
      <h3 className="text-lg font-semibold mb-2">{exercise.title}</h3>
      <p className="text-gray-600 mb-4">{exercise.description}</p>

      {exercise.instructions?.length > 0 && (
        <ul className="list-disc ml-6 mb-4 text-gray-700">
          {exercise.instructions.map((ins, i) => (
            <li key={i}>{ins}</li>
          ))}
        </ul>
      )}

      <p className="text-sm text-gray-600 mb-4">Intento {Math.min(attempt, 5)} de 5</p>

      <div
        onClick={handleClick}
        className={`h-40 rounded-xl flex items-center justify-center cursor-pointer transition
          ${isReady ? 'bg-green-500' : 'bg-gray-300'}`}
      >
        <span className="text-white text-xl select-none">
          {isReady ? '¡Ahora! Clic aquí' : 'Espera…'}
        </span>
      </div>

      <p className="mt-4 text-gray-700">{message}</p>

      <div className="mt-6 flex gap-2">
        <button
          onClick={() => finish()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Terminar (demo)
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
