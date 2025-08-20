// src/types/index.ts

// --- Entidades Base ---
export interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

// --- Usuario ---
export interface User extends BaseEntity {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
}

// --- Sesiones de Ejercicio ---
export interface ExerciseSession {
  _id: string;
  user: string;
  exercise: { _id: string; name: string; muscleGroup: string };
  score: number;
  durationMin: number;
  playedAt: string;
  createdAt: string;
  updatedAt: string;
}

// --- Tipos de Ejercicios ---
export type ExerciseCategory =
  | 'memoria'
  | 'logica'
  | 'atencion'
  | 'calculo'
  | 'velocidad'
  | 'flexibilidad';
export type Difficulty = 'easy' | 'medium' | 'hard';

export type ExerciseEngine =
  | 'reaction-speed'
  | 'memory-pairs'
  | 'logic-seq'
  | 'attention-selective'
  | 'mental-math'
  | 'cognitive-flex';

export interface Exercise extends BaseEntity {
  slug: string; // Añadido de la corrección anterior
  title: string;
  description: string;
  category: ExerciseCategory;
  difficulty: Difficulty;
  duration: number; // en minutos
  icon?: string;
  instructions: string[];
  engine: ExerciseEngine; // Hecho obligatorio para que coincida con tu mock
}

// --- Retos (Challenges) ---
export interface Challenge extends BaseEntity {
  title: string;
  description: string;
  objective: string;
  durationDays: number;
  isCompleted: boolean;
  exercises: string[]; // IDs de ejercicios
  reward?: {
    points: number;
    badge?: string;
  };
  expiresAt?: string;
  participants?: number;
}

// --- Progreso del Usuario ---
export interface Progress extends BaseEntity {
  userId: string;
  exerciseId: string;
  challengeId?: string;
  score: number;
  timeSpent: number; // en segundos
  details?: Record<string, unknown>;
}

// --- Resultado de Ejercicio (API) ---
export interface ExerciseResult {
  _id: string;
  sessionId: string;
  score: number;
  timeSpent: number; // en segundos
  createdAt: string;
  metadata: Record<string, unknown>;
}

// --- Tipos para el Dashboard ---
export interface UserProgress {
  weeklyData: number[];
  streak: number;
  totalExercises: number;
  averageScore: number;
}

export interface ActivityEntry {
  _id: string;
  date: string; // YYYY-MM-DD (día local)
  steps: number;
  minutes?: number; // opcional: minutos de actividad
  calories?: number; // opcional
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyActivitySummary {
  totalSteps: number;
  avgSteps: number;
  bestDay: { date: string; steps: number } | null;
  streak: number; // días consecutivos con registro (>0 pasos)
  last7Days: Array<{ date: string; steps: number }>;
}

export type DashboardStats = UserProgress;

// --- Fuerza ---
export type LiftTag =
  | 'pecho'
  | 'espalda'
  | 'pierna'
  | 'hombro'
  | 'brazo'
  | 'core'
  | 'tirón'
  | 'empuje'
  | 'cuádriceps'
  | 'isquios'
  | 'glúteo'
  | 'trapecio';

export type LiftSet = {
  _id: string;
  exercise: string; // "Press banca"
  weight: number; // kg
  reps: number;
  rpe?: number; // 6–10
  rir?: number; // 0–5
  marker?: 'warmup' | 'top' | 'backoff';
  note?: string;
  createdAt: string;
  tags?: LiftTag[];
};

export type WorkoutEntry = {
  _id: string;
  date: string; // YYYY-MM-DD
  sets: LiftSet[];
  createdAt: string;
  updatedAt: string;
};

export type RoutineTemplate = {
  _id: string;
  name: string; // "Full Body A"
  days: Array<{
    name: string; // "Día A"
    blocks: Array<{
      exercise: string;
      tags?: LiftTag[];
      targetScheme?: string; // "5x5 @80%"
      note?: string;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
  favorite?: boolean;
};

export type PrRecord = {
  exercise: string;
  bestWeight: number;
  bestEstimated1RM: number;
  date: string;
};

export type WorkoutWeeklySummary = {
  last7Days: Array<{
    date: string;
    totalSets: number;
    totalVolume: number;
  }>;
  totalVolume: number;
  topVolumeDay: { date: string; totalVolume: number } | null;
  streak: number;
};
export type GroupVolume = { group: LiftTag; sets: number };

// --- Cardio ---
export type CardioType = 'pasos' | 'running' | 'bike' | 'swim';
export type CardioEntry = {
  _id: string;
  date: string;
  type: CardioType;
  minutes: number;
  distanceKm?: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type CardioGoals = {
  dailySteps?: number; // e.g. 10000
  weeklySessions?: number; // e.g. 3
};

export type Badge = { code: string; title: string; unlockedAt: string };

// --- Nutrición ---
export type MealType = 'desayuno' | 'comida' | 'cena' | 'snack';

export type FoodItem = {
  _id: string;
  name: string;
  kcal: number; // por 100g o por unidad (ver unit)
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  unit?: '100g' | 'unidad';
  tags?: string[];
};

export type MealEntry = {
  _id: string;
  date: string; // YYYY-MM-DD
  type: MealType;
  foodName: string;
  amount: number; // gramos o unidades
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
};

export type DailyNutrition = {
  date: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
  meals: MealEntry[];
};

export type NutritionTargets = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number; // objetivo diario de agua
};

export type WeeklyNutritionSummary = {
  days: Array<{
    date: string;
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
    waterMl: number;
  }>;
  avg: { kcal: number; protein: number; carbs: number; fat: number; waterMl: number };
};

export type FoodFavorite = string; // nombre del alimento




// --- Gamificación (catalog & user) ---
// Badge del CATÁLOGO (documento en DB)
export interface BadgeCatalog extends BaseEntity {
  code: string;
  title: string;
  description?: string;
  icon?: string;
  isDeleted?: boolean;
}

// Relación de badge DESBLOQUEADO por un usuario (documento en DB)
export interface UserBadge extends BaseEntity {
  user: string;                          // userId
  badge: BadgeCatalog | string;          // id o documento populado
  unlockedAt: string;
}

// Participación de un usuario en un desafío (documento en DB)
export interface UserChallenge extends BaseEntity {
  user: string;                          // userId
  challenge: Challenge | string;         // id o documento populado
  progress: number;                      // 0–100 (o la escala que uses)
  isCompleted: boolean;
  joinedAt: string;
  completedAt?: string | null;
}
