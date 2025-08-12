'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  seedDefaultRoutinesOnce, getRoutines,  duplicateRoutine,
  getFavoriteExercises,
  addGymSetToday, getGymWeeklySummary, getGroupVolumeThisWeek,
  epley1RM, brzycki1RM, targetFromPercent1RM
} from '@/lib/api'
import type {LiftTag } from '@/types'

// ── Timer simple con notificación
function RestTimer({ seconds=90 }: { seconds?: number }) {
  const [left, setLeft] = useState(seconds)
  const iv = useRef<number|undefined>(undefined)
  useEffect(() => {
    clearInterval(iv.current)
    iv.current = window.setInterval(()=>setLeft(prev => {
      if (prev<=1) {
        clearInterval(iv.current)
        if (Notification && Notification.permission === 'granted') new Notification('¡Descanso terminado!')
      }
      return Math.max(0, prev-1)
    }), 1000)
    return () => clearInterval(iv.current)
  }, [seconds])
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Descanso:</span>
      <span className="font-semibold">{left}s</span>
      <Button variant="outline" onClick={()=>setLeft(seconds)}>Reiniciar</Button>
      <Button variant="outline" onClick={async ()=>{
        if (Notification && Notification.permission !== 'granted') await Notification.requestPermission()
      }}>Notificar</Button>
    </div>
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
  const [marker, setMarker] = useState<'warmup'|'top'|'backoff'|''>('')

  const [summary, setSummary] = useState<{vol:number; streak:number; top?:string}>({vol:0,streak:0})
  const [groups, setGroups] = useState<{group:LiftTag; sets:number}[]>([])

  useEffect(()=>{
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
    await addGymSetToday({ exercise, weight, reps, rpe, rir, marker: marker||undefined, tags })
    setWeight(prev => prev) // deja igual
    refreshWeekly()
  }

  const target = useMemo(()=> targetFromPercent1RM(oneRM, percent), [oneRM, percent])
  const estEpley = useMemo(()=> epley1RM(weight, reps), [weight, reps])
  const estBrzycki = useMemo(()=> brzycki1RM(weight, reps), [weight, reps])

  return (
    <main className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Entrenamiento de Fuerza</h1>
          <p className="text-gray-600">Plantillas, favoritos, %1RM, RPE/RIR y descanso.</p>
        </div>
        <Link href="/dashboard"><Button variant="outline">← Volver</Button></Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Kpi title="Volumen 7 días" value={`${summary.vol} kg·reps`} />
        <Kpi title="Racha" value={`${summary.streak} días`} />
        <Kpi title="Mejor día" value={summary.top ?? '—'} />
      </div>

      {/* Target %1RM */}
      <Card>
        <CardHeader>
          <CardTitle>%1RM objetivo</CardTitle>
          <CardDescription>Calcula el peso para la sesión según tu 1RM.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <NumberInput label="Tu 1RM (kg)" value={oneRM} onChange={setOneRM} />
            <NumberInput label="% objetivo" value={percent} onChange={setPercent} />
            <div className="flex flex-col justify-end">
              <div className="text-sm text-gray-500">Peso objetivo</div>
              <div className="text-2xl font-semibold">{target} kg</div>
            </div>
            <RestTimer seconds={90} />
          </div>
        </CardContent>
      </Card>

      {/* Logger rápido con RPE/RIR/marker */}
      <Card>
        <CardHeader>
          <CardTitle>Registrar set rápido</CardTitle>
          <CardDescription>Peso, repeticiones, RPE/RIR y marcador.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
            <TextInput label="Ejercicio" placeholder="Press banca / Sentadilla…" id="exerciseName" />
            <NumberInput label="Peso (kg)" value={weight} onChange={setWeight}/>
            <NumberInput label="Reps" value={reps} onChange={setReps}/>
            <NumberInput label="RPE" value={rpe} onChange={setRpe}/>
            <NumberInput label="RIR" value={rir} onChange={setRir}/>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Marcador</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm"
                      value={marker}
                      onChange={e=>setMarker(e.target.value as 'warmup'|'top'|'backoff'|'')}>
                <option value="">(ninguno)</option>
                <option value="warmup">Calentamiento</option>
                <option value="top">Top set</option>
                <option value="backoff">Back-off</option>
              </select>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {/* botones de ejemplo desde plantillas/favs */}
            {routines.slice(0,1).flatMap(r => r.days[0].blocks).slice(0,4).map(b => (
              <Button key={b.exercise} variant="outline" onClick={()=>quickAdd(b.exercise, (b.tags||[]))}>
                + {b.exercise}
              </Button>
            ))}
            {fav.map(name => (
              <Button key={name} variant="outline" onClick={()=>quickAdd(name)}>
                ★ {name}
              </Button>
            ))}
            <Button onClick={()=>{
              const el = document.getElementById('exerciseName') as HTMLInputElement|null
              const ex = (el?.value || '').trim()
              if (!ex) return
              quickAdd(ex)
            }}>Guardar set</Button>
          </div>

          <div className="mt-4 text-xs text-gray-600">
            1RM estimado (Epley): <b>{estEpley} kg</b> • (Brzycki): <b>{estBrzycki} kg</b>
          </div>
        </CardContent>
      </Card>

      {/* Plantillas/Rutinas */}
      <Card>
        <CardHeader>
          <CardTitle>Plantillas</CardTitle>
          <CardDescription>Duplica o marca ejercicios como favoritos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {routines.map(rt => (
              <div key={rt._id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">{rt.name}</div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={()=>{ duplicateRoutine(rt._id); setRoutines(getRoutines()) }}>
                      Duplicar
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {rt.days.map(day => (
                    <div key={day.name}>
                      <div className="text-sm text-gray-600">{day.name}</div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {day.blocks.map(b => (
                          <button key={b.exercise}
                                  className="px-2 py-1 rounded border text-sm hover:bg-gray-50"
                                  onClick={()=>quickAdd(b.exercise, b.tags||[])}>
                            + {b.exercise}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Volumen por grupo (semáforo) */}
      <Card>
        <CardHeader>
          <CardTitle>Volumen por grupo (7 días)</CardTitle>
          <CardDescription>Series efectivas (sin calentamiento).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {groups.map(g => {
              const color =
                g.sets >= 12 ? 'bg-green-100 text-green-800' :
                g.sets >= 8 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              return (
                <div key={g.group} className="flex justify-between items-center border rounded-md px-3 py-2">
                  <span className="capitalize">{g.group}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${color}`}>{g.sets} sets</span>
                </div>
              )
            })}
            {groups.length===0 && <div className="text-sm text-gray-500">Aún sin datos.</div>}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

function Kpi({ title, value }: {title:string; value:string}) {
  return (
    <Card><CardContent><p className="text-sm text-gray-500">{title}</p><p className="text-2xl font-semibold mt-1">{value}</p></CardContent></Card>
  )
}
function NumberInput({label,value,onChange}:{label:string; value:number; onChange:(n:number)=>void}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input type="number" className="w-full border rounded-md px-3 py-2 text-sm"
             value={value} onChange={e=>onChange(Number(e.target.value))}/>
    </div>
  )
}
function TextInput({label, id, placeholder}:{label:string; id:string; placeholder?:string}) {
  return (
    <div className="col-span-2">
      <label htmlFor={id} className="block text-xs text-gray-500 mb-1">{label}</label>
      <input id={id} placeholder={placeholder} className="w-full border rounded-md px-3 py-2 text-sm"/>
    </div>
  )
}
