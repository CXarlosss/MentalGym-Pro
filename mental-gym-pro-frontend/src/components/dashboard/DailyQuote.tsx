// src/components/dashboard/DailyQuote.tsx
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

type Quote = { text: string; author: string }

const QUOTES: Quote[] = [
  { text: "La motivación te impulsa, pero el hábito te mantiene en marcha.", author: "Jim Ryun" },
  { text: "El cerebro no es un vaso por llenar, sino una lámpara por encender.", author: "Plutarco" },
  { text: "La disciplina es el puente entre las metas y los logros.", author: "Jim Rohn" },
]

// Día del año (0–365) para que la selección sea determinista por día
function getDayOfYear(d = new Date()) {
  const start = new Date(d.getFullYear(), 0, 0)
  const diff = d.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

export default function DailyQuote() {
  // Índice determinista por día
  const defaultIndex = useMemo(() => getDayOfYear() % QUOTES.length, [])
  const [index, setIndex] = useState(defaultIndex)
  const quote = QUOTES[index]

  const handleNext = () => {
    // rota a la siguiente frase
    setIndex((prev) => (prev + 1) % QUOTES.length)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`“${quote.text}” — ${quote.author}`)
      // feedback mínimo y no intrusivo
      // (si usas toast, puedes disparar aquí un toast.success)
      console.log("Frase copiada al portapapeles")
    } catch {
      console.log("No se pudo copiar la frase")
    }
  }

  const formattedDate = useMemo(
    () =>
      new Date().toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    []
  )

  return (
    <Card className="h-full border border-gray-200/70 bg-white">
      <CardContent className="p-6 h-full flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl leading-none">💡</span>
            <h3 className="text-sm font-semibold tracking-wide text-gray-700 uppercase">
              Frase del día
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-lg px-3 py-1.5 text-xs font-medium border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition"
              aria-label="Copiar frase"
            >
              Copiar
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="rounded-lg px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] transition"
              aria-label="Nueva frase"
              title="Mostrar otra frase"
            >
              Nueva
            </button>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="flex-1 flex items-center justify-center">
          <figure className="max-w-2xl text-center">
            <div className="mx-auto mb-4 h-1 w-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
            <blockquote className="text-xl md:text-2xl leading-relaxed text-gray-800 italic">
              &ldquo;{quote.text}&rdquo;
            </blockquote>
            <figcaption className="mt-4 text-sm text-gray-500">
              — {quote.author}
            </figcaption>
          </figure>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-400 text-center">
          {formattedDate}
        </p>
      </CardContent>
    </Card>
  )
}
