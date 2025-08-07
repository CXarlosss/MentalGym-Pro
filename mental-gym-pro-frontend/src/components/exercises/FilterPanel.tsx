// src/components/exercises/FilterPanel.tsx
import { Difficulty } from '@/types'

type FilterPanelProps = {
  categories: string[]
  selectedCategory: string
  selectedDifficulty: string
  sortBy: string
  onCategoryChange: (category: string) => void
  onDifficultyChange: (difficulty: string) => void
  onSortChange: (sortBy: string) => void
}

const difficulties: Difficulty[] = ['easy', 'medium', 'hard']
const sortOptions = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'difficulty-asc', label: 'Dificultad (ascendente)' },
  { value: 'difficulty-desc', label: 'Dificultad (descendente)' }
]

export default function FilterPanel({
  categories,
  selectedCategory,
  selectedDifficulty,
  sortBy,
  onCategoryChange,
  onDifficultyChange,
  onSortChange
}: FilterPanelProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
      <div className="space-y-6">
        {/* Filtro por Categoría */}
        <div>
          <h3 className="font-medium mb-3">Categorías</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === ''}
                onChange={() => onCategoryChange('')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span>Todas</span>
            </label>
            {categories.map(category => (
              <label key={category} className="flex items-center space-x-2 capitalize">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === category}
                  onChange={() => onCategoryChange(category)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Filtro por Dificultad */}
        <div>
          <h3 className="font-medium mb-3">Dificultad</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="difficulty"
                checked={selectedDifficulty === ''}
                onChange={() => onDifficultyChange('')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span>Todas</span>
            </label>
            {difficulties.map(difficulty => (
              <label key={difficulty} className="flex items-center space-x-2 capitalize">
                <input
                  type="radio"
                  name="difficulty"
                  checked={selectedDifficulty === difficulty}
                  onChange={() => onDifficultyChange(difficulty)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>
                  {difficulty === 'easy' ? 'Fácil' : 
                   difficulty === 'medium' ? 'Medio' : 'Difícil'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Ordenamiento */}
        <div>
          <h3 className="font-medium mb-3">Ordenar por</h3>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}