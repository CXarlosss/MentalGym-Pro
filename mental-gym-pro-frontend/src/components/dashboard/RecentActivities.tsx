// src/components/dashboard/RecentActivities.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type Activity = {
  id: number
  name: string
  score: number
  date: string
}

export default function RecentActivities({ activities }: { activities: Activity[] }) {
  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <div key={activity.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">{activity.name}</p>
            <p className="text-sm text-gray-500">
              {new Date(activity.date).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short'
              })}
            </p>
          </div>
          <div className="flex items-center">
            <span className={`px-2 py-1 text-xs rounded-full ${
              activity.score >= 80 ? 'bg-green-100 text-green-800' :
              activity.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {activity.score}%
            </span>
          </div>
        </div>
      ))}
      <Link href="/dashboard/historial" className="block mt-4">
        <Button variant="link" className="text-indigo-600 p-0">
          Ver historial completo →
        </Button>
      </Link>
    </div>
  )
}