// src/lib/api/progress/progress.api.ts
import { get } from '../config';

export interface UserProgressDTO {
  completedWorkouts: number;
  totalMinutes: number;
  streakDays: number;
  // Añade aquí más campos si tu UI los usa:
  // xp?: number;
  // level?: number;
  // lastWorkoutAt?: string; // ISO
}

export async function fetchUserProgress() {
  return get<UserProgressDTO>('/api/stats/me');
}
