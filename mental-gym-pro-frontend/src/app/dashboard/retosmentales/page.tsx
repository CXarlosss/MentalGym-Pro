'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { fetchExercises, fetchExerciseCategories } from '@/lib/api/exercises'
import ExerciseCard from '@/components/cards/ExerciseCard'
import FilterPanel from '@/components/exercises/FilterPanel'
import SearchHeader from '@/components/exercises/SearchHeader'
import LoadingSkeleton from '@/components/exercises/LoadingSkeleton'
import EmptyState from '@/components/EmptyState'
import type { Exercise } from '@/types'

type SortKey = 'recent' | 'difficulty-asc' | 'difficulty-desc'
type Filters = {
  searchQuery: string
  category: string
  difficulty: string
  sortBy: SortKey
}

const PAGE_SIZE = 9
const AUTOLOAD = true // ponlo en false si prefieres solo botón "Cargar más"

export default function RetosMentalesPage() {
  const { user } = useAuth()

  const [exercises, setExercises] = useState<Exercise[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filters, setFilters] = useState<Filters>({
    searchQuery: '',
    category: '',
    difficulty: '',
    sortBy: 'recent',
  })

  // paginación
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // Carga inicial
  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const [exData, catData] = await Promise.all([
          fetchExercises(),
          fetchExerciseCategories(),
        ])
        setExercises(exData)
        setCategories(catData)
      } catch (e) {
        console.error(e)
        setError('Error al cargar los ejercicios')
      } finally {
        setLoading(false)
      }
    }
    if (user) load()
  }, [user])

  // Filtros + orden
  const filtered = useMemo(() => {
    let result = [...exercises]

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase()
      result = result.filter(
        e =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
      )
    }
    if (filters.category) {
      result = result.filter(e => e.category === filters.category)
    }
    if (filters.difficulty) {
      result = result.filter(e => e.difficulty === filters.difficulty)
    }

    const level = (d: string) => (d === 'easy' ? 1 : d === 'medium' ? 2 : d === 'hard' ? 3 : 0)
    switch (filters.sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'difficulty-asc':
        result.sort((a, b) => level(a.difficulty) - level(b.difficulty))
        break
      case 'difficulty-desc':
        result.sort((a, b) => level(b.difficulty) - level(a.difficulty))
        break
    }
    return result
  }, [exercises, filters])

  // Reset de página cuando cambian filtros
  useEffect(() => { setPage(1) }, [filters])

  // Lista paginada
  const visible = useMemo(() => filtered.slice(0, PAGE_SIZE * page), [filtered, page])

  // hasMore
  useEffect(() => {
    setHasMore(visible.length < filtered.length)
  }, [visible.length, filtered.length])

  // Infinite scroll
  useEffect(() => {
    if (!AUTOLOAD) return
    const node = sentinelRef.current
    if (!node) return
    const io = new IntersectionObserver(entries => {
      const first = entries[0]
      if (first.isIntersecting && hasMore && !loading) {
        setPage(p => p + 1)
      }
    }, { rootMargin: '400px' })
    io.observe(node)
    return () => io.disconnect()
  }, [hasMore, loading])

  const handleFilterChange = (partial: Partial<Filters>) => setFilters(prev => ({ ...prev, ...partial }))

  if (loading) return <LoadingSkeleton />
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6  bg-gradient-to-br from-indigo-50 to-gray-50 min-h-screen">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Retos Mentales</h1>
          <p className="text-gray-600">Explora ejercicios genéricos de memoria, atención, cálculo y lógica.</p>
        </div>

        {/* Buscador */}
        <SearchHeader
          searchQuery={filters.searchQuery}
          onSearchChange={value => handleFilterChange({ searchQuery: value })}
        />

        <div className="flex flex-col md:flex-row gap-8 mt-6">
          {/* Filtros */}
          <div className="md:w-1/4">
            <FilterPanel
              categories={categories}
              selectedCategory={filters.category}
              selectedDifficulty={filters.difficulty}
              sortBy={filters.sortBy}
              onCategoryChange={category => handleFilterChange({ category })}
              onDifficultyChange={difficulty => handleFilterChange({ difficulty })}
              onSortChange={sortBy => handleFilterChange({ sortBy: sortBy as SortKey })}
            />
          </div>

          {/* Grid + paginación */}
          <div className="md:w-3/4">
            {visible.length ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visible.map(ex => (
                    <ExerciseCard key={ex._id} exercise={ex} />
                  ))}
                </div>

                {/* Botón cargar más (fallback / accesible) */}
                {hasMore && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={() => setPage(p => p + 1)}
                      className="px-4 py-2 bg-white border rounded-lg shadow-sm hover:shadow transition"
                    >
                      Cargar más
                    </button>
                  </div>
                )}

                {/* Sentinel para autoload */}
                <div ref={sentinelRef} className="h-1" />
              </>
            ) : (
              <EmptyState
                title="No se encontraron ejercicios"
                description="Prueba a ajustar los filtros o limpiar la búsqueda"
                actionText="Restablecer filtros"
                onAction={() =>
                  setFilters({ searchQuery: '', category: '', difficulty: '', sortBy: 'recent' })
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
