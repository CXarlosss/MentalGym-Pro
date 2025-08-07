// src/components/StatsCard.tsx
export default function StatsCard({
  title,
  value,
  icon,
  description,
  isPercentage = false
}: {
  title: string
  value: number
  icon: string
  description: string
  isPercentage?: boolean
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-1">
            {isPercentage ? `${value}%` : value}
          </p>
          <p className="text-gray-400 text-sm mt-1">{description}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )
}