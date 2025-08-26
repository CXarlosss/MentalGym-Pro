'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import {
  seedDefaultRoutinesOnce,
  getRoutines,
  duplicateRoutine,
  getFavoriteExercises,
  addGymSetToday,
  getGymWeeklySummary,
  getGroupVolumeThisWeek,
  epley1RM,
  brzycki1RM,
  targetFromPercent1RM,
} from '@/lib/api/fitness/fitness'
import type { LiftTag } from '@/types'

// ===============================
// Utilidades
// ===============================
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
const fmtInt = (n: number) => n.toLocaleString('es-ES')

// ===============================
// Temporizador de descanso (seguro)
// ===============================
function RestTimer({ seconds = 90 }: { seconds?: number }) {
  const [left, setLeft] = useState(seconds)
  const iv = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (iv.current) clearInterval(iv.current)
    iv.current = window.setInterval(() => {
      setLeft(prev => {
        const nxt = Math.max(0, prev - 1)
        if (nxt === 0) {
          if (iv.current) clearInterval(iv.current)
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('¡Descanso terminado!')
          }
        }
        return nxt
      })
    }, 1000)
    return () => {
      if (iv.current) clearInterval(iv.current)
    }
  }, [seconds])

  const requestNotify = async () => {
    if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
      try { await Notification.requestPermission() } catch {}
    }
  }

  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span className="text-sm text-gray-600">Descanso:</span>
      <motion.span
        className="font-semibold"
        key={left}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500 }}
      >
        {left}s
      </motion.span>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button variant="outline" onClick={() => setLeft(seconds)}>Reiniciar</Button>
      </motion.div>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button variant="outline" onClick={requestNotify}>Notificar</Button>
      </motion.div>
    </motion.div>
  )
}

// ===============================
// Accordion controlado
// ===============================
type SectionId = 'kpis' | 'percent' | 'logger' | 'routines' | 'volume'

function AccordionSection({
  id, title, subtitle, open, onToggle, children,
}: {
  id: SectionId
  title: string
  subtitle?: string
  open: boolean
  onToggle: (id: SectionId) => void
  children: React.ReactNode
}) {
  return (
    <motion.div
      id={id}
      className="scroll-mt-24"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="hover:shadow-md transition-shadow duration-300">
        <CardHeader role="button" onClick={() => onToggle(id)} className="cursor-pointer select-none">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-indigo-700">{title}</CardTitle>
              {subtitle && <CardDescription>{subtitle}</CardDescription>}
            </div>
            <span className={['text-xl text-gray-500 transition-transform', open ? 'rotate-180' : 'rotate-0'].join(' ')}>▾</span>
          </div>
        </CardHeader>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key={`${id}-content`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <CardContent className="pt-0">{children}</CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}

// ===============================
// Página principal
// ===============================
export default function GymPage() {
  const [routines, setRoutines] = useState(getRoutines())
  const [fav] = useState(getFavoriteExercises())

  // %1RM
  const [percent, setPercent] = useState(80)
  const [oneRM, setOneRM] = useState(100)

  // Set rápido
  const [exerciseName, setExerciseName] = useState<string>('')
  const [weight, setWeight] = useState<number>(60)
  const [reps, setReps] = useState<number>(5)
  const [rpe, setRpe] = useState<number>(8)
  const [rir, setRir] = useState<number>(2)
  const [marker, setMarker] = useState<'warmup' | 'top' | 'backoff' | ''>('')

  // KPIs
  const [summary, setSummary] = useState<{ vol: number; streak: number; top?: string }>({ vol: 0, streak: 0 })
  const [groups, setGroups] = useState<{ group: LiftTag; sets: number }[]>([])

  // NAV/Accordion
  const [openSec, setOpenSec] = useState<SectionId | null>(null) // todo cerrado por defecto
  const [activeSec, setActiveSec] = useState<SectionId | null>(null)
  const scrollToId = useCallback((id: SectionId) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])
  const toggleSection = (id: SectionId) => {
    setOpenSec(prev => (prev === id ? null : id))
    setActiveSec(id)
    setTimeout(() => scrollToId(id), 60)
  }

  // Carga inicial + seed
  useEffect(() => {
    seedDefaultRoutinesOnce()
    setRoutines(getRoutines())
    refreshWeekly()
  }, [])

  // Refrescar si otra vista modifica el gym
  useEffect(() => {
    const onChange = () => { refreshWeekly(); setRoutines(getRoutines()) }
    window.addEventListener('mg:gym-changed', onChange)
    return () => window.removeEventListener('mg:gym-changed', onChange)
  }, [])

  const refreshWeekly = useCallback(async () => {
    const ws = await getGymWeeklySummary()
    const gv = await getGroupVolumeThisWeek()
    setSummary({ vol: ws.totalVolume, streak: ws.streak, top: ws.topVolumeDay?.date })
    setGroups(gv)
  }, [])

  async function quickAdd(exercise: string, tags: LiftTag[] = []) {
    await addGymSetToday({
      exercise,
      weight: Math.max(0, weight),
      reps: clamp(reps, 1, 50),
      rpe: clamp(rpe, 1, 10),
      rir: clamp(rir, 0, 10),
      marker: marker || undefined,
      tags,
    })
    await refreshWeekly()
  }

  const target = useMemo(() => targetFromPercent1RM(oneRM, clamp(percent, 1, 100)), [oneRM, percent])
  const estEpley = useMemo(() => epley1RM(Math.max(0, weight), clamp(reps, 1, 50)), [weight, reps])
  const estBrzycki = useMemo(() => brzycki1RM(Math.max(0, weight), clamp(reps, 1, 50)), [weight, reps])

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto p-4 space-y-6 bg-gradient-to-br from-indigo-50 to-gray-50 min-h-screen"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Entrenamiento de Fuerza
          </h1>
          <p className="text-gray-600">Plantillas, favoritos, %1RM, RPE/RIR y descanso.</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link href="/dashboard">
            <Button variant="outline" className="flex items-center gap-1">
              <span>←</span> Volver
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* NAVBAR STICKY */}
      <div className="sticky top-0 z-20 -mx-4 px-4 py-2 backdrop-blur bg-white/60 border-b">
        <div className="flex items-center gap-2 overflow-auto no-scrollbar">
          {[
            { id: 'kpis', label: 'KPIs', emoji: '📊' },
            { id: 'percent', label: '%1RM', emoji: '🎯' },
            { id: 'logger', label: 'Set rápido', emoji: '⚡' },
            { id: 'routines', label: 'Plantillas', emoji: '📋' },
            { id: 'volume', label: 'Volumen grupo', emoji: '🧩' },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => toggleSection(s.id as SectionId)}
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
        </div>
      </div>

      {/* KPIs */}
      <AccordionSection
        id="kpis"
        title="Indicadores de la semana"
        subtitle="Volumen total, racha y mejor día"
        open={openSec === 'kpis'}
        onToggle={toggleSection}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'Volumen 7 días', value: `${fmtInt(summary.vol)} kg·reps` },
            { title: 'Racha', value: `${summary.streak} días` },
            { title: 'Mejor día', value: summary.top ?? '—' },
          ].map((kpi, index) => (
            <motion.div
              key={kpi.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.08 }}
            >
              <Kpi title={kpi.title} value={kpi.value} />
            </motion.div>
          ))}
        </div>
      </AccordionSection>

      {/* Target %1RM */}
      <AccordionSection
        id="percent"
        title="%1RM objetivo"
        subtitle="Calcula el peso para la sesión según tu 1RM"
        open={openSec === 'percent'}
        onToggle={toggleSection}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <NumberInput label="Tu 1RM (kg)" value={oneRM} onChange={(n) => setOneRM(Math.max(0, n))} />
          <NumberInput label="% objetivo" value={percent} onChange={(n) => setPercent(clamp(n, 1, 100))} />
          <div className="flex flex-col justify-end">
            <div className="text-sm text-gray-500">Peso objetivo</div>
            <motion.div
              className="text-2xl font-semibold"
              key={target}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              {target} kg
            </motion.div>
          </div>
          <RestTimer seconds={90} />
        </div>
      </AccordionSection>

      {/* Logger rápido */}
      <AccordionSection
        id="logger"
        title="Registrar set rápido"
        subtitle="Peso, repeticiones, RPE/RIR y marcador"
        open={openSec === 'logger'}
        onToggle={toggleSection}
      >
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
          <TextInput
            label="Ejercicio"
            id="exerciseName"
            placeholder="Press banca / Sentadilla…"
            value={exerciseName}
            onChange={setExerciseName}
            onEnter={() => {
              const ex = exerciseName.trim()
              if (!ex) return
              quickAdd(ex)
              setExerciseName('')
            }}
          />
          <NumberInput label="Peso (kg)" value={weight} onChange={(n) => setWeight(Math.max(0, n))} />
          <NumberInput label="Reps" value={reps} onChange={(n) => setReps(clamp(n, 1, 50))} />
          <NumberInput label="RPE" value={rpe} onChange={(n) => setRpe(clamp(n, 1, 10))} />
          <NumberInput label="RIR" value={rir} onChange={(n) => setRir(clamp(n, 0, 10))} />
          <div>
            <label className="block text-xs text-gray-500 mb-1">Marcador</label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              value={marker}
              onChange={e => setMarker(e.target.value as 'warmup' | 'top' | 'backoff' | '')}
            >
              <option value="">(ninguno)</option>
              <option value="warmup">Calentamiento</option>
              <option value="top">Top set</option>
              <option value="backoff">Back-off</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {/* Botones rápidos desde primera rutina */}
          {routines.slice(0, 1).flatMap(r => r.days[0].blocks).slice(0, 4).map((b, i) => (
            <motion.div
              key={`${b.exercise}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="outline" onClick={() => quickAdd(b.exercise, (b.tags || []))}>
                + {b.exercise}
              </Button>
            </motion.div>
          ))}
          {fav.map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="outline" onClick={() => quickAdd(name)}>
                ★ {name}
              </Button>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              onClick={() => {
                const ex = exerciseName.trim()
                if (!ex) return
                quickAdd(ex)
                setExerciseName('')
              }}
            >
              Guardar set
            </Button>
          </motion.div>
        </div>

        <div className="mt-4 text-xs text-gray-600">
          1RM estimado (Epley): <b>{estEpley} kg</b> • (Brzycki): <b>{estBrzycki} kg</b>
        </div>
      </AccordionSection>

      {/* Plantillas/Rutinas */}
      <AccordionSection
        id="routines"
        title="Plantillas"
        subtitle="Duplica o añade ejercicios de tus rutinas"
        open={openSec === 'routines'}
        onToggle={toggleSection}
      >
        <div className="grid md:grid-cols-2 gap-4">
          {routines.map((rt, i) => (
            <motion.div
              key={rt._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="border rounded-lg p-3 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-indigo-700">{rt.name}</div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    onClick={() => {
                      duplicateRoutine(rt._id)
                      setRoutines(getRoutines())
                    }}
                  >
                    Duplicar
                  </Button>
                </motion.div>
              </div>
              <div className="space-y-2">
                {rt.days.map(day => (
                  <div key={day.name}>
                    <div className="text-sm text-gray-600">{day.name}</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {day.blocks.map((b, j) => (
                        <motion.button
                          key={`${day.name}-${b.exercise}-${j}`}
                          className="px-2 py-1 rounded border text-sm hover:bg-gray-50"
                          onClick={() => quickAdd(b.exercise, b.tags || [])}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 + j * 0.03 }}
                        >
                          + {b.exercise}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </AccordionSection>

      {/* Volumen por grupo */}
      <AccordionSection
        id="volume"
        title="Volumen por grupo (7 días)"
        subtitle="Series efectivas (sin calentamiento)"
        open={openSec === 'volume'}
        onToggle={toggleSection}
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {groups.map((g, i) => {
            const color =
              g.sets >= 12 ? 'bg-green-100 text-green-800' :
              g.sets >= 8 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            return (
              <motion.div
                key={g.group}
                className="flex justify-between items-center border rounded-md px-3 py-2 hover:shadow-sm transition-shadow"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.04 }}
              >
                <span className="capitalize">{g.group}</span>
                <motion.span className={`text-xs px-2 py-1 rounded-full ${color}`} whileHover={{ scale: 1.1 }}>
                  {g.sets} sets
                </motion.span>
              </motion.div>
            )
          })}
          {groups.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-500">
              Aún sin datos.
            </motion.div>
          )}
        </div>
      </AccordionSection>
    </motion.main>
  )
}

// ===============================
// Subcomponentes
// ===============================
function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <motion.div whileHover={{ y: -3 }}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-3">
          <p className="text-sm text-gray-500">{title}</p>
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
    </motion.div>
  )
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (n: number) => void
}) {
  return (
    <motion.div whileHover={{ y: -3 }}>
      <div>
        <label className="block text-xs text-gray-500 mb-1">{label}</label>
        <motion.input
          type="number"
          className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          value={Number.isFinite(value) ? value : 0}
          onChange={e => {
            const raw = e.target.value.trim()
            const v = raw === '' ? 0 : Number(raw)
            onChange(Number.isFinite(v) ? v : 0)
          }}
          whileFocus={{ scale: 1.02 }}
        />
      </div>
    </motion.div>
  )
}

function TextInput({
  label,
  id,
  placeholder,
  value,
  onChange,
  onEnter,
}: {
  label: string
  id: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  onEnter?: () => void
}) {
  return (
    <motion.div whileHover={{ y: -3 }} className="col-span-2">
      <label htmlFor={id} className="block text-xs text-gray-500 mb-1">{label}</label>
      <motion.input
        id={id}
        placeholder={placeholder}
        className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onEnter?.()
        }}
        whileFocus={{ scale: 1.02 }}
      />
    </motion.div>
  )
}
