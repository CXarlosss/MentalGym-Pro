// src/components/exercises/detail/ExerciseHeader.tsx
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { Difficulty } from '@/types'

const difficultyColors = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800'
}

export default function ExerciseHeader({
  title,
  difficulty,
  category,
  onBack
}: {
  title: string
  difficulty: Difficulty
  category: string
  onBack: () => void
}) {
  return (
    <div className="flex items-start justify-between">
      <button 
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-1" />
        Volver
      </button>
      
      <div className="text-center">
        <h1 className="text-3xl font-bold">{title}</h1>
        <div className="flex justify-center mt-2 space-x-2">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${difficultyColors[difficulty]}`}>
            {difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Medio' : 'Difícil'}
          </span>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
            {category}
          </span>
        </div>
      </div>
      
      <div className="w-24"></div> {/* Spacer para alineación */}
    </div>
  )
}