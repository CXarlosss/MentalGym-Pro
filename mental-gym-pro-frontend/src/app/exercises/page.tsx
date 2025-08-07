// src/app/exercises/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { fetchExercises, fetchExerciseCategories } from '@/lib/api'
import ExerciseCard from '@/components/cards/ExerciseCard'
import FilterPanel from '@/components/exercises/FilterPanel'
import SearchHeader from '@/components/exercises/SearchHeader'
import LoadingSkeleton from '@/components/exercises/LoadingSkeleton'
import EmptyState from '@/components/EmptyState'

export default function ExercisesPage() {
  const { user } = useAuth()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [filters, setFilters] = useState({
    searchQuery: '',
    category: '',
    difficulty: '',
    sortBy: 'recent'
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [exercisesData, categoriesData] = await Promise.all([
          fetchExercises(),
          fetchExerciseCategories()
        ])
        setExercises(exercisesData)
        setFilteredExercises(exercisesData)
        setCategories(categoriesData)
      } catch (err) {
        setError('Error al cargar los ejercicios')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (user) loadData()
  }, [user])

  useEffect(() => {
    applyFilters()
  }, [filters, exercises])

  const applyFilters = () => {
    let result = [...exercises]

    // Filtro por búsqueda
    if (filters.searchQuery) {
      result = result.filter(exercise =>
        exercise.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        exercise.description.toLowerCase().includes(filters.searchQuery.toLowerCase())
      )
    }

    // Filtro por categoría
    if (filters.category) {
      result = result.filter(exercise => 
        exercise.category === filters.category
      )
    }

    // Filtro por dificultad
    if (filters.difficulty) {
      result = result.filter(exercise => 
        exercise.difficulty === filters.difficulty
      )
    }

    // Ordenamiento
    result = sortExercises(result, filters.sortBy)

    setFilteredExercises(result)
  }

  const sortExercises = (exercises: Exercise[], sortBy: string) => {
    const sorted = [...exercises]
    switch (sortBy) {
      case 'recent':
        return sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      case 'difficulty-asc':
        return sorted.sort((a, b) => 
          difficultyToNumber(a.difficulty) - difficultyToNumber(b.difficulty)
        )
      case 'difficulty-desc':
        return sorted.sort((a, b) => 
          difficultyToNumber(b.difficulty) - difficultyToNumber(a.difficulty)
        )
      default:
        return sorted
    }
  }

  const difficultyToNumber = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 1
      case 'medium': return 2
      case 'hard': return 3
      default: return 0
    }
  }

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  if (loading) return <LoadingSkeleton />
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <SearchHeader 
          searchQuery={filters.searchQuery}
          onSearchChange={(value) => handleFilterChange({ searchQuery: value })}
        />

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4">
            <FilterPanel
              categories={categories}
              selectedCategory={filters.category}
              selectedDifficulty={filters.difficulty}
              sortBy={filters.sortBy}
              onCategoryChange={(category) => handleFilterChange({ category })}
              onDifficultyChange={(difficulty) => handleFilterChange({ difficulty })}
              onSortChange={(sortBy) => handleFilterChange({ sortBy })}
            />
          </div>

          <div className="md:w-3/4">
            {filteredExercises.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExercises.map(exercise => (
                  <ExerciseCard 
                    key={exercise._id} 
                    exercise={exercise} 
                    variant="detailed"
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No se encontraron ejercicios"
                description="Intenta ajustar tus filtros de búsqueda"
                actionText="Restablecer filtros"
                onAction={() => setFilters({
                  searchQuery: '',
                  category: '',
                  difficulty: '',
                  sortBy: 'recent'
                })}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}