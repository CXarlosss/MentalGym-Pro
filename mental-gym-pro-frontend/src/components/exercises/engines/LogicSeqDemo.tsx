'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Exercise } from '@/types'

type Props = {
  exercise: Exercise
  durationMin: number
  onComplete: (score: number, timeSpent: number) => void
  onCancel: () => void
}

type RuleKind =
  | 'arith'        // progresión aritmética: +k o -k
  | 'geom'         // progresión geométrica: *k
  | 'altAddSub'    // alterna +a, -b
  | 'altMulAdd'    // alterna *a, +b

type Sequence = {
  rule: RuleKind
  terms: number[]   // primeros N términos mostrados
  answer: number    // siguiente término esperado
  hint: string      // pista opcional
}

export default function LogicSeqDemo({ exercise, durationMin, onComplete, onCancel }: Props) {
  // --- Dificultad controla nº ensayos y variedad ---
  const cfg = useMemo(() => {
    switch (exercise.difficulty) {
      case 'easy':   return { trials: 8,  maxAbs: 30,  allowGeom: false, allowAltMul: false }
      case 'medium': return { trials: 10, maxAbs: 60,  allowGeom: true,  allowAltMul: false }
      case 'hard':   return { trials: 12, maxAbs: 120, allowGeom: true,  allowAltMul: true  }
      default:       return { trials: 8,  maxAbs: 30,  allowGeom: false, allowAltMul: false }
    }
  }, [exercise.difficulty])

  // --- Temporizador (opcional) ---
  const totalSec = Math.max(30, Math.round(durationMin * 60))
  const [timeLeft, setTimeLeft] = useState(totalSec)
  const startedAtRef = useRef<number>(Date.now())
  const timerRef = useRef<number | null>(null)

  // --- Estado del juego ---
  const [trial, setTrial] = useState(1)
  const [seq, setSeq] = useState<Sequence>(() => makeSequence(cfg))
  const [input, setInput] = useState('')

  // métricas
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)

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

  // --- Generador de secuencias ---
  function makeSequence(c: { maxAbs: number; allowGeom: boolean; allowAltMul: boolean }): Sequence {
    const options: RuleKind[] = ['arith', 'altAddSub']
    if (c.allowGeom) options.push('geom')
    if (c.allowAltMul) options.push('altMulAdd')
    const rule = options[Math.floor(Math.random() * options.length)]

    const len = 4 // mostramos 4 términos y el usuario predice el 5º
    let terms: number[] = []
    let answer = 0
    let hint = ''

    const rand = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min

    switch (rule) {
      case 'arith': {
        // a, a+d, a+2d, a+3d -> next a+4d
        const d = rand(-6, 9) || 2
        const a0 = rand(-10, 20)
        terms = Array.from({ length: len }, (_, i) => a0 + i * d)
        answer = a0 + len * d
        hint = 'Progresión aritmética'
        break
      }
      case 'geom': {
        // a, a*r, a*r^2, a*r^3
        const rChoices = [2, 3]
        const r = rChoices[Math.floor(Math.random() * rChoices.length)]
        const a0 = rand(1, 4)
        terms = Array.from({ length: len }, (_, i) => a0 * Math.pow(r, i))
        answer = a0 * Math.pow(r, len)
        hint = 'Progresión geométrica'
        break
      }
      case 'altAddSub': {
        // +a, -b, +a, -b...
        const a = rand(2, 9)
        const b = rand(1, 7)
        const start = rand(-10, 15)
        terms = [start]
        for (let i = 1; i < len; i++) {
          const prev = terms[i - 1]
          terms.push(i % 2 === 1 ? prev + a : prev - b)
        }
        // next:
        const last = terms[len - 1]
        answer = len % 2 === 1 ? last + a : last - b
        hint = 'Alterna +a, -b'
        break
      }
      case 'altMulAdd': {
        // *a, +b, *a, +b...
        const a = [2, 3][Math.floor(Math.random() * 2)]
        const b = rand(2, 9)
        const start = rand(2, 6)
        terms = [start]
        for (let i = 1; i < len; i++) {
          const prev = terms[i - 1]
          terms.push(i % 2 === 1 ? prev * a : prev + b)
        }
        const last = terms[len - 1]
        answer = len % 2 === 1 ? last * a : last + b
        hint = 'Alterna ×a, +b'
        break
      }
    }

    // Evita números absolutamente enormes
    if (terms.some(t => Math.abs(t) > cfg.maxAbs) || Math.abs(answer) > cfg.maxAbs) {
      return makeSequence(c) // vuelve a generar otra
    }

    return { rule, terms, answer, hint }
  }

  // --- Enviar respuesta ---
  const submit = () => {
    if (!input.trim()) return
    const val = Number(input)
    if (Number.isNaN(val)) return

    if (val === seq.answer) setHits(h => h + 1)
    else setMisses(m => m + 1)

    if (trial >= cfg.trials) {
      finish()
    } else {
      setTrial(t => t + 1)
      setSeq(makeSequence(cfg))
      setInput('')
    }
  }

  // --- Fin y puntuación ---
  const finish = () => {
    if (timerRef.current) window.clearInterval(timerRef.current)
    const timeSpent = Math.round((Date.now() - startedAtRef.current) / 1000)
    const attempts = hits + misses
    const accuracy = attempts ? hits / attempts : 0
    const base = Math.round(accuracy * 100)
    const speedBonus = Math.min(20, Math.floor(hits / 2)) // bonifica volumen correcto
    const score = Math.max(0, Math.min(100, base + speedBonus))
    onComplete(score, timeSpent)
  }

  const prettyTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const ss = (s % 60).toString().padStart(2, '0')
    return `${m}:${ss}`
  }

  return (
    <div className="p-6 bg-white rounded-xl border">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-600">Ensayo {trial} / {cfg.trials}</div>
        <div className="font-mono text-sm px-3 py-1 rounded bg-gray-100">{prettyTime(timeLeft)}</div>
      </div>

      <p className="text-indigo-700 font-medium mb-2">Completa la secuencia:</p>

      <div className="flex items-center justify-center gap-3 my-4">
        {seq.terms.map((t, i) => (
          <div key={i} className="text-2xl font-bold text-gray-800">{t}</div>
        ))}
        <div className="text-2xl font-bold text-gray-400">?</div>
      </div>

      <p className="text-xs text-gray-500 mb-3">Pista: {seq.hint}</p>

      <div className="flex gap-2 mb-4">
        <input
          type="number"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          className="border rounded-lg px-3 py-2 w-40"
          placeholder="Tu respuesta…"
          autoFocus
        />
        <button
          onClick={submit}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Enviar
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>

      <div className="flex gap-3 text-sm">
        <span className="px-2 py-1 rounded bg-green-50 text-green-700">Aciertos: {hits}</span>
        <span className="px-2 py-1 rounded bg-red-50 text-red-700">Errores: {misses}</span>
        <span className="px-2 py-1 rounded bg-gray-100">
          Precisión: {hits + misses ? Math.round((hits / (hits + misses)) * 100) : 0}%
        </span>
      </div>

      <div className="mt-6">
        <button onClick={finish} className="text-sm text-gray-600 underline">Terminar ahora</button>
      </div>
    </div>
  )
}
