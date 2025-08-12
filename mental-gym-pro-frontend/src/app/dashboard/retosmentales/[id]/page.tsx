'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { fetchExercises, fetchExerciseCategories } from '@/lib/api'
import ExerciseCard from '@/components/cards/ExerciseCard'
import FilterPanel from '@/components/exercises/FilterPanel'
import SearchHeader from '@/components/exercises/SearchHeader'
import LoadingSkeleton from '@/components/exercises/LoadingSkeleton'
import EmptyState from '@/components/EmptyState'
import type { Exercise } from '@/types'

// /dashboard/retosmentales -> Listado con búsqueda + filtros
export default function RetosMentalesPage() {
  const { user } = useAuth()

  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [filters, setFilters] = useState({
    searchQuery: '',
    category: '',
    difficulty: '',
    sortBy: 'recent' as 'recent' | 'difficulty-asc' | 'difficulty-desc',
  })

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const [exercisesData, categoriesData] = await Promise.all([
          fetchExercises(),
          fetchExerciseCategories(),
        ])
        setExercises(exercisesData)
        setCategories(categoriesData)
      } catch (err) {
        console.error(err)
        setError('Error al cargar los ejercicios')
      } finally {
        setLoading(false)
      }
    }
    if (user) load()
  }, [user])

  const filtered = useMemo(() => {
    let result = [...exercises]

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase()
      result = result.filter(
        (e) => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q),
      )
    }

    if (filters.category) {
      result = result.filter((e) => e.category === filters.category)
    }

    if (filters.difficulty) {
      result = result.filter((e) => e.difficulty === filters.difficulty)
    }

    const difficultyToNumber = (d: string) => (d === 'easy' ? 1 : d === 'medium' ? 2 : d === 'hard' ? 3 : 0)
    switch (filters.sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'difficulty-asc':
        result.sort((a, b) => difficultyToNumber(a.difficulty) - difficultyToNumber(b.difficulty))
        break
      case 'difficulty-desc':
        result.sort((a, b) => difficultyToNumber(b.difficulty) - difficultyToNumber(a.difficulty))
        break
    }

    return result
  }, [exercises, filters])

  const handleFilterChange = (partial: Partial<typeof filters>) => setFilters((prev) => ({ ...prev, ...partial }))

  if (loading) return <LoadingSkeleton />
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Retos Mentales</h1>
          <p className="text-gray-600">Explora y filtra ejercicios por categoría y dificultad.</p>
        </div>

        {/* Buscador */}
        <SearchHeader
          searchQuery={filters.searchQuery}
          onSearchChange={(value) => handleFilterChange({ searchQuery: value })}
        />

        <div className="flex flex-col md:flex-row gap-8 mt-6">
          {/* Filtros */}
          <div className="md:w-1/4">
            <FilterPanel
              categories={categories}
              selectedCategory={filters.category}
              selectedDifficulty={filters.difficulty}
              sortBy={filters.sortBy}
              onCategoryChange={(category) => handleFilterChange({ category })}
              onDifficultyChange={(difficulty) => handleFilterChange({ difficulty })}
              onSortChange={(sortBy) => handleFilterChange({ sortBy: sortBy as typeof filters['sortBy'] })}
            />
          </div>

          {/* Grid */}
          <div className="md:w-3/4">
            {filtered.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((ex) => (
                  <ExerciseCard key={ex._id} exercise={ex} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No se encontraron ejercicios"
                description="Intenta ajustar los filtros o limpiar la búsqueda"
                actionText="Restablecer filtros"
                onAction={() => setFilters({ searchQuery: '', category: '', difficulty: '', sortBy: 'recent' })}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
