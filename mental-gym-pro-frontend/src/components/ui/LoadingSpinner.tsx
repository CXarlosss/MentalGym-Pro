// src/components/ui/LoadingSpinner.tsx
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const spinnerVariants = cva(
  "animate-spin inline-block text-indigo-600",
  {
    variants: {
      variant: {
        default: "",
        primary: "text-indigo-600",
        destructive: "text-red-600",
        success: "text-green-600",
        warning: "text-yellow-500",
      },
      size: {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12",
        xl: "h-16 w-16",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

interface LoadingSpinnerProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  fullScreen?: boolean
  text?: string
}

export function LoadingSpinner({
  className,
  variant,
  size,
  fullScreen = false,
  text,
  ...props
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        fullScreen
          ? "fixed inset-0 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm z-50"
          : "inline-flex flex-col items-center gap-2",
        className
      )}
      {...props}
    >
      <svg
        className={cn(spinnerVariants({ variant, size, className }))}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
      <span className="sr-only">Cargando...</span>
    </div>
  )
}