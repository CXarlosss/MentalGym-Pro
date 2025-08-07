// src/components/exercises/detail/ExerciseSession.tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import { useTimer } from 'react-timer-hook'
import ProgressBar from '@/components/progress/ProgressBar'

type ExerciseSessionProps = {
  exercise: Exercise
  onComplete: (score: number, timeSpent: number) => void
  onCancel: () => void
}

export default function ExerciseSession({ exercise, onComplete, onCancel }: ExerciseSessionProps) {
  const [progress, setProgress] = useState(0)
  const [score, setScore] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const timerRef = useRef<NodeJS.Timeout>()
  const startTimeRef = useRef<Date>(new Date())
  
  const expiryTimestamp = new Date()
  expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + (exercise.duration || 5) * 60)
  
  const { seconds, minutes, isRunning, pause, resume } = useTimer({ 
    expiryTimestamp,
    onExpire: () => handleComplete()
  })

  // Ejemplo de ejercicio de memoria básico
  const [currentChallenge, setCurrentChallenge] = useState<string>('')
  const [userInput, setUserInput] = useState('')
  const [round, setRound] = useState(1)

  useEffect(() => {
    generateChallenge()
    return () => clearTimeout(timerRef.current)
  }, [])

  const generateChallenge = () => {
    // Genera un número aleatorio de 3 a 5 + round dígitos
    const length = 3 + Math.min(round - 1, 2)
    const challenge = Array.from({ length }, () => Math.floor(Math.random() * 10)).join('')
    setCurrentChallenge(challenge)
    
    // Muestra el número por 2 segundos
    timerRef.current = setTimeout(() => {
      setCurrentChallenge('')
    }, 2000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (userInput === currentChallenge) {
      const roundScore = currentChallenge.length * 10
      setScore(prev => prev + roundScore)
      setProgress(prev => prev + (100 / 5)) // 5 rondas para completar
      
      if (round < 5) {
        setRound(prev => prev + 1)
        setUserInput('')
        generateChallenge()
      } else {
        handleComplete()
      }
    } else {
      alert('¡Incorrecto! Intenta recordar mejor.')
      setUserInput('')
    }
  }

  const handleComplete = () => {
    setIsCompleted(true)
    pause()
    const timeSpent = Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000)
    onComplete(score, timeSpent)
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Ejercicio en progreso</h2>
        <div className="text-gray-700 font-mono">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>
      
      <ProgressBar value={progress} className="mb-6" />
      
      <div className="text-center py-8">
        {currentChallenge ? (
          <div className="text-5xl font-bold tracking-widest mb-8">
            {currentChallenge}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <label className="block text-gray-700 mb-2">
              Ingresa el número que viste:
            </label>
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
        <button
          onClick={onCancel}
          className="text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancelar
        </button>
        <div className="text-lg font-medium">
          Puntuación: <span className="font-bold">{score}</span>
        </div>
      </div>
    </div>
  )
}