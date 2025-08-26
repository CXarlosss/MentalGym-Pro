// src/app/dashboard/actividad/page.tsx
'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getActivities, upsertTodayActivity, getWeeklyActivity } from '@/lib/api/fitness/fitness'
import type { ActivityEntry, WeeklyActivitySummary } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'

type SectionId = 'hoy' | 'semana' | 'historial'

function fmt(n: number) {
  return n.toLocaleString('es-ES')
}
function toLocalYMD(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

export default function ActivityPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [error, setError] = useState<string>('')

  const [todaySteps, setTodaySteps] = useState<string>('') // mantener string
  const [todayNote, setTodayNote] = useState('')
  const [list, setList] = useState<ActivityEntry[]>([])
  const [weekly, setWeekly] = useState<WeeklyActivitySummary | null>(null)

  // ---- acordeón: todo cerrado por defecto ----
  const sections: { id: SectionId; label: string; emoji: string }[] = [
    { id: 'hoy', label: 'Hoy', emoji: '🗓️' },
    { id: 'semana', label: 'Semana', emoji: '📈' },
    { id: 'historial', label: 'Historial', emoji: '📜' },
  ]
  const [openSec, setOpenSec] = useState<SectionId | null>(null)
  const [activeSec, setActiveSec] = useState<SectionId | null>(null)

  const scrollToId = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const toggleSection = (id: SectionId) => {
    setOpenSec(prev => (prev === id ? null : id))
    setActiveSec(id)
    // dar un tick para que el DOM expanda y luego hacer scroll
    setTimeout(() => scrollToId(id), 60)
  }

  // ---- carga inicial ----
  useEffect(() => {
    if (!user) {
      router.replace('/login')
      return
    }
    ;(async () => {
      try {
        setLoading(true)
        setError('')
        const [activities, summary] = await Promise.all([getActivities(), getWeeklyActivity()])

        const ordered = [...activities].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        setList(ordered)
        setWeekly(summary)

        const todayKey = toLocalYMD()
        const todayEntry = ordered.find(a => a.date === todayKey)
        if (todayEntry) {
          setTodaySteps(String(todayEntry.steps ?? ''))
          setTodayNote(todayEntry.note ?? '')
        } else {
          setTodaySteps('')
          setTodayNote('')
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar actividad')
      } finally {
        setLoading(false)
      }
    })()
  }, [user, router])

  const last7 = weekly?.last7Days ?? []
  const maxSteps = useMemo(() => Math.max(1, ...last7.map(d => d.steps)), [last7])

  // atajos teclado ↑/↓ => +/-100
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown'].includes(ev.key)) {
        ev.preventDefault()
        const cur = parseInt(todaySteps || '0', 10) || 0
        const delta = ev.key === 'ArrowUp' ? 100 : -100
        const next = Math.max(0, cur + delta)
        setTodaySteps(String(next))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [todaySteps])

  async function handleSave() {
    try {
      setSaving(true)
      setError('')
      const steps = parseInt(todaySteps, 10)
      await upsertTodayActivity({
        steps: Number.isFinite(steps) ? steps : 0,
        note: todayNote || undefined,
      })
      const [activities, summary] = await Promise.all([getActivities(), getWeeklyActivity()])
      const ordered = [...activities].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      setList(ordered)
      setWeekly(summary)
      setSavedAt(Date.now())
      setTimeout(() => setSavedAt(null), 2000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  // helpers UI
  const bump = (n: number) => {
    const cur = parseInt(todaySteps || '0', 10) || 0
    setTodaySteps(String(Math.max(0, cur + n)))
  }
  const setGoal = (n: number) => setTodaySteps(String(n))
  const copyYesterday = () => {
    if (!list.length) return
    const todayKey = toLocalYMD()
    const yesterday = list.find(x => x.date < todayKey)
    if (yesterday) {
      setTodaySteps(String(yesterday.steps ?? ''))
      if (!todayNote && yesterday.note) setTodayNote(yesterday.note)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 text-red-600 bg-red-50 rounded-lg shadow-sm max-w-2xl mx-auto mt-8"
      >
        {error}
      </motion.div>
    )
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto p-4 space-y-6 bg-gradient-to-br from-indigo-50 to-gray-50 min-h-screen"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Actividad diaria
          </h1>
          <p className="text-gray-600 mt-1">Registra tus pasos y consulta tu progreso semanal.</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link href="/dashboard">
            <Button variant="outline" className="flex items-center gap-1">
              <span>←</span> Volver
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* NAVBAR STICKY de secciones */}
      <div className="sticky top-0 z-20 -mx-4 px-4 py-2 backdrop-blur bg-white/60 border-b">
        <div className="flex items-center gap-2 overflow-auto no-scrollbar">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => toggleSection(s.id)}
              className={[
                'px-3 py-1.5 rounded-full text-sm border transition',
                activeSec === s.id
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300',
              ].join(' ')}
            >
              <span className="mr-1">{s.emoji}</span>
              {s.label}
            </button>
          ))}
          <Link href="/dashboard/desafios" className="ml-auto">
            <Button variant="outline" className="text-sm">🏆 Desafíos</Button>
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total (7 días)', value: fmt(weekly?.totalSteps ?? 0) },
          { title: 'Media diaria', value: fmt(weekly?.avgSteps ?? 0) },
          {
            title: 'Mejor día',
            value: weekly?.bestDay ? `${fmt(weekly.bestDay.steps)} (${weekly.bestDay.date})` : '—',
          },
          { title: 'Racha', value: `${weekly?.streak ?? 0} días` },
        ].map((kpi, index) => (
          <motion.div key={kpi.title} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 * index }}>
            <Kpi title={kpi.title} value={kpi.value} />
          </motion.div>
        ))}
      </div>

      {/* === HOY === */}
      <section id="hoy" className="scroll-mt-24">
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader
            role="button"
            onClick={() => toggleSection('hoy')}
            className="cursor-pointer select-none"
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-indigo-700">Registro de hoy</CardTitle>
                <CardDescription>Anota tus pasos del día.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <AnimatePresence>
                  {savedAt && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="text-sm px-2 py-1 rounded bg-green-100 text-green-700"
                    >
                      Guardado ✓
                    </motion.div>
                  )}
                </AnimatePresence>
                <span
                  className={[
                    'text-xl transition-transform',
                    openSec === 'hoy' ? 'rotate-180' : 'rotate-0',
                  ].join(' ')}
                >
                  ▾
                </span>
              </div>
            </div>
          </CardHeader>

          <AnimatePresence initial={false}>
            {openSec === 'hoy' && (
              <motion.div
                key="hoy-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <motion.input
                      type="number"
                      min={0}
                      step={1}
                      value={todaySteps}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^\d]/g, '')
                        setTodaySteps(clean)
                      }}
                      placeholder="Pasos de hoy"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      whileFocus={{ scale: 1.02, boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.5)' }}
                    />
                    <motion.input
                      value={todayNote}
                      onChange={(e) => setTodayNote(e.target.value)}
                      placeholder="Nota (opcional)"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 md:col-span-2"
                      whileFocus={{ scale: 1.02, boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.5)' }}
                    />
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60"
                      >
                        {saving ? 'Guardando…' : 'Guardar'}
                      </Button>
                    </motion.div>
                  </div>

                  {/* Acciones rápidas */}
                  <div className="mt-3 flex flex-wrap gap-2 text-sm">
                    <Button variant="outline" onClick={() => bump(+100)}>+100</Button>
                    <Button variant="outline" onClick={() => bump(+500)}>+500</Button>
                    <Button variant="outline" onClick={() => bump(+1000)}>+1000</Button>
                    <span className="mx-2 h-6 w-px bg-gray-200" />
                    <Button variant="outline" onClick={() => setGoal(8000)}>Meta 8 000</Button>
                    <Button variant="outline" onClick={() => setGoal(10000)}>Meta 10 000</Button>
                    <span className="mx-2 h-6 w-px bg-gray-200" />
                    <Button variant="outline" onClick={copyYesterday}>Copiar de ayer</Button>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </section>

      {/* === SEMANA === */}
      <section id="semana" className="scroll-mt-24">
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader role="button" onClick={() => toggleSection('semana')} className="cursor-pointer select-none">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-indigo-700">Últimos 7 días</CardTitle>
                <CardDescription>Barra proporcional a tus pasos diarios.</CardDescription>
              </div>
              <span className={['text-xl transition-transform', openSec === 'semana' ? 'rotate-180' : 'rotate-0'].join(' ')}>▾</span>
            </div>
          </CardHeader>

          <AnimatePresence initial={false}>
            {openSec === 'semana' && (
              <motion.div
                key="semana-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
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
                          transition={{ delay: 0.1 + i * 0.05 }}
                        >
                          <motion.div
                            className="w-8 bg-gradient-to-t from-indigo-500 to-indigo-300 rounded-md hover:from-indigo-600 hover:to-indigo-400 transition-all"
                            style={{ height: `${h}%` }}
                            whileHover={{ scaleY: 1.05, scaleX: 1.1 }}
                            animate={{ height: `${h}%` }}
                            transition={{ type: 'spring', damping: 10 }}
                            title={`${fmt(d.steps)} pasos`}
                          />
                          <div className="text-xs text-gray-500">
                            {new Date(d.date).toLocaleDateString('es-ES', { weekday: 'short' })}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </section>

      {/* === HISTORIAL === */}
      <section id="historial" className="scroll-mt-24">
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader role="button" onClick={() => toggleSection('historial')} className="cursor-pointer select-none">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-indigo-700">Registros recientes</CardTitle>
                <CardDescription>Los últimos apuntes guardados.</CardDescription>
              </div>
              <span className={['text-xl transition-transform', openSec === 'historial' ? 'rotate-180' : 'rotate-0'].join(' ')}>▾</span>
            </div>
          </CardHeader>

          <AnimatePresence initial={false}>
            {openSec === 'historial' && (
              <motion.div
                key="hist-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <CardContent>
                  <div className="divide-y">
                    <AnimatePresence>
                      {list.slice(0, 10).map((item, index) => (
                        <motion.div
                          key={item._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 + index * 0.03 }}
                          className="py-3 flex items-center justify-between hover:bg-gray-50 rounded-lg px-2 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{fmt(item.steps)} pasos</p>
                            <p className="text-xs text-gray-500">
                              {new Date(item.date).toLocaleDateString('es-ES', {
                                weekday: 'long',
                                day: '2-digit',
                                month: 'long',
                              })}
                              {item.note ? ` • ${item.note}` : ''}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(item.updatedAt).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {list.length === 0 && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="py-6 text-center text-gray-500">
                        Aún no has registrado actividad.
                      </motion.p>
                    )}
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </section>
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
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {value}
        </motion.p>
      </CardContent>
    </Card>
  )
}
