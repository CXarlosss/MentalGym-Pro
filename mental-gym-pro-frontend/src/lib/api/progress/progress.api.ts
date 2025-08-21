// src/lib/api/progress/progress.api.ts
import { get } from '../config';
import type { DashboardStats } from '@/types';

export async function fetchUserProgress(): Promise<DashboardStats> {
  // Ajusta si tu backend devuelve otro shape
  return get<DashboardStats>('/api/stats/me');
}

export async function fetchActiveChallenges() {
  return get('/api/gamification/challenges/active');
}
