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

export interface Exercise extends BaseEntity {
  title: string
  description: string
  category: 'memoria' | 'lógica' | 'atención' | 'velocidad' | 'flexibilidad'
  difficulty: 'easy' | 'medium' | 'hard'
  duration?: number // en minutos
  icon?: string
}

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
}

export interface Progress extends BaseEntity {
  userId: string
  exerciseId: string
  challengeId?: string
  score: number
  timeSpent: number // en segundos
  details?: Record<string, unknown>
}

// Tipos para el dashboard
export type DashboardStats = {
  weeklyProgress: number[]
  streak: number
  totalExercises: number
  averageScore: number
  level?: number
  nextLevelProgress?: number
}
// src/types/index.ts
export interface ExerciseResult {
  _id: string
  sessionId: string
  score: number
  timeSpent: number // en segundos
  createdAt: string
  metadata: Record<string, unknown>
}

export type Difficulty = 'easy' | 'medium' | 'hard'