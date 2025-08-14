'use client'
import type { Exercise } from '@/types'

type Props = {
  exercise: Exercise
  durationMin: number
  onComplete: (score: number, timeSpent: number) => void
  onCancel: () => void
}

export default function MemoryPairsDemo({ exercise, durationMin, onComplete, onCancel }: Props) {
  const finish = () => {
    onComplete(70, durationMin * 60) // demo
  }

  return (
    <div className="bg-white p-6 rounded-xl border">
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
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          Terminar (demo)
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
