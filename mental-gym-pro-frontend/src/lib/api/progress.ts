// src/lib/api/progress.ts
import type { UserProgress, Challenge } from '@/types';
import { API, USE_MOCK, getJSON } from './config';

// ===============================
//            MOCKS
// ===============================
export const MOCK_PROGRESS: UserProgress = {
  weeklyData: [5, 8, 12, 10, 15, 18, 20],
  streak: 7,
  totalExercises: 45,
  averageScore: 85,
};

export const MOCK_CHALLENGES: Challenge[] = [
  {
    _id: 'ch-1',
    title: 'Maratón de Memoria',
    description: 'Supera 50 niveles del juego de memoria.',
    objective: 'Completar 50 niveles',
    durationDays: 30,
    isCompleted: false,
    exercises: ['ex_mem_pairs', 'ex_attention_sel', 'ex_calc_fast'],
    expiresAt: '2025-09-01T00:00:00Z',
    participants: 150,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ===============================
//       PROGRESO DEL USUARIO
// ===============================
export async function fetchUserProgress(): Promise<UserProgress> {
  if (USE_MOCK) return MOCK_PROGRESS;

  try {
    // intenta rutas comunes y cae a mock si falla
    return await getJSON<UserProgress>(['/stats/me', '/api/stats/me']);
  } catch (e) {
    console.warn('[fetchUserProgress] backend falló, usando mock:', e);
    return MOCK_PROGRESS;
  }
}

// ===============================
//        DESAFÍOS ACTIVOS
// ===============================
export async function fetchActiveChallenges(): Promise<Challenge[]> {
  if (USE_MOCK) return MOCK_CHALLENGES;

  const tryGet = async (p: string) =>
    fetch(`${API}${p}`, { credentials: 'include' });

  try {
    let res = await tryGet('/challenges/active');
    if (!res.ok) res = await tryGet('/api/challenges/active');
    if (!res.ok) throw new Error('No se pudieron cargar los desafíos activos');

    return (await res.json()) as Challenge[];
  } catch (e) {
    console.warn('[fetchActiveChallenges] backend falló, usando mock:', e);
    return MOCK_CHALLENGES;
  }
}
