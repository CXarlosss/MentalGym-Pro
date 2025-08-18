import { useEffect, useState } from 'react'
import { fetchUserProgress, fetchActiveChallenges, fetchRecentExercises } from '@/lib/api/'
import type { Exercise, Challenge, DashboardStats } from '@/types'

type DashboardData = DashboardStats & { recentExercises: Exercise[]; activeChallenges: Challenge[] }

export function useDashboardData(user?: unknown) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    (async () => {
      try {
        setLoading(true)
        const [progress, challenges, recent] = await Promise.all([
          fetchUserProgress(), fetchActiveChallenges(), fetchRecentExercises(3),
        ])
        setData({
          weeklyData: progress.weeklyData,
          streak: progress.streak,
          totalExercises: progress.totalExercises,
          averageScore: progress.averageScore,
          recentExercises: recent,
          activeChallenges: challenges,
        })
      } catch (e) {
        console.error(e)
        setError('Error al cargar el dashboard')
      } finally {
        setLoading(false)
      }
    })()
  }, [user])

  return { data, loading, error }
}
