'use client'
import { useEffect, useState } from 'react'
import { getBadges, unlockBadge } from '@/lib/api'

export default function AchievementsModal({ open, onClose, autoUnlockStreak7=false, streak=0 }:{
  open:boolean; onClose:()=>void; autoUnlockStreak7?:boolean; streak?:number
}) {
  const [badges, setBadges] = useState(() => getBadges())

  useEffect(() => {
    if (autoUnlockStreak7 && streak >= 7 && !badges.find(b=>b.code==='streak7')) {
      const updated = unlockBadge('streak7', '🔥 Racha 7 días')
      setBadges(updated)
      // pequeño toast
      setTimeout(()=>alert('🏅 ¡Nuevo logro: Racha 7 días!'), 100)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streak])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={e=>e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Tus logros</h3>
          <button onClick={onClose} className="rounded-md bg-gray-100 px-2 py-1 text-sm">Cerrar</button>
        </div>
        {badges.length ? (
          <ul className="grid grid-cols-2 gap-3">
            {badges.map(b=>(
              <li key={b.code} className="rounded-xl border p-3">
                <div className="text-2xl">🏅</div>
                <div className="mt-1 font-semibold">{b.title}</div>
                <div className="text-xs text-gray-500">{new Date(b.unlockedAt).toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">Aún no tienes logros. ¡Empieza hoy! 💪</p>
        )}
      </div>
    </div>
  )
}
