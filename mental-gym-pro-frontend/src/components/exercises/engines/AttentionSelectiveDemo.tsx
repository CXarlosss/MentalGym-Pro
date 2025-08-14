// src/components/exercises/engines/AttentionSelectiveDemo.tsx
'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Exercise } from '@/types'

type Props = {
  exercise: Exercise
  durationMin: number
  onComplete: (score: number, timeSpent: number) => void
  onCancel: () => void
}

type Cell = { id: string; char: string; isTarget: boolean; clicked?: boolean }

const SYMBOL_SETS = [
  ['▲','△','◆','◇','■','□','●','○','★','☆'],
  ['A','B','E','F','H','K','M','N','R','W'],
  ['#','&','@','%','+','=','?','§','¢','£'],
]

export default function AttentionSelectiveDemo({
  exercise,
  durationMin,
  onComplete,
  onCancel,
}: Props) {
  // config por dificultad
  const cfg = useMemo(() => {
    switch (exercise.difficulty) {
      case 'easy':   return { cols: 6, rows: 5, rounds: 4, targetCount: [5,7], symbols: SYMBOL_SETS[0] }
      case 'medium': return { cols: 7, rows: 6, rounds: 5, targetCount: [7,10], symbols: SYMBOL_SETS[1] }
      case 'hard':   return { cols: 8, rows: 7, rounds: 6, targetCount: [10,14], symbols: SYMBOL_SETS[2] }
      default:       return { cols: 6, rows: 5, rounds: 4, targetCount: [5,7], symbols: SYMBOL_SETS[0] }
    }
  }, [exercise.difficulty])

  // tiempo
  const totalSec = Math.max(30, Math.round(durationMin * 60))
  const [timeLeft, setTimeLeft] = useState(totalSec)
  const startedAtRef = useRef<number>(Date.now())
  const timerRef = useRef<number | null>(null)

  // juego
  const [round, setRound] = useState(1)
  const [target, setTarget] = useState<string>('●')
  const [grid, setGrid] = useState<Cell[]>([])
  const [remainingTargets, setRemainingTargets] = useState(0)

  // métricas
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)

  // helpers
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

  // construir una ronda
  const buildRound = () => {
    const total = cfg.cols * cfg.rows
    const targetThisRound = rand(cfg.targetCount[0], cfg.targetCount[1])
    const t = pick(cfg.symbols)
    const others = cfg.symbols.filter(s => s !== t)
    const g: Cell[] = []
    // meter objetivos
    for (let i = 0; i < targetThisRound; i++) {
      g.push({ id: `t${i}-${Date.now()}`, char: t, isTarget: true })
    }
    // meter distractores
    for (let i = g.length; i < total; i++) {
      const d = pick(others)
      g.push({ id: `d${i}-${Date.now()}`, char: d, isTarget: false })
    }
    // mezclar
    for (let i = g.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[g[i], g[j]] = [g[j], g[i]]
    }
    setTarget(t)
    setGrid(g)
    setRemainingTargets(targetThisRound)
  }

  // iniciar cronómetro
  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          window.clearInterval(timerRef.current!)
          finish()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) window.clearInterval(timerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // primera ronda
  useEffect(() => {
    buildRound()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // siguiente ronda cuando no quedan objetivos
  useEffect(() => {
    if (remainingTargets === 0 && grid.length) {
      if (round < cfg.rounds) {
        setRound(r => r + 1)
        setTimeout(buildRound, 400)
      } else {
        finish()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingTargets])

  const onCellClick = (cell: Cell) => {
    if (cell.clicked) return
    cell.clicked = true
    setGrid(prev => prev.map(c => (c.id === cell.id ? { ...c } : c)))

    if (cell.isTarget) {
      setHits(h => h + 1)
      setRemainingTargets(n => Math.max(0, n - 1))
    } else {
      setMisses(m => m + 1)
    }
  }

  const finish = () => {
    if (timerRef.current) window.clearInterval(timerRef.current)
    const timeSpent = Math.round((Date.now() - startedAtRef.current) / 1000)
    // puntuación: aciertos ponderados por precisión
    const attempts = hits + misses
    const acc = attempts > 0 ? hits / attempts : 0
    // cada acierto suma 3 pts (volumen, tope ~ 75) + precisión hasta 25 -> máx 100
    const raw = Math.round(Math.min(75, hits * 3) + acc * 25)
    const score = Math.max(0, Math.min(100, raw))
    onComplete(score, timeSpent)
  }

  const prettyTime = useMemo(() => {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0')
    const s = (timeLeft % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }, [timeLeft])

  return (
    <div className="bg-white p-6 rounded-xl border">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">Ronda {round} / {cfg.rounds}</div>
        <div className="font-mono text-sm px-3 py-1 rounded bg-gray-100">{prettyTime}</div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="text-gray-700">
          Objetivo:&nbsp;
          <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-indigo-50 text-lg">
            {target}
          </span>
        </div>
        <div className="flex gap-3 text-sm">
          <span className="px-2 py-1 rounded bg-green-50 text-green-700">Aciertos: {hits}</span>
          <span className="px-2 py-1 rounded bg-red-50 text-red-700">Errores: {misses}</span>
          <span className="px-2 py-1 rounded bg-gray-100">Restan: {remainingTargets}</span>
        </div>
      </div>

      <div
        className="grid gap-2 select-none"
        style={{
          gridTemplateColumns: `repeat(${cfg.cols}, minmax(0, 1fr))`,
        }}
      >
        {grid.map(cell => (
          <button
            key={cell.id}
            onClick={() => onCellClick(cell)}
            className={`aspect-square flex items-center justify-center rounded text-xl border
              ${cell.clicked
                ? (cell.isTarget ? 'bg-green-200 border-green-300' : 'bg-red-200 border-red-300')
                : 'bg-gray-50 hover:bg-gray-100 border-gray-200'}`}
          >
            {cell.char}
          </button>
        ))}
      </div>

      <div className="mt-6 flex gap-2">
        <button onClick={finish} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          Terminar
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
          Cancelar
        </button>
      </div>
    </div>
  )
}
