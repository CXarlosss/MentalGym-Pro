// src/components/exercises/engines/MentalMathDemo.tsx
'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Exercise } from '@/types'

type Props = {
  exercise: Exercise
  durationMin: number
  onComplete: (score: number, timeSpent: number) => void
  onCancel: () => void
}

type Op = '+' | '-' | '×' | '÷'
type Problem = { a: number; b: number; op: Op; answer: number }

export default function MentalMathDemo({ exercise, durationMin, onComplete, onCancel }: Props) {
  // --- tiempo ---
  const totalSec = Math.max(30, Math.round(durationMin * 60)) // mínimo 30s
  const [timeLeft, setTimeLeft] = useState(totalSec)
  const startedAtRef = useRef<number>(Date.now())
  const tickRef = useRef<number | null>(null)

  // --- estado de juego ---
  const [problem, setProblem] = useState<Problem>(() => makeProblem(exercise.difficulty))
  const [input, setInput] = useState('')
  const [correct, setCorrect] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [wrong, setWrong] = useState(0)

  // arranque/cronómetro
  useEffect(() => {
    tickRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(tickRef.current!)
          finish()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { if (tickRef.current) window.clearInterval(tickRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // genera problema acorde a dificultad
  function makeProblem(diff: Exercise['difficulty']): Problem {
    const r = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

    let ops: Op[] = ['+', '-']
    if (diff !== 'easy') ops = ['+', '-', '×']
    if (diff === 'hard') ops = ['+', '-', '×', '÷']

    const op = pick(ops)

    if (op === '+') {
      const a = diff === 'easy' ? r(1, 20) : diff === 'medium' ? r(10, 60) : r(20, 99)
      const b = diff === 'easy' ? r(1, 20) : diff === 'medium' ? r(10, 60) : r(20, 99)
      return { a, b, op, answer: a + b }
    }

    if (op === '-') {
      let a = diff === 'easy' ? r(1, 25) : diff === 'medium' ? r(20, 80) : r(50, 150)
      let b = diff === 'easy' ? r(1, 25) : diff === 'medium' ? r(10, 70) : r(20, 120)
      if (b > a) [a, b] = [b, a] // evita negativos
      return { a, b, op, answer: a - b }
    }

    if (op === '×') {
      const a = diff === 'easy' ? r(2, 9) : diff === 'medium' ? r(4, 12) : r(6, 15)
      const b = diff === 'easy' ? r(2, 9) : diff === 'medium' ? r(4, 12) : r(6, 15)
      return { a, b, op, answer: a * b }
    }

    // '÷' (solo divisiones exactas)
    const b = diff === 'easy' ? r(2, 9) : diff === 'medium' ? r(3, 12) : r(6, 15)
    const q = diff === 'easy' ? r(2, 9) : diff === 'medium' ? r(3, 12) : r(6, 15)
    const a = b * q
    return { a, b, op, answer: q }
  }

  const prettyTime = useMemo(() => {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0')
    const s = (timeLeft % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }, [timeLeft])

  const submit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const parsed = Number(input.trim())
    const ok = Number.isFinite(parsed) && parsed === problem.answer
    setAttempts((a) => a + 1)
    if (ok) setCorrect((c) => c + 1)
    else setWrong((w) => w + 1)
    setInput('')
    setProblem(makeProblem(exercise.difficulty))
  }

  const finish = () => {
    if (tickRef.current) window.clearInterval(tickRef.current)
    const timeSpent = Math.round((Date.now() - startedAtRef.current) / 1000)

    // puntuación simple: mezcla volumen y precisión
    const acc = attempts > 0 ? correct / attempts : 0
    // cada acierto suma 5 pts (hasta 60) + precisión hasta 40 -> máx 100
    const score = Math.max(0, Math.min(100, Math.round(correct * 5 + acc * 40)))
    onComplete(score, timeSpent)
  }

  return (
    <div className="bg-white p-6 rounded-xl border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Cálculo rápido</h3>
        <div className="font-mono text-sm px-3 py-1 rounded bg-gray-100">{prettyTime}</div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="text-center py-6">
          <div className="text-4xl font-bold">
            {problem.a} {problem.op} {problem.b} = ?
          </div>
        </div>

        <div className="flex items-center gap-3 max-w-sm mx-auto">
          <input
            type="number"
            inputMode="numeric"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg text-lg text-center"
            placeholder="Tu resultado"
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Comprobar
          </button>
        </div>
      </form>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500">Aciertos</div>
          <div className="text-xl font-semibold">{correct}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500">Errores</div>
          <div className="text-xl font-semibold">{wrong}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500">Intentos</div>
          <div className="text-xl font-semibold">{attempts}</div>
        </div>
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
