'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getActivities, upsertTodayActivity, getWeeklyActivity } from '@/lib/api/fitness.local'
import type { ActivityEntry, WeeklyActivitySummary } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'

function fmt(n: number) {
  return n.toLocaleString('es-ES')
}

export default function ActivityPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const [todaySteps, setTodaySteps] = useState<number>(0)
  const [todayNote, setTodayNote] = useState('')
  const [list, setList] = useState<ActivityEntry[]>([])
  const [weekly, setWeekly] = useState<WeeklyActivitySummary | null>(null)

  useEffect(() => {
    if (!user) {
      router.replace('/login')
      return
    }
    (async () => {
      try {
        setLoading(true)
        const [activities, summary] = await Promise.all([getActivities(), getWeeklyActivity()])
        setList(activities)
        setWeekly(summary)

        const today = new Date().toISOString().slice(0, 10)
        const todayEntry = activities.find(a => a.date === today)
        if (todayEntry) {
          setTodaySteps(todayEntry.steps)
          setTodayNote(todayEntry.note ?? '')
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar actividad')
      } finally {
        setLoading(false)
      }
    })()
  }, [user, router])

  const last7 = weekly?.last7Days ?? []
  const maxSteps = useMemo(
    () => Math.max(1, ...last7.map(d => d.steps)),
    [last7]
  )

  async function handleSave() {
    try {
      setLoading(true)
      await upsertTodayActivity({ steps: Number(todaySteps) || 0, note: todayNote || undefined })
      const [activities, summary] = await Promise.all([getActivities(), getWeeklyActivity()])
      setList(activities)
      setWeekly(summary)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-gray-50">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
      />
    </div>
  )
  
  if (error) return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 text-red-600 bg-red-50 rounded-lg shadow-sm max-w-2xl mx-auto mt-8"
    >
      {error}
    </motion.div>
  )

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto p-4 space-y-6  bg-gradient-to-br from-indigo-50 to-gray-50 min-h-screen"
    >
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Actividad diaria
          </h1>
          <p className="text-gray-600 mt-1">Registra tus pasos y consulta tu progreso semanal.</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/dashboard">
            <Button variant="outline" className="flex items-center gap-1">
              <span>←</span> Volver
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total (7 días)", value: fmt(weekly?.totalSteps ?? 0) },
          { title: "Media diaria", value: fmt(weekly?.avgSteps ?? 0) },
          { 
            title: "Mejor día", 
            value: weekly?.bestDay ? `${fmt(weekly.bestDay.steps)} (${weekly.bestDay.date})` : '—' 
          },
          { title: "Racha", value: `${weekly?.streak ?? 0} días` }
        ].map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 * index }}
          >
            <Kpi title={kpi.title} value={kpi.value} />
          </motion.div>
        ))}
      </div>

      {/* Formulario de hoy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-indigo-700">Registro de hoy</CardTitle>
            <CardDescription>Anota tus pasos del día.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <motion.input
                type="number"
                min={0}
                value={todaySteps}
                onChange={(e) => setTodaySteps(Number(e.target.value))}
                placeholder="Pasos de hoy"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                whileFocus={{ scale: 1.02, boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.5)" }}
              />
              <motion.input
                value={todayNote}
                onChange={(e) => setTodayNote(e.target.value)}
                placeholder="Nota (opcional)"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 md:col-span-2"
                whileFocus={{ scale: 1.02, boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.5)" }}
              />
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button 
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  Guardar
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Gráfico simple */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-indigo-700">Últimos 7 días</CardTitle>
            <CardDescription>Barra proporcional a tus pasos diarios.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 items-end h-40">
              {last7.map((d, i) => {
                const h = Math.round((d.steps / maxSteps) * 100)
                return (
                  <motion.div 
                    key={d.date} 
                    className="flex flex-col items-center gap-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + (i * 0.05) }}
                  >
                    <motion.div 
                      className="w-8 bg-gradient-to-t from-indigo-500 to-indigo-300 rounded-md hover:from-indigo-600 hover:to-indigo-400 transition-all"
                      style={{ height: `${h}%` }}
                      whileHover={{ scaleY: 1.05, scaleX: 1.1 }}
                      animate={{ height: `${h}%` }}
                      transition={{ type: "spring", damping: 10 }}
                    />
                    <div className="text-xs text-gray-500">
                      {new Date(d.date).toLocaleDateString('es-ES', { weekday: 'short' })}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Lista reciente */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-indigo-700">Registros recientes</CardTitle>
            <CardDescription>Los últimos apuntes guardados.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              <AnimatePresence>
                {list.slice(0, 10).map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + (index * 0.05) }}
                    className="py-3 flex items-center justify-between hover:bg-gray-50 rounded-lg px-2 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {fmt(item.steps)} pasos
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.date).toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long' })}
                        {item.note ? ` • ${item.note}` : ''}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(item.updatedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {list.length === 0 && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="py-6 text-center text-gray-500"
                >
                  Aún no has registrado actividad.
                </motion.p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.main>
  )
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-300 group">
      <CardContent className="p-4">
        <p className="text-sm text-gray-500 group-hover:text-indigo-600 transition-colors">{title}</p>
        <motion.p 
          className="text-2xl font-semibold mt-1 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {value}
        </motion.p>
      </CardContent>
    </Card>
  )
}