// src/types/index.ts
export interface BaseEntity {
  _id: string
  createdAt: string
  updatedAt: string
}

export interface User extends BaseEntity {
  name: string
  email: string
  password?: string
  avatar?: string
}

// Usamos las categorías de tu API mock (memoria, logica, atencion, calculo)
export type ExerciseCategory = 'memoria' | 'logica' | 'atencion' | 'calculo' | 'velocidad' | 'flexibilidad'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Exercise extends BaseEntity {
  title: string
  description: string
  category: ExerciseCategory
  difficulty: Difficulty
  duration: number // en minutos
  icon?: string
  instructions: string[] // Añadido para coincidir con mock
}

// src/types/index.ts
export interface Challenge extends BaseEntity {
  title: string
  description: string
  objective: string
  durationDays: number
  isCompleted: boolean
  exercises: string[] // IDs de ejercicios
  reward?: {
    points: number
    badge?: string
  }
  // Propiedades adicionales para compatibilidad con API mock
  expiresAt?: string
  participants?: number
}
export interface Progress extends BaseEntity {
  userId: string
  exerciseId: string
  challengeId?: string
  score: number
  timeSpent: number // en segundos
  details?: Record<string, unknown>
}

export interface ExerciseResult {
  _id: string
  sessionId: string
  score: number
  timeSpent: number // en segundos
  createdAt: string
  metadata: Record<string, unknown>
}

// Tipos para el dashboard
export interface UserProgress {
  weeklyData: number[]
  streak: number
  totalExercises: number
  averageScore: number
}

export type DashboardStats = UserProgress