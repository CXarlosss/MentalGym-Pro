'use client'
import Section from '@/components/ui/Section'
import ChallengeItem from '@/components/exercises/ChallengeItem'
import type { Challenge } from '@/types'

export default function ChallengesSection({ items }: { items: Challenge[] }) {
  return (
    <Section title="Tus Desafíos Activos" right={<button className="text-indigo-600 hover:text-indigo-800">Ver todos →</button>}>
      {items.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(ch => <ChallengeItem key={ch._id} challenge={ch} />)}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No tienes desafíos activos actualmente</p>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Explorar desafíos
          </button>
        </div>
      )}
    </Section>
  )
}
