// src/components/exercises/detail/ExerciseRunner.tsx
'use client'
import type { Exercise } from '@/types'
import ReactionSpeedDemo from '@/components/exercises/engines/ReactionSpeedDemo'
import MemoryPairsDemo from '@/components/exercises/engines/MemoryPairsDemo'
import LogicSeqDemo from '@/components/exercises/engines/LogicSeqDemo'
import AttentionSelectiveDemo from '@/components/exercises/engines/AttentionSelectiveDemo'
import MentalMathDemo from '@/components/exercises/engines/MentalMathDemo'
import CognitiveFlexDemo from '@/components/exercises/engines/CognitiveFlexDemo'

type Props = {
  exercise: Exercise
  onComplete: (score: number, timeSpent: number) => void
  onCancel: () => void
}

// Panel reutilizable para mostrar instrucciones
function InstructionsPanel({
  description,
  instructions,
}: {
  description?: string
  instructions?: string[]
}) {
  if (!description && !instructions?.length) return null
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200">
      {description && <p className="text-gray-700 mb-3">{description}</p>}
      {!!instructions?.length && (
        <>
          <p className="text-sm text-gray-500 font-medium mb-1">Instrucciones</p>
          <ul className="list-disc ml-5 space-y-1 text-gray-700">
            {instructions.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default function ExerciseRunner({ exercise, onComplete, onCancel }: Props) {
  const engine = exercise.engine ?? 'reaction-speed'
  const duration = exercise.duration || 3

  // 1) siempre mostramos las instrucciones del ejercicio arriba
  // 2) debajo, renderizamos el motor correspondiente
  return (
    <div className="space-y-6">
      <InstructionsPanel
        description={exercise.description}
        instructions={exercise.instructions}
      />

      {(() => {
        switch (engine) {
          case 'reaction-speed':
            return <ReactionSpeedDemo exercise={exercise} durationMin={duration} onComplete={onComplete} onCancel={onCancel} />
          case 'memory-pairs':
            return <MemoryPairsDemo exercise={exercise} durationMin={duration} onComplete={onComplete} onCancel={onCancel} />
          case 'logic-seq':
            return <LogicSeqDemo exercise={exercise} durationMin={duration} onComplete={onComplete} onCancel={onCancel} />
          case 'attention-selective':
            return <AttentionSelectiveDemo exercise={exercise} durationMin={duration} onComplete={onComplete} onCancel={onCancel} />
          case 'mental-math':
            return <MentalMathDemo exercise={exercise} durationMin={duration} onComplete={onComplete} onCancel={onCancel} />
          case 'cognitive-flex':
            return <CognitiveFlexDemo exercise={exercise} durationMin={duration} onComplete={onComplete} onCancel={onCancel} />
          default:
            return <ReactionSpeedDemo exercise={exercise} durationMin={duration} onComplete={onComplete} onCancel={onCancel} />
        }
      })()}
    </div>
  )
}
