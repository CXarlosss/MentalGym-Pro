// src/components/exercises/detail/ExerciseResults.tsx
import { TrophyIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import ProgressCircle from '@/components/progress/ProgressCircle'
import { ExerciseResult, Exercise } from '@/types'
export default function ExerciseResults({
  results,
  exercise,
  onRetry,
  onBack
}: {
  results: ExerciseResult
  exercise: Exercise
  onRetry: () => void
  onBack: () => void
}) {
  const percentage = Math.round((results.score / 100) * 100)
  const timeInMinutes = Math.round(results.timeSpent / 60)

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold mb-6 text-center">Resultados</h2>
      
      <div className="flex flex-col items-center mb-8">
        <ProgressCircle
          percentage={percentage}
          size={120}
          strokeWidth={10}
          className="mb-4"
        />
        
        <h3 className="text-2xl font-bold mb-1">
          {percentage >= 80 ? '¡Excelente!' : 
           percentage >= 50 ? '¡Buen trabajo!' : '¡Sigue practicando!'}
        </h3>
        <p className="text-gray-600">Puntuación: {results.score}/100</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-gray-500 text-sm">Tiempo</p>
          <p className="font-bold">{timeInMinutes} min</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-gray-500 text-sm">Dificultad</p>
          <p className="font-bold capitalize">
            {exercise.difficulty === 'easy' ? 'Fácil' : 
             exercise.difficulty === 'medium' ? 'Medio' : 'Difícil'}
          </p>
        </div>
      </div>
      
      {percentage >= 90 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center mb-6">
          <TrophyIcon className="h-6 w-6 text-yellow-500 mr-2" />
          <span className="text-yellow-800">¡Nuevo récord personal!</span>
        </div>
      )}
      
      <div className="flex space-x-4">
        <button
          onClick={onRetry}
          className="flex-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
        >
          <ArrowPathIcon className="h-5 w-5 mr-2" />
          Reintentar
        </button>
        <button
          onClick={onBack}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
        >
          Volver a ejercicios
        </button>
      </div>
    </div>
  )
}