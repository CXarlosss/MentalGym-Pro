'use client'
import Link from 'next/link'

export default function QuickLaunchGrid({ recommendedId }: { recommendedId?: string | null }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
      {[
        { href: '/dashboard/actividad', icon: '👣', title: 'Actividad', sub: 'Pasos & semana' },
        { href: '/dashboard/alimentacion', icon: '🥗', title: 'Hábitos saludables', sub: 'Registro & metas' },
        { href: '/dashboard/gym', icon: '🏋️‍♂️', title: 'Gym', sub: 'Rutinas & sets' },
        { href: '/dashboard/historial', icon: '📜', title: 'Historial', sub: 'Sesiones & progreso' },
        { href: '/dashboard/retosmentales', icon: '🧩', title: 'Retos mentales', sub: 'Explorar ejercicios' },
      ].map(card => (
        <Link key={card.href} href={card.href} className="bg-white p-4 rounded-xl shadow-sm border hover:shadow transition">
          <div className="text-2xl mb-2">{card.icon}</div>
          <div className="font-semibold">{card.title}</div>
          <div className="text-xs text-gray-500">{card.sub}</div>
        </Link>
      ))}

      {recommendedId ? (
        <Link
          href={`/dashboard/retosmentales/${recommendedId}`}
          className="bg-indigo-600 text-white p-4 rounded-xl shadow hover:bg-indigo-700 transition"
        >
          <div className="text-2xl mb-2">⚡</div>
          <div className="font-semibold">Ejercicio recomendado</div>
          <div className="text-xs opacity-90">Ir ahora</div>
        </Link>
      ) : (
        <div className="bg-gray-100 p-4 rounded-xl text-gray-400">
          <div className="text-2xl mb-2">⏳</div>
          <div className="font-semibold">Ejercicio recomendado</div>
          <div className="text-xs">Sin ejercicios disponibles</div>
        </div>
      )}
    </div>
  )
}
