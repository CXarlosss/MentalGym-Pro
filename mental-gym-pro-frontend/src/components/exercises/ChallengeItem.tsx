// src/components/ChallengeItem.tsx
import Link from 'next/link'
import { Challenge } from '../../types'
import ProgressBar from '../progress/ProgressBar'

export default function ChallengeItem({ challenge }: { challenge: Challenge }) {
  // Calcular progreso (ejemplo: 5 de 7 días completados)
  const progress = Math.min(Math.floor(Math.random() * 100), 100)
  
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg">{challenge.title}</h3>
        <span className={`px-2 py-1 text-xs rounded-full ${challenge.isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
          {challenge.isCompleted ? 'Completado' : 'En progreso'}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-3">{challenge.description}</p>
      
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progreso</span>
          <span>{progress}%</span>
        </div>
        <ProgressBar value={progress} />
      </div>
      
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">{challenge.durationDays} días</span>
        <Link 
          href={`/challenges/${challenge._id}`}
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          {challenge.isCompleted ? 'Ver resultado' : 'Continuar'}
        </Link>
      </div>
    </div>
  )
}