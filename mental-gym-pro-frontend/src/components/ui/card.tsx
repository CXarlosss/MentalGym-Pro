// src/components/ui/card.tsx
import { ReactNode } from "react"

type DivProps = React.HTMLAttributes<HTMLDivElement>
type H2Props = React.HTMLAttributes<HTMLHeadingElement>
type PProps  = React.HTMLAttributes<HTMLParagraphElement>

export function Card({ children, className = "", ...rest }: { children: ReactNode } & DivProps) {
  return (
    <div
      {...rest}
      className={`bg-white shadow-md rounded-xl overflow-hidden border border-gray-200 ${className}`}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = "", ...rest }: { children: ReactNode } & DivProps) {
  return (
    <div {...rest} className={`p-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = "", ...rest }: { children: ReactNode } & H2Props) {
  return (
    <h2 {...rest} className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h2>
  )
}

export function CardDescription({ children, className = "", ...rest }: { children: ReactNode } & PProps) {
  return (
    <p {...rest} className={`mt-1 text-sm text-gray-500 ${className}`}>
      {children}
    </p>
  )
}

export function CardContent({ children, className = "", ...rest }: { children: ReactNode } & DivProps) {
  return (
    <div {...rest} className={`p-4 space-y-2 ${className}`}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = "", ...rest }: { children: ReactNode } & DivProps) {
  return (
    <div {...rest} className={`p-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  )
}