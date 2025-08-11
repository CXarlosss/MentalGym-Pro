'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Tipos
type Activity = {
  id: number
  name: string
  category: 'memoria' | 'atencion' | 'logica' | 'calculo'
  score: number
  date: string // ISO
  durationMin: number
}

const ALL_ACTIVITIES: Activity[] = [
  { id: 1, name: 'Memoria numérica', category: 'memoria', score: 85, date: '2025-08-08T10:12:00Z', durationMin: 5 },
  { id: 2, name: 'Patrones lógicos', category: 'logica', score: 72, date: '2025-08-07T14:35:00Z', durationMin: 7 },
  { id: 3, name: 'Atención visual', category: 'atencion', score: 91, date: '2025-08-06T09:20:00Z', durationMin: 6 },
  { id: 4, name: 'Cálculo rápido', category: 'calculo', score: 64, date: '2025-08-04T18:00:00Z', durationMin: 8 },
  { id: 5, name: 'Memoria de imágenes', category: 'memoria', score: 54, date: '2025-08-03T11:05:00Z', durationMin: 5 },
  { id: 6, name: 'Secuencias lógicas', category: 'logica', score: 78, date: '2025-08-02T16:43:00Z', durationMin: 9 },
  { id: 7, name: 'Foco selectivo', category: 'atencion', score: 88, date: '2025-08-01T08:02:00Z', durationMin: 4 },
  { id: 8, name: 'Operaciones mixtas', category: 'calculo', score: 93, date: '2025-07-31T20:10:00Z', durationMin: 10 },
  { id: 9, name: 'Memoria auditiva', category: 'memoria', score: 41, date: '2025-07-29T12:15:00Z', durationMin: 6 },
  { id: 10, name: 'Búsqueda rápida', category: 'atencion', score: 69, date: '2025-07-28T07:50:00Z', durationMin: 5 },
  // añade más si quieres
]

// Utilidades
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function badge(score: number) {
  if (score >= 80) return 'bg-green-100 text-green-700'
  if (score >= 50) return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

type SortKey = 'date' | 'score' | 'duration' | 'name'

// Página
export default function HistoryPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Si quisieras reforzar protección aquí:
  // useEffect(() => { if (!user) router.replace('/login') }, [user, router])

  // Estado de controles
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'all' | Activity['category']>('all')
  const [minScore, setMinScore] = useState<number>(0)
  const [sortBy, setSortBy] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const pageSize = 8

  // Datos filtrados y ordenados
  const filtered = useMemo(() => {
    let items = [...ALL_ACTIVITIES]

    if (query.trim()) {
      const q = query.toLowerCase()
      items = items.filter(a => a.name.toLowerCase().includes(q))
    }
    if (category !== 'all') {
      items = items.filter(a => a.category === category)
    }
    if (minScore > 0) {
      items = items.filter(a => a.score >= minScore)
    }

    items.sort((a, b) => {
      let cmp = 0
      if (sortBy === 'date') cmp = new Date(a.date).getTime() - new Date(b.date).getTime()
      else if (sortBy === 'score') cmp = a.score - b.score
      else if (sortBy === 'duration') cmp = a.durationMin - b.durationMin
      else if (sortBy === 'name') cmp = a.name.localeCompare(b.name)
      return sortDir === 'asc' ? cmp : -cmp
    })

    return items
  }, [query, category, minScore, sortBy, sortDir])

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = useMemo(() => {
    const from = (page - 1) * pageSize
    return filtered.slice(from, from + pageSize)
  }, [filtered, page])

  // Reset de página al cambiar filtros/orden
  // (opcional; si no lo quieres, quítalo)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => setPage(1), [query, category, minScore, sortBy, sortDir])

  return (
    <main className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Historial de Actividad</h1>
          <p className="text-gray-600">Consulta tus ejercicios recientes y su rendimiento.</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">← Volver al dashboard</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtrar y ordenar</CardTitle>
          <CardDescription>Refina la lista para encontrar sesiones concretas.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar por nombre…"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <select
              value={category}
              onChange={e => setCategory(e.target.value as 'all' | Activity['category'])}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Todas las categorías</option>
              <option value="memoria">Memoria</option>
              <option value="atencion">Atención</option>
              <option value="logica">Lógica</option>
              <option value="calculo">Cálculo</option>
            </select>

            <select
              value={minScore}
              onChange={e => setMinScore(Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={0}>Puntuación mínima: 0%</option>
              <option value={50}>Puntuación mínima: 50%</option>
              <option value={70}>Puntuación mínima: 70%</option>
              <option value={85}>Puntuación mínima: 85%</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortKey)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="date">Ordenar por fecha</option>
              <option value="score">Ordenar por puntuación</option>
              <option value="duration">Ordenar por duración</option>
              <option value="name">Ordenar por nombre</option>
            </select>

            <select
              value={sortDir}
              onChange={e => setSortDir(e.target.value as 'asc' | 'desc')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="desc">Descendente</option>
              <option value="asc">Ascendente</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sesiones</CardTitle>
          <CardDescription>
            {filtered.length} resultados • Página {page} de {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Nombre</th>
                  <th className="py-2 pr-4">Categoría</th>
                  <th className="py-2 pr-4">Puntuación</th>
                  <th className="py-2 pr-4">Duración</th>
                  <th className="py-2 pr-4">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(item => (
                  <tr key={item.id} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium text-gray-900">{item.name}</td>
                    <td className="py-3 pr-4 capitalize text-gray-700">{item.category}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${badge(item.score)}`}>
                        {item.score}%
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-700">{item.durationMin} min</td>
                    <td className="py-3 pr-4 text-gray-700">{formatDate(item.date)}</td>
                  </tr>
                ))}

                {paged.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No hay resultados con los filtros actuales.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Mostrando {(page - 1) * pageSize + 1}
              {'–'}
              {Math.min(page * pageSize, filtered.length)} de {filtered.length}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <Button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
