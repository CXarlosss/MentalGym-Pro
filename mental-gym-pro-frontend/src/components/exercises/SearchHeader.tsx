// src/components/exercises/SearchHeader.tsx
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function SearchHeader({
  searchQuery,
  onSearchChange
}: {
  searchQuery: string
  onSearchChange: (value: string) => void
}) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2">Ejercicios Mentales</h1>
      <p className="text-gray-600 mb-6">
        Entrena tu mente con estos ejercicios científicos
      </p>
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar ejercicios..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>
  )
}