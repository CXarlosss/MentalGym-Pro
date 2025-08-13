'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import {
  seedDefaultRoutinesOnce, getRoutines, duplicateRoutine,
  getFavoriteExercises,
  addGymSetToday, getGymWeeklySummary, getGroupVolumeThisWeek,
  epley1RM, brzycki1RM, targetFromPercent1RM
} from '@/lib/api'
import type { LiftTag } from '@/types'

// Timer mejorado con animaciones
function RestTimer({ seconds = 90 }: { seconds?: number }) {
  const [left, setLeft] = useState(seconds)
  const iv = useRef<number | undefined>(undefined)
  
  useEffect(() => {
    clearInterval(iv.current)
    iv.current = window.setInterval(() => setLeft(prev => {
      if (prev <= 1) {
        clearInterval(iv.current)
        if (Notification && Notification.permission === 'granted') {
          new Notification('¡Descanso terminado!')
        }
      }
      return Math.max(0, prev - 1)
    }), 1000)
    return () => clearInterval(iv.current)
  }, [seconds])

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
        <Button variant="outline" onClick={async () => {
          if (Notification && Notification.permission !== 'granted') {
            await Notification.requestPermission()
          }
        }}>Notificar</Button>
      </motion.div>
    </motion.div>
  )
}

export default function GymPage() {
  const [routines, setRoutines] = useState(getRoutines())
  const [fav] = useState(getFavoriteExercises())
  const [percent, setPercent] = useState(80)
  const [oneRM, setOneRM] = useState(100)

  const [weight, setWeight] = useState<number>(60)
  const [reps, setReps] = useState<number>(5)
  const [rpe, setRpe] = useState<number>(8)
  const [rir, setRir] = useState<number>(2)
  const [marker, setMarker] = useState<'warmup' | 'top' | 'backoff' | ''>('')

  const [summary, setSummary] = useState<{ vol: number; streak: number; top?: string }>({ vol: 0, streak: 0 })
  const [groups, setGroups] = useState<{ group: LiftTag; sets: number }[]>([])

  useEffect(() => {
    seedDefaultRoutinesOnce()
    setRoutines(getRoutines())
    refreshWeekly()
  }, [])

  async function refreshWeekly() {
    const ws = await getGymWeeklySummary()
    const gv = await getGroupVolumeThisWeek()
    setSummary({ vol: ws.totalVolume, streak: ws.streak, top: ws.topVolumeDay?.date })
    setGroups(gv)
  }

  async function quickAdd(exercise: string, tags: LiftTag[] = []) {
    await addGymSetToday({ exercise, weight, reps, rpe, rir, marker: marker || undefined, tags })
    refreshWeekly()
  }

  const target = useMemo(() => targetFromPercent1RM(oneRM, percent), [oneRM, percent])
  const estEpley = useMemo(() => epley1RM(weight, reps), [weight, reps])
  const estBrzycki = useMemo(() => brzycki1RM(weight, reps), [weight, reps])

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
       className="max-w-7xl mx-auto p-4 space-y-6  bg-gradient-to-br from-indigo-50 to-gray-50 min-h-screen"
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

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: "Volumen 7 días", value: `${summary.vol} kg·reps` },
          { title: "Racha", value: `${summary.streak} días` },
          { title: "Mejor día", value: summary.top ?? '—' }
        ].map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Kpi title={kpi.title} value={kpi.value} />
          </motion.div>
        ))}
      </div>

      {/* Target %1RM */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-indigo-700">%1RM objetivo</CardTitle>
            <CardDescription>Calcula el peso para la sesión según tu 1RM.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <NumberInput label="Tu 1RM (kg)" value={oneRM} onChange={setOneRM} />
              <NumberInput label="% objetivo" value={percent} onChange={setPercent} />
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
          </CardContent>
        </Card>
      </motion.div>

      {/* Logger rápido con RPE/RIR/marker */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-indigo-700">Registrar set rápido</CardTitle>
            <CardDescription>Peso, repeticiones, RPE/RIR y marcador.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
              <TextInput label="Ejercicio" placeholder="Press banca / Sentadilla…" id="exerciseName" />
              <NumberInput label="Peso (kg)" value={weight} onChange={setWeight} />
              <NumberInput label="Reps" value={reps} onChange={setReps} />
              <NumberInput label="RPE" value={rpe} onChange={setRpe} />
              <NumberInput label="RIR" value={rir} onChange={setRir} />
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
              {/* botones de ejemplo desde plantillas/favs */}
              {routines.slice(0, 1).flatMap(r => r.days[0].blocks).slice(0, 4).map((b, i) => (
                <motion.div
                  key={b.exercise}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
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
                  transition={{ delay: 0.5 + i * 0.05 }}
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
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  onClick={() => {
                    const el = document.getElementById('exerciseName') as HTMLInputElement | null
                    const ex = (el?.value || '').trim()
                    if (!ex) return
                    quickAdd(ex)
                  }}
                >
                  Guardar set
                </Button>
              </motion.div>
            </div>

            <div className="mt-4 text-xs text-gray-600">
              1RM estimado (Epley): <b>{estEpley} kg</b> • (Brzycki): <b>{estBrzycki} kg</b>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Plantillas/Rutinas */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-indigo-700">Plantillas</CardTitle>
            <CardDescription>Duplica o marca ejercicios como favoritos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {routines.map((rt, i) => (
                <motion.div
                  key={rt._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="border rounded-lg p-3 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-indigo-700">{rt.name}</div>
                    <div className="flex gap-2">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          onClick={() => { duplicateRoutine(rt._id); setRoutines(getRoutines()) }}
                        >
                          Duplicar
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {rt.days.map(day => (
                      <div key={day.name}>
                        <div className="text-sm text-gray-600">{day.name}</div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {day.blocks.map((b, j) => (
                            <motion.button
                              key={b.exercise}
                              className="px-2 py-1 rounded border text-sm hover:bg-gray-50"
                              onClick={() => quickAdd(b.exercise, b.tags || [])}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.6 + j * 0.05 }}
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
          </CardContent>
        </Card>
      </motion.div>

      {/* Volumen por grupo (semáforo) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-indigo-700">Volumen por grupo (7 días)</CardTitle>
            <CardDescription>Series efectivas (sin calentamiento).</CardDescription>
          </CardHeader>
          <CardContent>
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
                    transition={{ delay: 0.6 + i * 0.05 }}
                  >
                    <span className="capitalize">{g.group}</span>
                    <motion.span
                      className={`text-xs px-2 py-1 rounded-full ${color}`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {g.sets} sets
                    </motion.span>
                  </motion.div>
                )
              })}
              {groups.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-gray-500"
                >
                  Aún sin datos.
                </motion.div>
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
    <motion.div whileHover={{ y: -3 }}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-3">
          <p className="text-sm text-gray-500">{title}</p>
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
    </motion.div>
  )
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <motion.div whileHover={{ y: -3 }}>
      <div>
        <label className="block text-xs text-gray-500 mb-1">{label}</label>
        <motion.input
          type="number"
          className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          whileFocus={{ scale: 1.02 }}
        />
      </div>
    </motion.div>
  )
}

function TextInput({ label, id, placeholder }: { label: string; id: string; placeholder?: string }) {
  return (
    <motion.div whileHover={{ y: -3 }} className="col-span-2">
      <label htmlFor={id} className="block text-xs text-gray-500 mb-1">{label}</label>
      <motion.input
        id={id}
        placeholder={placeholder}
        className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
        whileFocus={{ scale: 1.02 }}
      />
    </motion.div>
  )
}