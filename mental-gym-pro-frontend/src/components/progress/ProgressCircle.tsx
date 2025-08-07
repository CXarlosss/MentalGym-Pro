// src/components/ProgressCircle.tsx
export default function ProgressCircle({
  percentage,
  size = 100,
  strokeWidth = 8,
  className = ''
}: {
  percentage: number
  size?: number
  strokeWidth?: number
  className?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const getColor = () => {
    if (percentage >= 80) return 'text-green-500'
    if (percentage >= 50) return 'text-blue-500'
    return 'text-orange-500'
  }

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg height={size} width={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="text-gray-200"
          stroke="currentColor"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className={`${getColor()}`}
          stroke="currentColor"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-xl font-bold">
        {percentage}%
      </span>
    </div>
  )
}