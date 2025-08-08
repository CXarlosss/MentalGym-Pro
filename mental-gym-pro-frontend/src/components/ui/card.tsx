import { ReactNode } from "react"

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white shadow-md rounded-xl overflow-hidden border border-gray-200 ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children }: { children: ReactNode }) {
  return (
    <div className="p-4 border-b border-gray-200">
      {children}
    </div>
  )
}

export function CardTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-lg font-semibold text-gray-900">{children}</h2>
  )
}

export function CardDescription({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1 text-sm text-gray-500">{children}</p>
  )
}

export function CardContent({ children }: { children: ReactNode }) {
  return (
    <div className="p-4 space-y-2">
      {children}
    </div>
  )
}