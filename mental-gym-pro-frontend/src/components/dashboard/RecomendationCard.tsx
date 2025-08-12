'use client'
import Link from 'next/link'

export default function RecommendationCard({ recommendedId }: { recommendedId?: string | null }) {
  return (
    <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
      <h2 className="text-xl font-bold mb-2">Recomendación del Día</h2>
      <p className="text-gray-700 mb-4">
        Basado en tu actividad reciente, te recomendamos ejercicios de memoria espacial.
      </p>
      {recommendedId ? (
        <Link
          href={`/dashboard/retosmentales/${recommendedId}`}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors inline-block"
        >
          Empezar ejercicio recomendado
        </Link>
      ) : (
        <button disabled className="bg-gray-300 text-white px-4 py-2 rounded-lg cursor-not-allowed inline-block">
          No hay recomendación disponible
        </button>
      )}
    </div>
  )
}
