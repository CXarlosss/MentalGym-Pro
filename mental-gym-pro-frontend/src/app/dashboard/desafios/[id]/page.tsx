/* 'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fetchChallengeById, joinChallenge, updateMyChallengeProgress } from '@/lib/api/gamification/gamification'
import type { Challenge } from '@/types'
import { Button } from '@/components/ui/button'

export default function ChallengeDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const c = await fetchChallengeById(id)
        setChallenge(c)
      } catch (e) {
        setError('No se pudo cargar el desafío')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) return <div className="p-6">Cargando…</div>
  if (error || !challenge) return <div className="p-6">{error ?? 'Desafío no encontrado'}</div>

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">{challenge.title}</h1>
      <p className="text-gray-600">{challenge.description}</p>
      <div className="text-sm text-gray-500">Objetivo: {challenge.objective ?? '—'}</div>

      <div className="flex gap-2 pt-4">
        <Button onClick={async () => { await joinChallenge(challenge._id); router.push('/dashboard/desafios') }}>
          Unirme
        </Button>
        <Button variant="outline" onClick={async () => { await updateMyChallengeProgress(challenge._id, { isCompleted: true }); router.push('/dashboard/desafios') }}>
          Marcar completado
        </Button>
        <Button variant="ghost" onClick={() => router.push('/dashboard/desafios')}>
          ← Volver
        </Button>
      </div>
    </main>
  )
}
 */