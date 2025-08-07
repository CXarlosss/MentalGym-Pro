// src/components/ChallengeItem.tsx
import Link from 'next/link'
import { Challenge } from '@/types'
import ProgressBar from '../progress/ProgressBar'

export default function ChallengeItem({ challenge }: { challenge: Challenge }) {
  // Calcular progreso basado en días transcurridos
  const calculateProgress = () => {
    if (!challenge.expiresAt || !challenge.createdAt) return 0;
    
    const startDate = new Date(challenge.createdAt);
    const endDate = new Date(challenge.expiresAt);
    const today = new Date();
    
    // Si el desafío ya expiró
    if (today > endDate) return 100;
    
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return Math.min(Math.round((daysPassed / totalDays) * 100), 100);
  }

  const progress = calculateProgress();
  const isCompleted = progress === 100;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg">{challenge.title}</h3>
        <span className={`px-2 py-1 text-xs rounded-full ${isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
          {isCompleted ? 'Completado' : 'En progreso'}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-3">{challenge.description}</p>
      
      {challenge.participants !== undefined && (
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
          {challenge.expiresAt ? 
            `Expira: ${new Date(challenge.expiresAt).toLocaleDateString()}` : 
            `${challenge.durationDays} días`
          }
        </span>
        <Link 
          href={`/challenges/${challenge._id}`}
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          {isCompleted ? 'Ver resultado' : 'Continuar'}
        </Link>
      </div>
    </div>
  )
}