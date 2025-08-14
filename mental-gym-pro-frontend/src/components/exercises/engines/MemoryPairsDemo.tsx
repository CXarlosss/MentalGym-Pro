'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Exercise } from '@/types'

type Props = {
  exercise: Exercise
  durationMin: number
  onComplete: (score: number, timeSpent: number) => void
  onCancel: () => void
}

type Card = {
  id: number
  icon: string
  flipped: boolean
  matched: boolean
}

export default function MemoryPairsDemo({ exercise, durationMin, onComplete, onCancel }: Props) {
  const startedAtRef = useRef<number>(Date.now())
  const totalSec = Math.max(30, Math.round(durationMin * 60))
  const [timeLeft, setTimeLeft] = useState(totalSec)

  // Dificultad controla nº de parejas
  const pairsCount = useMemo(() => {
    switch (exercise.difficulty) {
      case 'easy': return 6   // 12 cartas
      case 'medium': return 8 // 16 cartas
      case 'hard': return 10  // 20 cartas
      default: return 6
    }
  }, [exercise.difficulty])

  const ICONS = ['🍎','🍌','🍇','🍉','🍓','🥥','🥝','🍊','🍒','🍐','🥑','🍋','🍑','🍍','🫐','🥕','🌽','🍅','🍆','🥔']

  // crea mazo barajado
  const makeDeck = () => {
    const chosen = ICONS.slice(0, pairsCount)
    const doubled = chosen.flatMap((icon, i) => [
      { id: i * 2,     icon, flipped: false, matched: false },
      { id: i * 2 + 1, icon, flipped: false, matched: false },
    ])
    return shuffle(doubled)
  }

  const [deck, setDeck] = useState<Card[]>(() => makeDeck())
  const [firstPick, setFirstPick] = useState<number | null>(null)
  const [secondPick, setSecondPick] = useState<number | null>(null)
  const [locking, setLocking] = useState(false)
  const [moves, setMoves] = useState(0)
  const [matches, setMatches] = useState(0)

  // timer
  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          window.clearInterval(timer)
          finish(false) // tiempo agotado
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // click carta
  const handleFlip = (idx: number) => {
    if (locking) return
    if (deck[idx].flipped || deck[idx].matched) return

    const next = deck.slice()
    next[idx] = { ...next[idx], flipped: true }
    setDeck(next)

    if (firstPick === null) {
      setFirstPick(idx)
      return
    }
    if (secondPick === null) {
      setSecondPick(idx)
      setMoves(m => m + 1)
      setLocking(true)

      // verificar
      const a = next[firstPick]
      const b = next[idx]
      if (a.icon === b.icon) {
        // match
        setTimeout(() => {
          const matchedDeck = next.map((c, i) =>
            i === firstPick || i === idx ? { ...c, matched: true } : c
          )
          setDeck(matchedDeck)
          setMatches(m => {
            const newMatches = m + 1
            if (newMatches === pairsCount) finish(true)
            return newMatches
          })
          setFirstPick(null)
          setSecondPick(null)
          setLocking(false)
        }, 300)
      } else {
        // no match -> voltear de vuelta
        setTimeout(() => {
          const reverted = next.map((c, i) =>
            i === firstPick || i === idx ? { ...c, flipped: false } : c
          )
          setDeck(reverted)
          setFirstPick(null)
          setSecondPick(null)
          setLocking(false)
        }, 700)
      }
    }
  }

  // terminar
  const finish = (completed: boolean) => {
    const timeSpent = Math.round((Date.now() - startedAtRef.current) / 1000)

    // scoring:
    // base por progreso (pares encontrados)
    const progress = matches / pairsCount
    let score = Math.round(progress * 80)

    // bonus por eficiencia: menos movimientos => mejor
    // “óptimo” ≈ pairsCount movimientos (perfecto); normalizamos contra 2*pairsCount
    const optimal = pairsCount
    const worst = pairsCount * 2
    const efficiency = clamp01(1 - (moves - optimal) / Math.max(1, worst - optimal)) // 1 si moves≈optimal
    const bonus = Math.round(efficiency * 20)

    score = clamp(0, 100, score + (completed ? bonus : Math.max(0, bonus - 5)))
    onComplete(score, timeSpent)
  }

  const reset = () => {
    setDeck(makeDeck())
    setFirstPick(null)
    setSecondPick(null)
    setLocking(false)
    setMoves(0)
    setMatches(0)
    setTimeLeft(totalSec)
    startedAtRef.current = Date.now()
  }

  return (
    <div className="bg-white p-6 rounded-xl border">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          Parejas: <b>{matches}</b> / {pairsCount} · Movimientos: <b>{moves}</b>
        </div>
        <div className="font-mono text-sm px-3 py-1 rounded bg-gray-100">
          {formatTime(timeLeft)}
        </div>
      </div>

      <Board deck={deck} onFlip={handleFlip} />

      <div className="mt-6 flex gap-2">
        <button
          onClick={() => finish(matches === pairsCount)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Terminar
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg border hover:bg-gray-50"
        >
          Reiniciar
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

/* ---------- UI tablero ---------- */
function Board({ deck, onFlip }: { deck: Card[]; onFlip: (i: number) => void }) {
  // grid responsive  (12–20 cartas)
  const cols =
    deck.length <= 12 ? 'grid-cols-4' :
    deck.length <= 16 ? 'grid-cols-4' :
    'grid-cols-5'

  return (
    <div className={`grid ${cols} gap-3 place-items-center`}>
      {deck.map((c, i) => (
        <CardView key={c.id} card={c} onClick={() => onFlip(i)} />
      ))}
    </div>
  )
}

function CardView({ card, onClick }: { card: Card; onClick: () => void }) {
  const common = 'w-16 h-20 sm:w-20 sm:h-24 flex items-center justify-center rounded-xl text-3xl transition'
  if (card.matched) {
    return <div className={`${common} bg-green-50 border border-green-200`}>{card.icon}</div>
  }
  if (card.flipped) {
    return <div className={`${common} bg-white border shadow-sm cursor-default`}>{card.icon}</div>
  }
  return (
    <button
      onClick={onClick}
      className={`${common} bg-indigo-600 text-white hover:bg-indigo-700`}
      aria-label="Carta oculta"
    >
      ?
    </button>
  )
}

/* ---------- helpers ---------- */
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
function clamp(min: number, max: number, v: number) { return Math.max(min, Math.min(max, v)) }
function clamp01(v: number) { return clamp(0, 1, v) }
function formatTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, '0')
  const ss = (s % 60).toString().padStart(2, '0')
  return `${m}:${ss}`
}
