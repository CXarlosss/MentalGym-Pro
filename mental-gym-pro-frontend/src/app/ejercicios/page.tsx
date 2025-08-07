// src/app/dashboard/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/Au'
import { fetchUserProgress, fetchActiveChallenges, fetchRecentExercises } from '../../lib/api'
import ProgressChart from '../../components/ProgressChart'
import ExerciseCard from '../../components/cards/ExerciseCard'
import ChallengeItem from '../../components/exercises/ChallengeItem'
import LoadingSpinner from '../../components/LoadingSpinner'
import WelcomeBanner from '../../components/WelcomeBanner'
import StatsCard from '../../components/cards/StatsCard'

type DashboardData = {
  weeklyProgress: number[]
  streak: number
  totalExercises: number
  averageScore: number
  recentExercises: Exercise[]
  activeChallenges: Challenge[]
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true)
        
        const [progress, challenges, exercises] = await Promise.all([
          fetchUserProgress(),
          fetchActiveChallenges(),
          fetchRecentExercises(3)
        ])

        setData({
          weeklyProgress: progress.weeklyData,
          streak: progress.streak,
          totalExercises: progress.totalCompleted,
          averageScore: progress.averageScore,
          recentExercises: exercises,
          activeChallenges: challenges
        })
      } catch (err) {
        setError('Error al cargar los datos del dashboard')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadDashboardData()
    }
  }, [user])

  if (loading) return <LoadingSpinner fullScreen />
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>
  if (!data) return <div>No hay datos disponibles</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <WelcomeBanner name={user?.name || ''} streak={data.streak} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Sección de Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Racha Actual" 
            value={data.streak} 
            icon="🔥" 
            description="días consecutivos" 
          />
          <StatsCard 
            title="Ejercicios" 
            value={data.totalExercises} 
            icon="🧠" 
            description="completados" 
          />
          <StatsCard 
            title="Puntuación Media" 
            value={data.averageScore} 
            icon="⭐" 
            description="de 100" 
            isPercentage 
          />
          <StatsCard 
            title="Desafíos" 
            value={data.activeChallenges.length} 
            icon="🏆" 
            description="activos" 
          />
        </div>

        {/* Gráfico de Progreso y Ejercicios Recientes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Tu Progreso Semanal</h2>
            <div className="h-80">
              <ProgressChart data={data.weeklyProgress} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Ejercicios Recientes</h2>
            <div className="space-y-4">
              {data.recentExercises.length > 0 ? (
                data.recentExercises.map(exercise => (
                  <ExerciseCard key={exercise._id} exercise={exercise} compact />
                ))
              ) : (
                <p className="text-gray-500">Aún no has completado ejercicios</p>
              )}
              <button className="w-full mt-4 text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                Ver todos los ejercicios →
              </button>
            </div>
          </div>
        </div>

        {/* Desafíos Activos */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Tus Desafíos Activos</h2>
            <button className="text-indigo-600 hover:text-indigo-800 transition-colors">
              Ver todos →
            </button>
          </div>
          
          {data.activeChallenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.activeChallenges.map(challenge => (
                <ChallengeItem key={challenge._id} challenge={challenge} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No tienes desafíos activos actualmente</p>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                Explorar desafíos
              </button>
            </div>
          )}
        </div>

        {/* Recomendación Personalizada */}
        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
          <h2 className="text-xl font-bold mb-2">Recomendación del Día</h2>
          <p className="text-gray-700 mb-4">Basado en tu actividad reciente, te recomendamos trabajar en ejercicios de memoria espacial.</p>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Empezar ejercicio recomendado
          </button>
        </div>
      </div>
    </div>
  )
}