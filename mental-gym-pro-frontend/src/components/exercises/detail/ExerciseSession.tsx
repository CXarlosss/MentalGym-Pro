'use client'
import { useState, useEffect, useRef } from 'react'
import { useTimer } from 'react-timer-hook'
import ProgressBar from '@/components/progress/ProgressBar'
import { Exercise } from '@/types'

type ExerciseSessionProps = {
  exercise: Exercise
  onComplete: (scoreNormalized: number, timeSpentSec: number) => void
  onCancel: () => void
}

export default function ExerciseSession({ exercise, onComplete, onCancel }: ExerciseSessionProps) {
  const [progress, setProgress] = useState(0)
  const [score, setScore] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  // Guarda el número correcto aunque lo ocultemos en UI
  const answerRef = useRef<string>('')

  // Timer para ocultar el número
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Para calcular el tiempo empleado
  const startTimeRef = useRef<Date>(new Date())

  const expiryTimestamp = new Date()
  expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + (exercise.duration || 5) * 60)

  const { seconds, minutes, pause } = useTimer({
    expiryTimestamp,
    onExpire: () => handleComplete(),
  })

  // Estado del mini-juego
  const [currentChallenge, setCurrentChallenge] = useState<string>('') // solo para mostrar
  const [userInput, setUserInput] = useState('')
  const [round, setRound] = useState(1)

  useEffect(() => {
    // Al montar: arrancamos primera ronda
    startTimeRef.current = new Date()
    generateChallenge(1)
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Genera un reto para la ronda indicada y lo muestra 2s
  const generateChallenge = (roundNumber: number) => {
    const length = 3 + Math.min(roundNumber - 1, 2) // 3,4,5,5,5
    const challenge = Array.from({ length }, () => Math.floor(Math.random() * 10)).join('')
    answerRef.current = challenge
    setCurrentChallenge(challenge)

    // Ocultar a los 2s (pero mantenemos answerRef para validar)
    if (timerRef.current !== null) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setCurrentChallenge('')
    }, 2000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (userInput === answerRef.current) {
      const roundScore = answerRef.current.length * 10
      setScore((prev) => prev + roundScore)
      setProgress((prev) => prev + 100 / 5) // 5 rondas

      if (round < 5) {
        // Calcula siguiente ronda y genera con ese valor (evita stale state)
        setRound((prev) => {
          const next = prev + 1
          setUserInput('')
          generateChallenge(next)
          return next
        })
      } else {
        handleComplete()
      }
    } else {
      alert('¡Incorrecto! Intenta recordar mejor.')
      setUserInput('')
    }
  }

  const handleComplete = () => {
    if (isCompleted) return
    setIsCompleted(true)
    pause()

    const timeSpent = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000)

    // Normaliza a 0–100 (máx 220 puntos con 5 rondas 3,4,5,5,5)
    const maxScore = Array.from({ length: 5 }, (_, i) => (3 + Math.min(i, 2)) * 10).reduce((a, b) => a + b, 0)
    const normalized = Math.min(100, Math.round((score / maxScore) * 100))

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
