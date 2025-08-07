// src/app/dashboard/page.tsx
'use client'
// Importaciones corregidas (asegúrate de que los archivos existan en estas rutas)
import { useAuth } from '../../context/AuthContext' // Ruta relativa ajustada
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card' // Ruta relativa
import Link from 'next/link'
import ProgressChart from '../../components/dashboard/ProgressChart' // Ruta relativa
import RecentActivities from '../../components/dashboard/RecentActivities' // Ruta relativa
import DailyQuote from '../../components/dashboard/DailyQuote' // Ruta relativa
import {LoadingSpinner} from '../../components/ui/LoadingSpinner' // Ruta relativa
import { Button } from '../../components/ui/button' // Ruta relativa
import { Trophy, BrainCircuit, Clock, Flame } from 'lucide-react'
import useProtectedRoute from '../../hooks/useProtectedRoute' // Ruta relativa
export default function DashboardPage() {
  const { user } = useAuth()
  const { loading } = useProtectedRoute()

  if (loading || !user) {
    return <LoadingSpinner fullScreen />
  }

  // Datos de ejemplo (en producción vendrían de una API)
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

  return (
    <main className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-start flex-col md:flex-row gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Hola, <span className="text-indigo-600">{user.name}</span> 👋
          </h1>
          <p className="text-gray-600">¿Qué vamos a entrenar hoy?</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <Link href="/dashboard/ejercicios" className="w-full md:w-auto">
            <Button className="w-full">
              <BrainCircuit className="mr-2 h-4 w-4" />
              Ver ejercicios
            </Button>
          </Link>
          <Link href="/dashboard/retos" className="w-full md:w-auto">
            <Button variant="outline" className="w-full">
              <Trophy className="mr-2 h-4 w-4" />
              Mis retos
            </Button>
          </Link>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Racha actual" 
          value={stats.streak} 
          icon={<Flame className="text-orange-500" />}
          description="días consecutivos"
        />
        <StatCard 
          title="Ejercicios" 
          value={stats.exercisesCompleted} 
          icon={<BrainCircuit className="text-indigo-500" />}
          description="completados"
        />
        <StatCard 
          title="Retos" 
          value={stats.challenges} 
          icon={<Trophy className="text-yellow-500" />}
          description="activos"
        />
        <StatCard 
          title="Tiempo medio" 
          value="8.2" 
          icon={<Clock className="text-blue-500" />}
          description="min/ejercicio"
          isDecimal
        />
      </section>

      {/* Gráfico y actividades recientes */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Tu progreso semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ProgressChart data={stats.weeklyProgress} />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Actividad reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentActivities activities={recentActivities} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Sección inferior */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DailyQuote />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Próximo objetivo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">Completa 5 ejercicios de memoria</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: '60%' }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">3 de 5 completados</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}

// Componente de tarjeta de estadística reutilizable
function StatCard({
  title,
  value,
  icon,
  description,
  isDecimal = false
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  description: string
  isDecimal?: boolean
}) {
  return (
    <Card>
      <CardContent >
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold mt-1">
              {isDecimal ? value : Math.round(Number(value))}
            </p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <div className="p-3 rounded-full bg-gray-100">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}