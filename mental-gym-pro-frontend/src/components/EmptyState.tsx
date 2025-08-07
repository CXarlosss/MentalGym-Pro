// src/components/EmptyState.tsx
import { Button } from './ui/button'

interface EmptyStateProps {
  title: string
  description: string
  actionText?: string
  onAction?: () => void
}

export default function EmptyState({
  title,
  description,
  actionText,
  onAction
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-500 mb-4">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} className="mt-2">
          {actionText}
        </Button>
      )}
    </div>
  )
}
