'use client'
import { useEffect, useState } from 'react'
import { getBadges, unlockBadge } from '@/lib/api/'
import dynamic from 'next/dynamic'

const Confetti = dynamic(() => import('react-confetti'), { ssr: false })

// Hook personalizado para obtener las dimensiones de la ventana de forma segura
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      };
      window.addEventListener('resize', handleResize);
      handleResize(); // Set initial size
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  return windowSize;
};

export default function AchievementsModal({ open, onClose, autoUnlockStreak7 = false, streak = 0 }: {
  open: boolean; onClose: () => void; autoUnlockStreak7?: boolean; streak?: number
}) {
  const [badges, setBadges] = useState(() => getBadges())
  const [showConfetti, setShowConfetti] = useState(false)
  const { width, height } = useWindowSize()

  useEffect(() => {
    if (open && autoUnlockStreak7 && streak >= 7 && !badges.find(b => b.code === 'streak7')) {
      const updated = unlockBadge('streak7', '🔥 Racha 7 días')
      setBadges(updated)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
    }
  }, [open, streak, autoUnlockStreak7, badges])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4 backdrop-blur-lg transition-opacity duration-300" onClick={onClose}>
      
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={300}
          colors={['#7e22ce', '#c084fc', '#f3e8ff', '#facc15']} // Paleta de colores más rica
          recycle={false}
          initialVelocityX={{ min: -10, max: 10 }}
          initialVelocityY={{ min: 5, max: 20 }}
          confettiSource={{ x: width / 2, y: height / 2, w: 0, h: 0 }}
        />
      )}

      <div className="w-full max-w-md rounded-3xl bg-gradient-to-br from-white to-purple-50 p-8 shadow-2xl border-2 border-purple-200" onClick={e => e.stopPropagation()}>
        
        {/* Encabezado */}
        <div className="mb-8 text-center">
          <div className="inline-block p-4 rounded-full bg-purple-100 mb-4 animate-pulse">
            <span className="text-4xl text-purple-600">🏆</span>
          </div>
          <h3 className="text-3xl font-extrabold text-purple-800">¡Logros Desbloqueados!</h3>
          <p className="text-gray-500 mt-1">Sigue trabajando duro para conseguir más.</p>
        </div>

        {/* Lista de Logros */}
        {badges.length ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {badges.map(b => (
              <li key={b.code} className="relative p-5 rounded-2xl bg-white shadow-md border-2 border-purple-100 transition-transform duration-200 hover:scale-[1.03] group overflow-hidden">
                <div className="absolute inset-0 bg-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <div className="relative z-10 flex items-center">
                  <div className="text-4xl mr-4 transform transition-transform duration-300 group-hover:rotate-6">🏅</div>
                  <div>
                    <div className="font-bold text-lg text-purple-700">{b.title}</div>
                    <div className="text-xs text-gray-400 mt-1">{new Date(b.unlockedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-lg text-purple-500 py-8">
            Aún no tienes logros. ¡Elige un desafío! 🎯
          </p>
        )}

        {/* Botón de Cerrar */}
        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-bold bg-purple-600 text-white shadow-lg shadow-purple-200 hover:bg-purple-700 transition-colors duration-200"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}