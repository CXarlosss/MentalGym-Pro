// src/components/ExerciseCard.tsx
import Link from "next/link";
import type { Exercise } from '@/types'

export default function ExerciseCard({
  exercise,
  compact = false,
}: {
  exercise: Exercise;
  compact?: boolean;
}) {
  const difficultyColors = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
          <h4 className="font-medium">{exercise.title}</h4>
          <div className="flex items-center mt-1">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                difficultyColors[exercise.difficulty]
              }`}
            >
              {exercise.difficulty === "easy"
                ? "Fácil"
                : exercise.difficulty === "medium"
                ? "Medio"
                : "Difícil"}
            </span>
            <span className="text-xs text-gray-500 ml-2">
              {exercise.category}
            </span>
          </div>
        </div>
        <Link
          href={`/dashboard/retosmentales/${exercise._id}`}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          Repetir →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold">{exercise.title}</h3>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              difficultyColors[exercise.difficulty]
            }`}
          >
            {exercise.difficulty === "easy"
              ? "Fácil"
              : exercise.difficulty === "medium"
              ? "Medio"
              : "Difícil"}
          </span>
        </div>

        <p className="text-gray-600 mb-4">{exercise.description}</p>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 capitalize">
            {exercise.category}
          </span>
          <Link
            href={`/dashboard/retosmentales/${exercise._id}`}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Comenzar
          </Link>
        </div>
      </div>
    </div>
  );
}
