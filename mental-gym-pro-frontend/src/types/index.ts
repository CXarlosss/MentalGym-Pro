// src/types/index.ts

export interface Exercise {
  _id: string;
  title: string;
  description: string;
  category: 'memoria' | 'logica' | 'atencion' | 'calculo';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  instructions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseResult {
  _id: string;
  sessionId: string;
  score: number;
  timeSpent: number;
  createdAt: string;
  metadata: Record<string, unknown>;
}

export interface UserProgress {
  weeklyData: number[];
  streak: number;
  totalExercises: number;
  averageScore: number;
}

export interface Challenge {
  _id: string;
  title: string;
  description: string;
  expiresAt: string;
  participants: number;
}

export interface DashboardStats {
  weeklyProgress: number[];
  streak: number;
  totalExercises: number;
  averageScore: number;
}