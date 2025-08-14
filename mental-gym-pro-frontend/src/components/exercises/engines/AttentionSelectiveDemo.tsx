'use client'
import { useRef } from 'react'
import type { Exercise } from '@/types'

type Props = {
  exercise: Exercise
  durationMin: number
  onComplete: (score: number, timeSpent: number) => void
  onCancel: () => void
}

export default function AttentionSelectiveDemo({
  exercise,
  durationMin,
  onComplete,
  onCancel,
}: Props) {
  const startedAtRef = useRef<number>(Date.now())

  const finish = () => {
    const timeSpent = Math.round((Date.now() - startedAtRef.current) / 1000)
    const score = 74 // demo
    onComplete(score, timeSpent)
  }

  return (
    <div className="p-6 bg-white rounded-xl border">
      <h3 className="text-lg font-semibold mb-2">{exercise.title}</h3>
      <p className="text-gray-600 mb-4">{exercise.description}</p>

      {exercise.instructions?.length > 0 && (
        <ul className="list-disc ml-6 mb-4 text-gray-700">
          {exercise.instructions.map((ins, i) => (
            <li key={i}>{ins}</li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <button
          onClick={finish}
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
