// src/components/ChallengeItem.tsx
import Link from 'next/link'
import { Challenge } from '@/types'
import ProgressBar from '../progress/ProgressBar'

export default function ChallengeItem({ challenge }: { challenge: Challenge }) {
  const calculateProgress = () => {
    if (!challenge.expiresAt || !challenge.createdAt) return 0

    const startDate = new Date(challenge.createdAt)
    const endDate = new Date(challenge.expiresAt)
    const today = new Date()

    if (today > endDate) return 100

    const toDays = (ms: number) => Math.ceil(ms / (1000 * 60 * 60 * 24))
    const totalDays = toDays(endDate.getTime() - startDate.getTime())
    const daysPassed = Math.max(0, toDays(today.getTime() - startDate.getTime()))

    return Math.min(Math.round((daysPassed / Math.max(1, totalDays)) * 100), 100)
  }

  const progress = calculateProgress()
  const isCompleted = progress === 100

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg">{challenge.title}</h3>
        <span className={`px-2 py-1 text-xs rounded-full ${isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
          {isCompleted ? 'Completado' : 'En progreso'}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-3">{challenge.description}</p>

      {typeof challenge.participants === 'number' && (
        <div className="text-sm text-gray-500 mb-2">
          {challenge.participants} participantes
        </div>
      )}

      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progreso</span>
          <span>{progress}%</span>
        </div>
        <ProgressBar value={progress} />
      </div>

      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">
          {challenge.expiresAt
            ? `Expira: ${new Date(challenge.expiresAt).toLocaleDateString('es-ES')}`
            : `${challenge.durationDays} días`}
        </span>
        <Link
          href={`/dashboard/desafios/${challenge._id}`} // ✅ ruta correcta
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          {isCompleted ? 'Ver resultado' : 'Continuar'}
        </Link>
      </div>
    </div>
  )
}
