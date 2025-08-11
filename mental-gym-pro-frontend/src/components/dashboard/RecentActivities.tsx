// src/components/dashboard/RecentActivities.tsx
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

type Activity = {
  id: number
  name: string
  score: number
  date: string
}

function badgeClasses(score: number) {
  if (score >= 80) return 'bg-green-100 text-green-800'
  if (score >= 50) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

export default function RecentActivities({ activities }: { activities: Activity[] }) {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg"
          aria-label={`Actividad ${activity.name} con puntuación ${activity.score}`}
        >
          <div>
            <p className="font-medium">{activity.name}</p>
            <p className="text-sm text-gray-500">
              {new Date(activity.date).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
              })}
            </p>
          </div>

          <span className={`px-2 py-1 text-xs rounded-full ${badgeClasses(activity.score)}`}>
            {activity.score}%
          </span>
        </div>
      ))}

      <div className="mt-4">
        <Link href="/dashboard/historial">
          <Button variant="link" className="text-indigo-600 p-0">
            Ver historial completo →
          </Button>
        </Link>
      </div>
    </div>
  )
}
