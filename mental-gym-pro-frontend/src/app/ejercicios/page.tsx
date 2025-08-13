// src/app/dashboard/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchUserProgress, fetchActiveChallenges, fetchRecentExercises } from '../../lib/api'
import ProgressChart from '../../components/dashboard/ProgressChart'
import ExerciseCard from '../../components/cards/ExerciseCard'
import ChallengeItem from '../../components/exercises/ChallengeItem'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import WelcomeBanner from '../../components/layout/WellcomeBanner'
import StatsCard from '../../components/cards/StatsCard'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Exercise, Challenge, DashboardStats } from '../../types'

// Paleta de colores consistente
const COLORS = {
  primary: 'bg-indigo-600',
  primaryHover: 'hover:bg-indigo-700',
  primaryText: 'text-indigo-600',
  secondary: 'bg-emerald-500',
  secondaryHover: 'hover:bg-emerald-600',
  background: 'bg-gradient-to-br from-gray-50 to-gray-100',
  card: 'bg-white',
  difficulty: {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800'
  }
}

type DashboardData = DashboardStats & {
  recentExercises: Exercise[]
  activeChallenges: Challenge[]
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFirstLoad, setIsFirstLoad] = useState(true)

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
          weeklyData: progress.weeklyData,
          streak: progress.streak,
          totalExercises: progress.totalExercises,
          averageScore: progress.averageScore,
          recentExercises: exercises,
          activeChallenges: challenges
        })

        // Pequeño delay para que se aprecie el spinner
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (err) {
        setError('Error al cargar los datos del dashboard')
        console.error(err)
      } finally {
        setLoading(false)
        setIsFirstLoad(false)
      }
    }

    if (user) {
      loadDashboardData()
    }
  }, [user])

  if (loading && isFirstLoad) return <LoadingSpinner fullScreen />
  if (error) return <div className="text-red-500 text-center p-8 animate-pulse">{error}</div>
  if (!data) return <div className="text-center p-8 text-gray-500">No hay datos disponibles</div>

  return (
    <div className={`min-h-screen ${COLORS.background}`}>
      <WelcomeBanner name={user?.name || ''} streak={data.streak} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Sección de Estadísticas Rápidas */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <StatsCard 
            title="Racha Actual" 
            value={data.streak} 
            icon="🔥" 
            description="días consecutivos" 
            color="text-indigo-600"
          />
          <StatsCard 
            title="Ejercicios" 
            value={data.totalExercises} 
            icon="🧠" 
            description="completados" 
            color="text-emerald-500"
          />
          <StatsCard 
            title="Puntuación Media" 
            value={data.averageScore} 
            icon="⭐" 
            description="de 100" 
            isPercentage 
            color="text-yellow-500"
          />
          <StatsCard 
            title="Desafíos" 
            value={data.activeChallenges.length} 
            icon="🏆" 
            description="activos" 
            color="text-purple-500"
          />
        </motion.div>

        {/* Gráfico de Progreso y Ejercicios Recientes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Tu Progreso Semanal</h2>
            <div className="h-80">
              <ProgressChart data={data.weeklyData} />
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Ejercicios Recientes</h2>
            <div className="space-y-4">
              {data.recentExercises.length > 0 ? (
                <AnimatePresence>
                  {data.recentExercises.map((exercise, index) => (
                    <motion.div
                      key={exercise._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      whileHover={{ y: -3 }}
                    >
                      <ExerciseCard 
                        key={exercise._id} 
                        exercise={exercise} 
                        compact 
                        colorScheme={COLORS.difficulty[exercise.difficulty as keyof typeof COLORS.difficulty]}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-500"
                >
                  Aún no has completado ejercicios
                </motion.p>
              )}
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="mt-4"
              >
                <Link href="/dashboard/ejercicios">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-1"
                  >
                    Ver todos los ejercicios <span>→</span>
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Desafíos Activos */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Tus Desafíos Activos</h2>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/dashboard/desafios">
                <Button variant="outline">
                  Ver todos <span>→</span>
                </Button>
              </Link>
            </motion.div>
          </div>
          
          {data.activeChallenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {data.activeChallenges.map((challenge, index) => (
                  <motion.div
                    key={challenge._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    whileHover={{ y: -5 }}
                  >
                    <ChallengeItem 
                      key={challenge._id} 
                      challenge={challenge} 
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <p className="text-gray-500 mb-4">No tienes desafíos activos actualmente</p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/dashboard/desafios">
                  <Button className={`${COLORS.primary} ${COLORS.primaryHover} text-white`}>
                    Explorar desafíos
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* Recomendación Personalizada */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 hover:shadow-md transition-shadow duration-300"
        >
          <h2 className="text-xl font-bold mb-2 text-indigo-800">Recomendación del Día</h2>
          <p className="text-gray-700 mb-4">Basado en tu actividad reciente, te recomendamos trabajar en ejercicios de memoria espacial.</p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button className={`${COLORS.primary} ${COLORS.primaryHover} text-white`}>
              Empezar ejercicio recomendado
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}