// src/components/layout/WelcomeBanner.tsx
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

type Props = {
  name?: string
  streak?: number
  totalExercises?: number
  averageScore?: number
  recommendedId?: string | null
  tip?: string
}

export default function WelcomeBanner({
  name = '',
  streak = 0,
  totalExercises,
  averageScore,
  recommendedId,
  tip,
}: Props) {
  const greeting = getGreeting()
  const message =
    streak >= 7
      ? `Racha de ${streak} días. ¡Bestia!`
      : streak >= 3
      ? `Llevas ${streak} días seguidos. Buen ritmo.`
      : 'Suma hoy un minientreno mental.'

  return (
    <div className="bg-transparent px-3 py-3 md:px-4 md:py-4">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mx-auto w-full max-w-screen-xl rounded-2xl border border-gray-100 bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 shadow-sm md:p-5"
      >
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {/* IZQUIERDA (más ancha) */}
          <div className="col-span-12 md:col-span-8 flex flex-col gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                {greeting}, {name || 'atleta'} 👋
              </h1>
              <p className="text-gray-700 mt-1 text-sm md:text-base">{message}</p>
              {tip && <p className="text-xs md:text-sm text-indigo-700 font-medium mt-1">💡 {tip}</p>}
            </div>

            {/* KPIs compactos */}
            <div className="flex flex-wrap gap-1.5">
              <Chip label="Racha" value={`${streak}d`} />
              {typeof totalExercises !== 'undefined' && <Chip label="Ejercicios" value={String(totalExercises)} />}
              {typeof averageScore !== 'undefined' && <Chip label="Media" value={`${averageScore}/100`} />}
            </div>

            {/* CTAs compactos */}
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href={
                  recommendedId
                    ? `/dashboard/retosmentales/${recommendedId}`
                    : '/dashboard/retosmentales'
                }
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                {recommendedId ? '⚡ Empezar recomendado' : '🧩 Ver retos mentales'}
              </Link>
              <Link
                href="/dashboard/alimentacion"
                className="inline-flex items-center justify-center rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
              >
                🥗 Hábitos saludables
              </Link>
              <Link
                href="/dashboard/actividad"
                className="inline-flex items-center justify-center rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
              >
                👣 Actividad
              </Link>
            </div>
          </div>

          {/* DERECHA (tarjeta más pequeña) */}
          <div className="col-span-12 md:col-span-4 relative">
            <div className="absolute -top-2 -right-2 h-16 w-16 rounded-full bg-indigo-200 blur-2xl opacity-50 pointer-events-none" />
            <div className="relative z-10 h-full rounded-xl border border-indigo-200 bg-white p-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-xs text-gray-500 font-medium">Objetivo del día</div>
                <div className="mt-1 text-lg font-semibold text-gray-900">10 min de foco</div>
                <p className="mt-1 text-xs text-gray-600">
                  2 sesiones cortas mejor que 1 larga.
                </p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <MiniStat emoji="🧠" label="Retos hoy" value="1–2" />
                <MiniStat emoji="💧" label="Agua" value="500 ml" />
                <MiniStat emoji="😴" label="Descanso" value="7–8 h" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-1">
      <span className="text-[10px] md:text-xs text-indigo-700 font-medium">{label}</span>
      <span className="text-xs md:text-sm font-semibold text-indigo-900">{value}</span>
    </div>
  )
}

function MiniStat({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-xl">{emoji}</div>
      <div className="text-[10px] text-gray-500 mt-0.5">{label}</div>
      <div className="text-xs font-semibold">{value}</div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h >= 6 && h < 12) return 'Buenos días'
  if (h >= 12 && h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}
