'use client'
import { useState, useEffect, useRef } from 'react'
import { useTimer } from 'react-timer-hook'
import ProgressBar from '@/components/progress/ProgressBar'
import type { Exercise } from '@/types'

type Props = {
  exercise: Exercise
  onComplete: (scoreNormalized: number, timeSpentSec: number) => void
  onCancel: () => void
}

/* ---------- MOTOR: memoria de números (lo que ya tenías) ---------- */
function MemoryNumbersSession({ exercise, onComplete, onCancel }: Props) {
  const [progress, setProgress] = useState(0)
  const [score, setScore] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  const answerRef = useRef<string>('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startTimeRef = useRef<Date>(new Date())

  const expiryTimestamp = new Date()
  expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + (exercise.duration || 5) * 60)

  const { seconds, minutes, pause } = useTimer({
    expiryTimestamp,
    onExpire: () => handleComplete(),
  })

  const [currentChallenge, setCurrentChallenge] = useState<string>('') 
  const [userInput, setUserInput] = useState('')
  const [round, setRound] = useState(1)

  useEffect(() => {
    startTimeRef.current = new Date()
    generateChallenge(1)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const generateChallenge = (roundNumber: number) => {
    const length = 3 + Math.min(roundNumber - 1, 2) // 3,4,5,5,5
    const challenge = Array.from({ length }, () => Math.floor(Math.random() * 10)).join('')
    answerRef.current = challenge
    setCurrentChallenge(challenge)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCurrentChallenge(''), 2000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (userInput === answerRef.current) {
      const roundScore = answerRef.current.length * 10

      if (round < 5) {
        setScore(prev => prev + roundScore)
        setProgress(prev => prev + 100 / 5)
        setRound(prev => {
          const next = prev + 1
          setUserInput('')
          generateChallenge(next)
          return next
        })
      } else {
        // ⚠️ asegura que cuente la última ronda antes de completar
        const finalScore = score + roundScore
        const maxScore = [3,4,5,5,5].reduce((a,b)=>a + b*10, 0)
        const normalized = Math.min(100, Math.round((finalScore / maxScore) * 100))
        finish(normalized)
      }
    } else {
      alert('¡Incorrecto! Intenta recordar mejor.')
      setUserInput('')
    }
  }

  const handleComplete = () => {
    // Completa usando el score actual (por expiración)
    const maxScore = [3,4,5,5,5].reduce((a,b)=>a + b*10, 0)
    const normalized = Math.min(100, Math.round((score / maxScore) * 100))
    finish(normalized)
  }

  const finish = (normalized: number) => {
    if (isCompleted) return
    setIsCompleted(true)
    pause()
    const timeSpent = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000)
    onComplete(normalized, timeSpent)
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Ejercicio en progreso</h2>
        <div className="text-gray-700 font-mono">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>

      <ProgressBar value={progress} />

      <div className="text-center py-8">
        {currentChallenge ? (
          <div className="text-5xl font-bold tracking-widest mb-8">{currentChallenge}</div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <label className="block text-gray-700 mb-2">Ingresa el número que viste:</label>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-center text-2xl font-mono mb-4"
              autoFocus
              disabled={isCompleted}
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              disabled={isCompleted}
            >
              Verificar
            </button>
          </form>
        )}
      </div>

      <div className="flex justify-between items-center mt-6">
        <button onClick={onCancel} className="text-gray-600 hover:text-gray-800 transition-colors">
          Cancelar
        </button>
        <div className="text-lg font-medium">
          Puntuación: <span className="font-bold">{score}</span>
        </div>
      </div>
    </div>
  )
}

/* ---------- Stubs rápidos para otros motores ---------- */
function ReactionSpeedSession({ onComplete, onCancel }: Props) {
  return (
    <div className="p-6 bg-white rounded-xl border">
      <p className="mb-4">Demo “Velocidad de reacción”.</p>
      <div className="flex gap-2">
        <button className="bg-indigo-600 text-white px-4 py-2 rounded" onClick={() => onComplete(90, 20)}>Terminar (demo)</button>
        <button className="px-4 py-2 rounded border" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  )
}

function MentalMathSession({ onComplete, onCancel }: Props) {
  return (
    <div className="p-6 bg-white rounded-xl border">
      <p className="mb-4">Demo “Cálculo rápido”.</p>
      <div className="flex gap-2">
        <button className="bg-indigo-600 text-white px-4 py-2 rounded" onClick={() => onComplete(75, 40)}>Terminar (demo)</button>
        <button className="px-4 py-2 rounded border" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  )
}

/* ---------- Dispatcher por engine ---------- */
export default function ExerciseSession(props: Props) {
  const eng = props.exercise.engine
  switch (eng) {
    case 'reaction-speed':   return <ReactionSpeedSession {...props} />
    case 'mental-math':      return <MentalMathSession {...props} />
    // agrega aquí ‘logic-seq’, ‘attention-selective’, ‘cognitive-flex’ cuando los tengas
    case 'memory-pairs':
    default:
      return <MemoryNumbersSession {...props} />
  }
}
