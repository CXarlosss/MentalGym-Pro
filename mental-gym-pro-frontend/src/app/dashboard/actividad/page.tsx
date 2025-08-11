'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getActivities, upsertTodayActivity, getWeeklyActivity } from '@/lib/api'
import type { ActivityEntry, WeeklyActivitySummary } from '@/types'

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

        // precargar el input de hoy si ya hay registro
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

  if (loading) return <div className="p-8">Cargando…</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>

  return (
    <main className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Actividad diaria</h1>
          <p className="text-gray-600">Registra tus pasos y consulta tu progreso semanal.</p>
        </div>
        <Link href="/dashboard"><Button variant="outline">← Volver</Button></Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi title="Total (7 días)" value={fmt(weekly?.totalSteps ?? 0)} />
        <Kpi title="Media diaria" value={fmt(weekly?.avgSteps ?? 0)} />
        <Kpi title="Mejor día"
             value={weekly?.bestDay ? `${fmt(weekly.bestDay.steps)} (${weekly.bestDay.date})` : '—'} />
        <Kpi title="Racha" value={`${weekly?.streak ?? 0} días`} />
      </div>

      {/* Formulario de hoy */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de hoy</CardTitle>
          <CardDescription>Anota tus pasos del día.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="number"
              min={0}
              value={todaySteps}
              onChange={(e) => setTodaySteps(Number(e.target.value))}
              placeholder="Pasos de hoy"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              value={todayNote}
              onChange={(e) => setTodayNote(e.target.value)}
              placeholder="Nota (opcional)"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 md:col-span-2"
            />
            <Button onClick={handleSave}>Guardar</Button>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico simple (sin chart.js) */}
      <Card>
        <CardHeader>
          <CardTitle>Últimos 7 días</CardTitle>
          <CardDescription>Barra proporcional a tus pasos diarios.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 items-end h-40">
            {last7.map(d => {
              const h = Math.round((d.steps / maxSteps) * 100)
              return (
                <div key={d.date} className="flex flex-col items-center gap-2">
                  <div className="w-8 bg-indigo-200 rounded-md" style={{ height: `${h}%` }} />
                  <div className="text-xs text-gray-500">
                    {new Date(d.date).toLocaleDateString('es-ES', { weekday: 'short' })}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lista reciente */}
      <Card>
        <CardHeader>
          <CardTitle>Registros recientes</CardTitle>
          <CardDescription>Los últimos apuntes guardados.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {list.slice(0, 10).map(item => (
              <div key={item._id} className="py-3 flex items-center justify-between">
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
              </div>
            ))}
            {list.length === 0 && (
              <p className="py-6 text-center text-gray-500">Aún no has registrado actividad.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardContent>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
      </CardContent>
    </Card>
  )
}
