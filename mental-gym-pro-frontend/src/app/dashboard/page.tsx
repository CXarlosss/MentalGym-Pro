'use client'
import { useAuth } from '../../context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import Link from 'next/link'
import ProgressChart from '../../components/dashboard/ProgressChart'
import RecentActivities from '../../components/dashboard/RecentActivities'
import DailyQuote from '../../components/dashboard/DailyQuote'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Button } from '../../components/ui/button'
import { Trophy, BrainCircuit, Clock, Flame, ArrowRight } from 'lucide-react'
import useProtectedRoute from '../../hooks/useProtectedRoute'

export default function DashboardPage() {
  const { user } = useAuth()
const { loading } = useProtectedRoute()

if (loading || !user) {
  return <LoadingSpinner fullScreen />
}

  return (
    <main className="p-4 md:p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Bienvenido, <span className="text-indigo-600">{user.name}</span> 👋
          </h1>
          <p className="text-lg text-gray-600 mt-2">Tu progreso hoy</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Link href="/dashboard/ejercicios" className="w-full">
            <Button className="w-full gap-2">
              <BrainCircuit className="h-5 w-5" />
              Ejercicios
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard/retos" className="w-full">
            <Button variant="outline" className="w-full gap-2">
              <Trophy className="h-5 w-5" />
              Mis retos
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Racha actual" value={stats.streak} icon={<Flame className="text-orange-500" />} description="días consecutivos" trend="up" />
        <StatCard title="Ejercicios" value={stats.exercisesCompleted} icon={<BrainCircuit className="text-indigo-500" />} description="completados" trend="up" />
        <StatCard title="Retos" value={stats.challenges} icon={<Trophy className="text-yellow-500" />} description="activos" trend="neutral" />
        <StatCard title="Tiempo medio" value="8.2" icon={<Clock className="text-blue-500" />} description="min/ejercicio" isDecimal trend="down" />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <>
              <CardHeader>
                <CardTitle>Progreso Semanal</CardTitle>
                <CardDescription>Tus resultados de los últimos 7 días</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ProgressChart data={stats.weeklyProgress} />
                </div>
              </CardContent>
            </>
          </Card>
        </div>
        <div>
          <Card>
            <>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>Tus últimos ejercicios completados</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivities activities={recentActivities} />
              </CardContent>
            </>
          </Card>
        </div>
      </div>

      {/* Objetivos y cita */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DailyQuote />
        </div>
        <div>
          <Card>
            <>
              <CardHeader>
                <CardTitle>Tus Objetivos</CardTitle>
                <CardDescription>Próximos desafíos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <GoalItem title="Completa 5 ejercicios de memoria" progress={60} current={3} total={5} />
                  <GoalItem title="Mantén la racha por 15 días" progress={80} current={12} total={15} />
                  <GoalItem title="Mejora tu puntuación en patrones" progress={45} current={72} total={90} isScore />
                </div>
              </CardContent>
            </>
          </Card>
        </div>
      </div>
    </main>
  )
}

// Datos temporales (fuera del componente)
const stats = {
  streak: 12,
  exercisesCompleted: 34,
  challenges: 6,
  weeklyProgress: [65, 59, 80, 81, 56, 55, 70]
}

const recentActivities = [
  { id: 1, name: 'Memoria numérica', score: 85, date: '2023-06-15' },
  { id: 2, name: 'Patrones lógicos', score: 72, date: '2023-06-14' },
  { id: 3, name: 'Atención visual', score: 91, date: '2023-06-12' }
]

// StatCard
function StatCard({
  title,
  value,
  icon,
  description,
  isDecimal = false,
  trend
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  description: string
  isDecimal?: boolean
  trend?: 'up' | 'down' | 'neutral'
}) {
  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-gray-500'
  }

  return (
    <Card>
      <>
        <CardContent>
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <p className="text-3xl font-bold mt-2">
                {isDecimal ? value : Math.round(Number(value))}
              </p>
              <div className="flex items-center mt-2">
                {trend && (
                  <span className={`text-sm ${trendColors[trend]} flex items-center`}>
                    {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
                    {!isDecimal && trend !== 'neutral' && ' 5%'}
                  </span>
                )}
                <span className="text-xs text-gray-500 ml-2">{description}</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
              {icon}
            </div>
          </div>
        </CardContent>
      </>
    </Card>
  )
}

// GoalItem
function GoalItem({
  title,
  progress,
  current,
  total,
  isScore = false
}: {
  title: string
  progress: number
  current: number
  total: number
  isScore?: boolean
}) {
  return (
    <div className="space-y-2">
      <p className="font-medium text-gray-800">{title}</p>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-indigo-600 h-2.5 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-600">
        {isScore ? `${current} puntos` : `${current} de ${total}`}
        <span className="text-indigo-600 ml-2">{progress}%</span>
      </p>
    </div>
  )
}
