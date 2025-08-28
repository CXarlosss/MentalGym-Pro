/* // src/lib/progress/progress.api.ts
import { get } from '../config';
import type { DashboardStats } from '@/types';

export async function fetchUserProgress(): Promise<DashboardStats> {
  // Ajusta si tu backend devuelve otro shape
  return get<DashboardStats>('/stats/me');
}

export async function fetchActiveChallenges() {
  return get('/gamification/challenges/active');
}
 */