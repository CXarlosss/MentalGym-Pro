'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Exercise } from '@/types'

type Props = {
  exercise: Exercise
  durationMin: number
  onComplete: (score: number, timeSpent: number) => void
  onCancel: () => void
}

type Rule = 'color' | 'parity'
type Stimulus = { color: 'red' | 'blue'; number: number }

export default function CognitiveFlexDemo({ exercise, durationMin, onComplete, onCancel }: Props) {
  // --- Config en función de la dificultad ---
  const cfg = useMemo(() => {
    switch (exercise.difficulty) {
      case 'easy':   return { switchEvery: 6, totalTrials: 24 }
      case 'medium': return { switchEvery: 5, totalTrials: 30 }
      case 'hard':   return { switchEvery: 4, totalTrials: 36 }
      default:       return { switchEvery: 6, totalTrials: 24 }
    }
  }, [exercise.difficulty])

  // --- Tiempo ---
  const totalSec = Math.max(30, Math.round(durationMin * 60))
  const [timeLeft, setTimeLeft] = useState(totalSec)
  const startedAtRef = useRef<number>(Date.now())
  const timerRef = useRef<number | null>(null)

  // --- Estado del juego ---
  const [rule, setRule] = useState<Rule>('color')          // regla actual
  const [trial, setTrial] = useState(1)                    // nº ensayo (1..totalTrials)
  const [stimulus, setStimulus] = useState<Stimulus>(() => makeStimulus())
  const [showSwitchCue, setShowSwitchCue] = useState(false)

  // métricas
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)

  // --- Helpers ---
  function makeStimulus(): Stimulus {
    const color: Stimulus['color'] = Math.random() < 0.5 ? 'red' : 'blue'
    const number = 1 + Math.floor(Math.random() * 9) // 1..9
    return { color, number }
  }

  function prettyTime(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const ss = (s % 60).toString().padStart(2, '0')
    return `${m}:${ss}`
  }

  function getLabels(r: Rule) {
    return r === 'color'
      ? { left: 'Rojo', right: 'Azul', title: 'Regla: COLOR (elige el color mostrado)' }
      : { left: 'Impar', right: 'Par', title: 'Regla: PARIDAD (elige si el número es par o impar)' }
  }

  function expectedSide(r: Rule, s: Stimulus): 'left' | 'right' {
    if (r === 'color') return s.color === 'red' ? 'left' : 'right'
    // parity
    const isEven = s.number % 2 === 0
    return isEven ? 'right' : 'left'
  }

  // --- Cronómetro ---
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

  // --- Cambio de regla programado ---
  useEffect(() => {
    if (trial > 1 && (trial - 1) % cfg.switchEvery === 0) {
      // alterna la regla y muestra aviso breve
      setRule(r => (r === 'color' ? 'parity' : 'color'))
      setShowSwitchCue(true)
      const t = window.setTimeout(() => setShowSwitchCue(false), 900)
      return () => window.clearTimeout(t)
    }
  }, [trial, cfg.switchEvery])

  // --- Entrada por teclado (A = izquierda, L = derecha) ---
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showSwitchCue) return
      if (e.key.toLowerCase() === 'a') handleAnswer('left')
      if (e.key.toLowerCase() === 'l') handleAnswer('right')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rule, stimulus, showSwitchCue])

  // --- Lógica al responder ---
  const handleAnswer = (side: 'left' | 'right') => {
    const exp = expectedSide(rule, stimulus)
    if (side === exp) setHits(h => h + 1)
    else setMisses(m => m + 1)

    if (trial >= cfg.totalTrials) {
      finish()
    } else {
      setTrial(t => t + 1)
      setStimulus(makeStimulus())
    }
  }

  // --- Fin y puntuación ---
  const finish = () => {
    if (timerRef.current) window.clearInterval(timerRef.current)
    const timeSpent = Math.round((Date.now() - startedAtRef.current) / 1000)
    const attempts = hits + misses
    const acc = attempts > 0 ? hits / attempts : 0
    // Puntuación: precisión (0–100) + pequeño bonus por volumen
    const base = Math.round(acc * 100)
    const volumeBonus = Math.min(20, Math.floor(hits / 3)) // hasta +20
    const score = Math.max(0, Math.min(100, base + volumeBonus))
    onComplete(score, timeSpent)
  }

  const labels = getLabels(rule)

  return (
    <div className="p-6 bg-white rounded-xl border">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-600">Ensayo {trial} / {cfg.totalTrials}</div>
        <div className="font-mono text-sm px-3 py-1 rounded bg-gray-100">{prettyTime(timeLeft)}</div>
      </div>

      <div className="mb-3">
        <p className="text-indigo-700 font-medium">{labels.title}</p>
        {showSwitchCue && (
          <div className="mt-2 px-3 py-2 rounded bg-yellow-100 text-yellow-800 text-sm font-semibold">
            ¡CAMBIO DE REGLA!
          </div>
        )}
      </div>

      {/* Estímulo */}
      <div className="flex items-center justify-center my-6">
        <div
          className={`w-28 h-28 rounded-full flex items-center justify-center shadow`}
          style={{ backgroundColor: stimulus.color === 'red' ? '#fecaca' : '#bfdbfe' }}
        >
          <span className="text-4xl font-bold text-gray-800">{stimulus.number}</span>
        </div>
      </div>

      {/* Controles */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => handleAnswer('left')}
          className="px-4 py-3 rounded-lg border hover:bg-gray-50"
        >
          {labels.left}  <span className="text-xs text-gray-400 ml-1">(A)</span>
        </button>
        <button
          onClick={() => handleAnswer('right')}
          className="px-4 py-3 rounded-lg border hover:bg-gray-50"
        >
          {labels.right} <span className="text-xs text-gray-400 ml-1">(L)</span>
        </button>
      </div>

      {/* Métricas rápidas */}
      <div className="flex gap-3 text-sm mb-6">
        <span className="px-2 py-1 rounded bg-green-50 text-green-700">Aciertos: {hits}</span>
        <span className="px-2 py-1 rounded bg-red-50 text-red-700">Errores: {misses}</span>
        <span className="px-2 py-1 rounded bg-gray-100">Precisión: {hits + misses ? Math.round((hits/(hits+misses))*100) : 0}%</span>
      </div>

      <div className="flex gap-2">
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
